from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from account.models import User
from .models import SubscriptionPlan, UserSubscription
from .serializers import SubscriptionPlanSerializer, UserSubscriptionSerializer, ActivateSubscriptionSerializer
from .utils import get_user_ad_stats


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
