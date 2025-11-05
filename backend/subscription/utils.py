from django.utils import timezone
from account.models import User
from .models import UserSubscription

DEFAULT_PRIVATE_LIMIT = 5
DEFAULT_COMPANY_LIMIT = 10


def get_user_ad_limit(user):
    if user.account_type == User.ACCOUNT_COMPANY:
        base_limit = DEFAULT_COMPANY_LIMIT
        try:
            active_subs = UserSubscription.objects.filter(
                user=user,
                is_active=True,
                end_date__gt=timezone.now()
            ).latest('created_at')
            return base_limit + active_subs.additional_ads
        except UserSubscription.DoesNotExist:
            return base_limit
    else:
        return DEFAULT_PRIVATE_LIMIT


def get_user_ad_usage(user):
    return user.ads.count()


def can_user_create_ad(user):
    limit = get_user_ad_limit(user)
    usage = get_user_ad_usage(user)
    return usage < limit


def get_user_ad_stats(user):
    limit = get_user_ad_limit(user)
    usage = get_user_ad_usage(user)

    stats = {
        'limit': limit,
        'usage': usage,
        'remaining': max(0, limit-usage),
        'can_create': usage < limit,
        'account_type': user.account_type,
    }

    if user.account_type == User.ACCOUNT_COMPANY:
        try:
            active_sub = UserSubscription.objects.filter(
                user=user, is_active=True, end_date__gt=timezone.now()).select_related('plan').latest('created_at')
            stats['has_active_subscription'] = True
            stats['subscription_plan'] = active_sub.plan_name
            stats['subscription_additional_ads'] = active_sub.additional_ads
            stats['subscription_days_remaining'] = active_sub.days_remaining
        except UserSubscription.DoesNotExist:
            stats['has_active_subscription'] = False
            stats['subscription_additional_ads'] = 0

    return stats
