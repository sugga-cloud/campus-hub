from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    ProfileView, 
    RegisterView, 
    LoginView,
    initiate_google_auth,
    google_oauth_callback
)

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('login', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('update-profile/', ProfileView.as_view(), name='update_profile'),
    
    # Google OAuth endpoints
    path('google/auth', initiate_google_auth, name='google-auth'),
    path('google/callback', google_oauth_callback, name='google-oauth-callback'),
]
