import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

django_asgi_app = get_asgi_application()

from chat.routing import websocket_urlpatterns
from chat.middleware import JWTMiddleware

application = ProtocolTypeRouter({
    'http': django_asgi_app,

    'websocket': AllowedHostsOriginValidator(
        JWTMiddleware(
            URLRouter(
                websocket_urlpatterns
            )
        )
    ),
})
