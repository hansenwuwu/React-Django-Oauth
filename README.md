# React Django JWT authentication & social authentication (Google sign in)

本篇提供給需要實作使用者登入機制(以 JWT 登入為主)，以及第三方登入機制的人使用!  
實現 React 作為 frontend，Django 作為 backend，使用 JWT 登入驗證，以及 Oauth (本篇先用 google sign in 為範例)。  
此篇聚焦在 JWT 登入以及 Oauth 實作上面，需要對於 React 以及 Django 有些基礎認識。  
***
## Requirements
- React 
- Django 
- JWT
- Oauth 
***
## Project structure
```
.
├── django                     
│   └── django_oauth          # Django 專案資料夾，專案名稱為 django_oauth
│       ├── authentication    # authentication app，負責提供 JWT 登入 api  
│       └── django_oauth                 
└── react                     
    └── frontend              # React 專案資料夾
```
***
## Outline
- <a href="#django-設定">Django 設定</a>
- <a href="#django-rest-framework-and-JWT">Django-rest-framework and JWT</a>
- 建立 React 專案
***
## Django 設定

### Package
```
pip install django
```

### 建立 Django 專案
:warning: 注意: 這邊先都不要 migrate，後續有 custom user model 需要設置，不可以先 migrate
```
mkdir django
cd django
django-admin startproject django_oauth
```

### 建立 authentication App
```
cd django_oauth
python manage.py startapp authentication
```

將 authentication app 加入 INSTALLED_APPS 中
```
# setting.py
INSTALLED_APPS = [
    ...
    'authentication',
]
```
***
### 建立 Custom user model (Optional)
雖然 Django 本身有提供 User 預設的schema，但我們通常需要客製化 User 資料的內容，例如增加職位, 個人喜好等等的資料。  
這邊提供一種建立 Customer User Model 的方法。注意：這種方法只限於用在第一次產生專案。包含在建立 CustomUser 之前都不能 migrate 或是 migration，如果你不小心做了這件事，要記得把所有 migration 還有 migrate 的動作都清空。  
其實官方文件非常推薦在一開始不管有沒有需要 Custom User model，就都先建立，但不知道為什麼沒有將他寫的更明顯或是在 get started 時就叫我們做(?)。  
還有其他方法不限定在初始專案時就建立，可參考官網文件(https://docs.djangoproject.com/en/3.1/topics/auth/customizing/)。  
  
首先在 authentication app 裡的 model.py 建立 CustomUser  
title 就是我想要在 user model 裡面自己新增的欄位，並給上預測值 staff
```
# authentication/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    title = models.CharField(max_length=300, default='staff')
```
註冊 custom user 到 admin
```
# authentication/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

admin.site.register(CustomUser, UserAdmin)
```
最後在 settings.py 加上 AUTH_USER_MODEL
```
# settings.py
AUTH_USER_MODEL = "authentication.CustomUser"
```

### 執行 Django
上述所有步驟都完成後，就能開始你的 django 拉～
```
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser    
python manage.py runserver
```

***

## Django-rest-framework and JWT

### 安裝 package
```
pip install djangorestframework
pip install djangorestframework-simplejwt       # JWT authentication for drf
```
  
### 將 'rest_framework' 加到 INSTALLED_APPS
```
# settings.py
INSTALLED_APPS = [
    ...
    'rest_framework',
]
```
  
### 在 settings.py 中加入 authentication 的 class
```
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': ('rest_framework_simplejwt.authentication.JWTAuthentication',)
}
```
  
### 加入 url
```
# django_oauth/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    ...
    path('api/', include('authentication.urls')),
]
```

### 加入 jwt url
```
# authentication/urls.py
from django.urls import path
from rest_framework_simplejwt import views as jwt_views

urlpatterns = [
    path('token/obtain/', jwt_views.TokenObtainPairView.as_view(), name='token_create'),
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
]
```

### migrate
```
python manage.py migrate
```

### 實測
用 curl 測試，帶入剛剛 create super user 的帳號密碼，也可以用自己另外建立的帳號。
```
curl --header "Content-Type: application/json" -X POST http://localhost:8000/api/token/obtain/ --data '{"username":"username","password":"password"}'
```

或是用 postman 測試
![Alt text](/src/obtain_token_jwt.png)
  
帳號密碼正確後，會得到一組 access_token, refresh_token


```
pip install django-cors-headers                 # CORS 跨域
pip install django-allauth                      # 第三方驗證
pip install dj-rest-auth                        # 第三方驗證 API，和 django-allauth 搭配使用
```
