from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
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
            return Response({'detial': 'Only company accounts can purchase subscription plans.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ActivateSubscriptionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        plan_id = serializer.validated_data['plan_od']
        paypal_order_id = serializer.validated_data['paypal_order_id']
        paypal_payer_id = serializer.validated_data.get('paypal_payer_id', '')

        plan = get_object_or_404(SubscriptionPlan, id=plan_id, is_active=True)

        if UserSubscription.objects.filter(paypal_order_id=paypal_order_id).exists():
            return Response({'detail': 'This payment has already been processed.'}, status=status.HTTP_400_BAD_REQUEST)

        subscription = UserSubscription.objects.create(
            user=user,
            plan=plan,
            plan_name=plan.name,
            addiional_ads=plan.additional_ads,
            end_date=timezone.now() + timezone.timedelta(days=plan.duration_days),
            paypal_order_id=paypal_order_id,
            paypal_payer_id=paypal_payer_id,
            is_active=True
        )

        response_serializer = UserSubscriptionSerializer(subscription)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

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

        stats['activate_subscriptions'] = UserSubscriptionSerializer(
            active_subs, many=True).data

        return Response(stats)
