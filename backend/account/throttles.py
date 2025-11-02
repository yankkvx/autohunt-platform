from rest_framework.throttling import UserRateThrottle, AnonRateThrottle


class AuthThrottle(AnonRateThrottle):
    scope = 'auth'


class RegisterThrottle(AnonRateThrottle):
    scope = 'register'


class UploadThrottle(UserRateThrottle):
    scope = 'upload'


class CreateAdThrottle(UserRateThrottle):
    scope = 'create_ad'


class MessageThrottle(UserRateThrottle):
    scope = 'messages'
