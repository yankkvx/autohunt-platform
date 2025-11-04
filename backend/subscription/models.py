from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator
from datetime import timedelta


class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(max_length=500, blank=True)
    additional_ads = models.PositiveIntegerField(
        validators=[MinValueValidator(0)])
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_days = models.PositiveIntegerField(default=30)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['price']

    def __str__(self):
        return f'{self.name} - {self.additional_ads} ads (${self.price})'


class UserSubscription(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(
        SubscriptionPlan, on_delete=models.SET_NULL, null=True, related_name='subscriptions')
    plan_name = models.CharField(max_length=100)
    additional_ads = models.PositiveIntegerField()
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    paypal_order_id = models.CharField(max_length=255, blank=True, null=True)
    paypal_payer_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} - {self.plan_name} ({"Active" if self.is_active else "Expired"})'

    def save(self, *args, **kwargs):
        if not self.end_date and self.plan:
            self.end_date = timezone.now() + timedelta(days=self.plan.duration_days)

        if self.end_date and timezone.now() > self.end_date:
            self.is_active = False

        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return timezone.now() > self.end_date

    @property
    def days_remaining(self):
        if self.is_expired:
            return 0
        delta = self.end_date - timezone.now()
        return delta.days
