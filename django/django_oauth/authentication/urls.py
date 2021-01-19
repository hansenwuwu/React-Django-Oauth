from django.urls import path
from rest_framework_simplejwt import views as jwt_views
from .views import ObtainTokenPairWithCutsomView, CustomUserCreate, HelloWorldView, GoogleLogin

urlpatterns = [
    path('user/create/', CustomUserCreate.as_view(), name="create_user"),
    path('token/obtain/', jwt_views.TokenObtainPairView.as_view(), name='token_create'),
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('token/custom_obtain/', ObtainTokenPairWithCutsomView.as_view(), name='token_create_custom'),  # override sjwt stock token
    path('hello/', HelloWorldView.as_view(), name='hello_world'),
    path('dj-rest-auth/google/', GoogleLogin.as_view(), name="google_login"),
]