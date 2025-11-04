from django.utils import timezone
from account.models import User
from .models import UserSubscription

DEFAULT_PRIVATE_LIMIT = 5
DEFAULT_COMPANY_LIMIT = 10


def get_user_ad_limit(user):
    if user.account_type == User.ACCOUNT_COMPANY:
        base_limit = DEFAULT_COMPANY_LIMIT
    else:
        base_limit = DEFAULT_PRIVATE_LIMIT

    if user.account_type == User.ACCOUNT_COMPANY:
        active_subs = UserSubscription.objects.filter(
            user=user,
            is_active=True,
            end_date__gt=timezone.now()
        )
        additional_ads = sum(sub.additional_ads for sub in active_subs)
        return base_limit + additional_ads

    return base_limit


def get_user_ad_usage(user):
    return user.ads.count()


def can_user_create_ad(user):
    limit = get_user_ad_limit(user)
    usage = get_user_ad_usage(user)
    return usage < limit


def get_user_ad_stats(user):
    limit = get_user_ad_limit(user)
    usage = get_user_ad_usage(user)

    return {
        'limit': limit,
        'usage': usage,
        'remaining': max(0, limit-usage),
        'can_create': usage < limit,
        'account_type': user.account_type,
    }
