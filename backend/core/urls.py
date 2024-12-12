"""Project url's"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf.urls.static import static
from django.conf import settings
from .views import (
    CustomTokenRefreshView,
    CustomTokenCreateView,
    LogoutView
)

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='api-schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='api-schema'),
         name='api-docs'),

    path('users', include('users.urls')),
    path('api/', include('api.urls')),

    path('auth/jwt/create/', CustomTokenCreateView.as_view(),
         name='token_create'),

    path('auth/jwt/refresh/', CustomTokenRefreshView.as_view(),
         name='token_refresh'),

    path('auth/jwt/logout/', LogoutView.as_view(), name='token_logout'),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
]


if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
