# React Django Oauth (google auth)

## Django setup

1. 首先先安裝 Django & Django rest framework，我習慣在 python 虛擬環境下安裝。
```
pip install django
pip install djangorestframework
pip install djangorestframework-simplejwt
```

2. 建立 Django 專案
```
mkdir django-oauth
cd django-oauth
django-admin startproject django_oauth
```

3. 建立後可以先 migrate 資料庫，直接運行，就可以在 http://127.0.0.1:8000/ 看到 Django 預設畫面
```
cd django_oauth
```

4. 建立一個 Django 的 app，名為 authentication
```
python manage.py startapp authentication
```

5. 需要在 settings.py, INSTALLED_APPS 加入 'authentication'
```
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'authentication',   # add this
]
```

6. 雖然 Django 本身有提供 User 的資料庫，但我們通常需要客製化 User 資料的內容。  
這邊提供一種 Customer User Model 的方法。注意：這種方法只限於用在第一次產生專案。包含在建立 CustomUser 之前都不能 migrate 或是 migration，如果你不小心做了這件事，要記得把所有 migration 還有 migrate 的動作都清空。  
其實官方文件非常推薦在一開始不管有沒有需要 CustomUser，就先建立  
其他方法不限定在初始專案時就建立，可參考官網文件。  
authentication/models.py
```
from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    provider = models.CharField(max_length=200, default='google') # 若未來新增其他的登入方式,如Facebook,GitHub...
    unique_id = models.CharField(max_length=500)    # 提供 oauth 去檢查是否產生過此 user
    title = models.CharField(max_length=300, default='staff')
```

加入 admin
authentication/admin.py
```
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

admin.site.register(CustomUser, UserAdmin)
```

記得設定 AUTH_USER_MODEL  
settings.py
```
AUTH_USER_MODEL = "authentication.CustomUser"
```

migrate 資料庫，並且建立 super user
```
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

運行試試看吧
```
python manage.py runserver
```

至於如何在 django admin 顯示以及提供欄位修改，還需研究

10. 接下來要安裝 django rest framework 以及 jwt authentication
```
# settings.py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'authentication',
    'rest_framework' # add rest_framework
]
```

```
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': ('rest_framework_simplejwt.authentication.JWTAuthentication',)
}
```

```
# add authentication url
# urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('authentication.urls')),
]
```

```
# add authentication/urls.py file
# with this code
from django.urls import path
from rest_framework_simplejwt import views as jwt_views

urlpatterns = [
    path('token/obtain/', jwt_views.TokenObtainPairView.as_view(), name='token_create'),  # override sjwt stock token
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
]
```

用 crul 測試可否拿到 token
利用 super user 當作測試
```
curl --header "Content-Type: application/json" -X POST http://127.0.0.1:8000/api/token/obtain/ --data '{"username":"user","password":"password"}'
```

拿到的 token 有分兩種
- access token
- refresh token

Refresh token
```
curl --header "Content-Type: application/json" -X POST http://127.0.0.1:8000/api/token/refresh/ --data '{"refresh":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTU2MTYyMTg0OSwianRpIjoiYmE3OWUxZTEwOWJkNGU3NmI1YWZhNWQ5OTg5MTE0NjgiLCJ1c2VyX2lkIjoxfQ.S7tDJaaymUUNs74Gnt6dX2prIU_E8uqCPzMtd8Le0VI"}'
```

接著為了在 jwt 中夾帶 user custom data
```
# django_oauth/authentication/serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super(MyTokenObtainPairSerializer, cls).get_token(user)

        # Add custom claims
        token['title'] = user.title
        return token
```

```
# django_oauth/authentication/views.py
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import permissions
from .serializers import MyTokenObtainPairSerializer
class ObtainTokenPairWithCustomView(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = MyTokenObtainPairSerializer
```

```
# change views
# django_oauth/authentication/urls.py
from django.urls import path
from rest_framework_simplejwt import views as jwt_views
from .views import ObtainTokenPairWithCustomView
urlpatterns = [
    path('token/obtain/', ObtainTokenPairWithCustomView.as_view(), name='token_create'),  
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
]
```


Register user

## Google sign in (or other Oauth)
### requirements
```
pip install allauth
pip install django-rest-auth (已不支援)
pip install dj-rest-auth
```

all-auth 第三方登入的資料庫
django rest auth 管理 API 

### settings.py
```
INSTALLED_APPS = [
    ...
    'django.contrib.sites',

    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',

     'dj_rest_auth',
]
```

```
python manage.py migrate
```

### views.py
```
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from rest_auth.registration.views import SocialLoginView

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
```

### urls.py
```
from .views import GoogleLogin

urlpatterns = [
    ...,
    path('rest-auth/google/', GoogleLogin.as_view(), name="google_login"),
]
```

