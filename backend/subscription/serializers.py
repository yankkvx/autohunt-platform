from rest_framework import serializers
from .models import SubscriptionPlan, UserSubscription


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ['id', 'name', 'description', 'additional_ads', 'price',
                  'duration_days', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserSubscriptionSerializer(serializers.ModelSerializer):
    plan_details = SubscriptionPlanSerializer(source='plan', read_only=True)
    days_remaining = serializers.ReadOnlyField()
    is_expired = serializers.ReadOnlyField()

    class Meta:
        model = UserSubscription
        fields = ['id', 'plan', 'plan_details', 'plan_name', 'additional_ads',
                  'start_date', 'end_date', 'is_active', 'days_remaining',
                  'is_expired', 'created_at', 'amount_paid']
        read_only_fields = ['id', 'start_date',
                            'end_date', 'is_active', 'created_at']


class ActivateSubscriptionSerializer(serializers.Serializer):
    """Serializer for activating plan after paypal payment"""
    plan_id = serializers.IntegerField(required=True)
    paypal_order_id = serializers.CharField(required=True, max_length=255)
    paypal_payer_id = serializers.CharField(
        required=True, max_length=255, allow_blank=True)

    def validate_plan_id(self, value):
        try:
            plan = SubscriptionPlan.objects.get(id=value, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            raise serializers.ValidationError('Invalid subscription plan.')
        return value


class RevenueByPeriodSerializer(serializers.Serializer):
    """Serializer for revenue stats by time period"""
    period = serializers.DateTimeField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    count = serializers.IntegerField()


class RevenueByPlanSerializer(serializers.Serializer):
    """Serializer for revenue stats by plan"""
    plan_name = serializers.CharField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    count = serializers.IntegerField()


class RecentSubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for recent subscriptions in admin stats"""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    amount_paid = serializers.SerializerMethodField()

    class Meta:
        model = UserSubscription
        fields = ['id', 'user_email', 'plan_name',
                  'amount_paid', 'created_at', 'is_active']
        read_only_fields = fields

    def get_amount_paid(self, obj):
        # Handle none values for amount_paid
        return str(obj.amount_paid) if obj.amount_paid else '0.00'


class SubscriptionStatsSummarySerializer(serializers.Serializer):
    """Serializer for subscription stats summary"""
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_subscriptions = serializers.IntegerField()
    active_subscriptions = serializers.IntegerField()


class SubscriptionStatsSerializer(serializers.Serializer):
    """Serializer for subscription stats"""
    summary = SubscriptionStatsSummarySerializer()
    revenue_by_period = RevenueByPeriodSerializer(many=True)
    revenue_by_plan = RevenueByPlanSerializer(many=True)
    recent_subscriptions = RecentSubscriptionSerializer(many=True)
