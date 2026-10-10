from django.urls import path
from django.views.generic import RedirectView
from accounts.views import UserRegistrationView, UserLoginView, TokenRefreshView

urlpatterns = [
    path('', RedirectView.as_view(url='/api/docs/', permanent=False), name='auth-root-redirect'),
    path('register/', UserRegistrationView.as_view(), name='auth-register'),
    path('login/', UserLoginView.as_view(), name='auth-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='auth-token-refresh'),
]
