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
                  'start_date', 'end_date', 'is_active', 'days_remaining', 'is_expired', 'created_at']
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
