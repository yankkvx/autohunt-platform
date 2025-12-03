from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.db.models import Sum, Count
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth, TruncYear
from account.models import User
from .models import SubscriptionPlan, UserSubscription
from .serializers import SubscriptionPlanSerializer, UserSubscriptionSerializer, ActivateSubscriptionSerializer, SubscriptionStatsSerializer
from .utils import get_user_ad_stats
from datetime import timedelta
from decimal import Decimal


class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)
        return queryset


class ValidatePurchaseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        if user.account_type != User.ACCOUNT_COMPANY:
            return Response({'detail': 'Only company accounts can purchase subscription plans.'}, status=status.HTTP_403_FORBIDDEN)

        plan_id = request.data.get('plan_id')
        if not plan_id:
            return Response({'detail': 'plan_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        plan = get_object_or_404(SubscriptionPlan, id=plan_id, is_active=True)

        try:
            active_sub = UserSubscription.objects.filter(
                user=user, is_active=True, end_date__gt=timezone.now()).select_related('plan').latest('created_at')
            if active_sub.plan_id == plan_id:
                return Response({'detail': 'You already have an active subscription to this plan.'}, status=status.HTTP_400_BAD_REQUEST)
            if plan.price <= active_sub.plan.price:
                return Response({'detail': 'You can only upgrade current plan, not downgrade it.'}, status=status.HTTP_400_BAD_REQUEST)
        except UserSubscription.DoesNotExist:
            pass

        return Response({'detail': 'Purchase allowed'}, status=status.HTTP_200_OK)


class UserSubscriptionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserSubscription.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def activate(self, request):
        """Activate plan after successfull paypal payment"""
        user = request.user

        if user.account_type != User.ACCOUNT_COMPANY:
            return Response({'detail': 'Only company accounts can purchase subscription plans.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ActivateSubscriptionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        plan_id = serializer.validated_data['plan_id']
        paypal_order_id = serializer.validated_data['paypal_order_id']
        paypal_payer_id = serializer.validated_data.get('paypal_payer_id', '')

        plan = get_object_or_404(SubscriptionPlan, id=plan_id, is_active=True)

        if UserSubscription.objects.filter(paypal_order_id=paypal_order_id).exists():
            return Response({'detail': 'This payment has already been processed.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            active_sub = UserSubscription.objects.filter(
                user=user, is_active=True, end_date__gt=timezone.now()).select_related('plan').latest('created_at')
            if active_sub.plan_id == plan_id:
                return Response({'detail': 'You already have an active subscription to this plan.'}, status=status.HTTP_400_BAD_REQUEST)
            if plan.price <= active_sub.plan.price:
                return Response({'detail': 'You can only upgrade current plan, not downgrade it.'}, status=status.HTTP_400_BAD_REQUEST)
        except UserSubscription.DoesNotExist:
            pass

        with transaction.atomic():
            deactivated_count = UserSubscription.objects.filter(
                user=user, is_active=True, end_date__gt=timezone.now()).update(is_active=False)

            subscription = UserSubscription.objects.create(
                user=user,
                plan=plan,
                plan_name=plan.name,
                additional_ads=plan.additional_ads,
                end_date=timezone.now() + timezone.timedelta(days=plan.duration_days),
                paypal_order_id=paypal_order_id,
                paypal_payer_id=paypal_payer_id,
                amount_paid=plan.price,
                is_active=True
            )

        response_serializer = UserSubscriptionSerializer(subscription)
        response_data = response_serializer.data

        if deactivated_count > 0:
            response_data['detail'] = f'Previous subscription deactivated. New subscription activated.'
        else:
            response_data['detail'] = f'Subscription activated successfully.'
        return Response(response_data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def active(self, request):
        active_subs = self.get_queryset().filter(
            is_active=True, end_date__gt=timezone.now())
        serializer = self.get_serializer(active_subs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        stats = get_user_ad_stats(request.user)

        active_subs = self.get_queryset().filter(
            is_active=True, end_date__gt=timezone.now())

        stats['active_subscriptions'] = UserSubscriptionSerializer(
            active_subs, many=True).data

        return Response(stats)


class SubscriptionStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        period = request.query_params.get('period', 'month')

        all_subscriptions = UserSubscription.objects.all()

        # Sum of all payments
        total_revenue = all_subscriptions.aggregate(
            total=Sum('amount_paid'))['total'] or Decimal('0.00')

        # Total number of subscriptions
        total_subscriptions = all_subscriptions.count()

        # Nuber of currently active subscriptions
        active_subscriptions = all_subscriptions.filter(
            is_active=True, end_date__gt=timezone.now()).count()

        # Choose how to group dates depending on the selected period
        if period == 'day':
            trunc_func = TruncDay
            date_from = timezone.now() - timedelta(days=30)  # last 30 days
        elif period == 'week':
            trunc_func = TruncWeek
            date_from = timezone.now() - timedelta(weeks=12)  # last 12 weeks
        elif period == 'year':
            trunc_func = TruncYear
            date_from = timezone.now() - timedelta(days=365)  # last 365 days
        else:
            trunc_func = TruncMonth
            date_from = timezone.now() - timedelta(days=365)

        revenue_by_period = (
            all_subscriptions
            
            .filter(created_at__gte=date_from) # Take subscriptions from selected time range
            .annotate(period=trunc_func('created_at')) # Create new field period by truncating created_at
            .values('period') # Keep only period field in the result
            .annotate(revenue=Sum('amount_paid'), count=Count('id')) # For each period calculate sum of amoint_paid and number of subscriptions
            .order_by('period') # Sort by period
        )

        revenue_by_plan = (
            all_subscriptions
            .values('plan_name') # Group by plan name
            .annotate(revenue=Sum('amount_paid'), count=Count('id')) # For each plan name calculate total revenue and number of subscriptions
            .order_by('-revenue') # Sort plans by revenue
        )

        # Last 10 subscriptions
        recent_subscriptions = all_subscriptions.select_related(
            'user', 'plan').order_by('-created_at')[:10]

        stats_data = {
            'summary': {
                'total_revenue': str(total_revenue),
                'total_subscriptions': total_subscriptions,
                'active_subscriptions': active_subscriptions,
            },
            'revenue_by_period': list(revenue_by_period),
            'revenue_by_plan': list(revenue_by_plan),
            'recent_subscriptions': recent_subscriptions
        }

        serializer = SubscriptionStatsSerializer(stats_data)
        return Response(serializer.data, status=status.HTTP_200_OK)
