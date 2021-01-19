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
- <a href="#react-設定">React 設定</a>
- <a href="#google-sign-in-設定">Google sign in 設定</a>
- <a href="#django-oauth">Django Oauth</a>
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
這邊說明如何用 django 實作 JWT 驗證機制
詳細 JWT 為何請見官方說明(https://jwt.io/introduction)

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

### 實測 obtain token
用 curl 測試，帶入剛剛 create super user 的帳號密碼，也可以用自己另外建立的帳號。
```
curl --header "Content-Type: application/json" -X POST http://localhost:8000/api/token/obtain/ --data '{"username":"username","password":"password"}'
```
  
postman:
![Alt text](/src/obtain_token_jwt.png)
  
帳號密碼正確後，會得到一組 access_token, refresh_token
- access token: client 端可以用這組 token 來向 server 索取資料，而 server 也利用這組來判斷 client 是否有被授權。時效通常不長。
- refresh token: refresh token 是用來索取 access token 的。當 access token 過期時, 或是存取新的 resource 時，會用來索取 access token。時效通常比較長。
關於為什麼明明 refresh token 也有辦法得到 access token 了，那幹嘛還要兩種 token 呢? 網路上有很多解釋，主要原因是為了安全因素，refresh token 只跟 authentication server 互動，而 access token 會需要跟一個或多個 resource server 互動，因此 access token 有比較大的機率暴露在危險之下，因此 access token 的時效設定為比較短，直到 access token 到期後，再用 refresh token 跟 authentication 再要一次 access token。
  
  
### 實測 refresh token
可以用 refresh token 去重新索取 access token
curl:
```
curl --header "Content-Type: application/json" -X POST http://localhost:8000/api/token/refresh/ --data '{"refresh":"your refresh token here"}'
```
  
postman:
![Alt text](/src/refresh_token_jwt.png)
  
### 實測 authentication
在 views.py 中新增一個 HelloWorldView  
回傳 "hello world" 的 message 還有使用者名稱跟 title
```
# authentication/views.py

from rest_framework.views import APIView
class HelloWorldView(APIView):
    def get(self, request):
        user = request.user
        return Response(data={"message":"hello world", "user": user.username, "title": user.title}, status=status.HTTP_200_OK)
```  
add url
```
# authentication/urls.py

from .views import HelloWorldView
urlpatterns = [
    ...
    path('hello/', HelloWorldView.as_view(), name='hello_world'),
]
```
  
postman 實測:
直接呼叫此API的話，會跳出沒有 authentication 的錯誤，因為我們還沒登入
![Alt text](/src/test_hello.png)

接著在 header 裡面加上我們剛剛拿到的 access token
如此就能登入並且拿到資料囉
{
    "Authorization": Bearer {access token}
}
![Alt text](/src/test_hello_withAuth.png)


### 在 JWT 中帶入額外資訊
新增 serializers.py，把新增的 title 欄位也顯示在 JWT 資料中
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
  
加上 ObtainTokenPairWithCustomView
```
# django_oauth/authentication/views.py

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer

class ObtainTokenPairWithCustomView(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = MyTokenObtainPairSerializer
```
  
加上 url
```
# django_oauth/authentication/urls.py

from .views import ObtainTokenPairWithCustomView

urlpatterns = [
    ... 
    path('token/custom_obtain/', ObtainTokenPairWithCutsomView.as_view(), name='token_create_custom'),
]
```
  
驗證：
同樣用 curl 並帶入帳號密碼去索取 access token
```
curl --header "Content-Type: application/json" -X POST http://localhost:8000/api/token/custom_obtain/ --data '{"username":"username","password":"password"}'
```

接著把 access token 放到官方 debugger 去看內容是否帶有 title 資料了 (https://jwt.io/)
可以看到圖中右方，payload 裡面有 title 了  
![Alt text](/src/custom_obtain_token.png)
  
## React 設定
### 建立 react 專案
```
npx create-react-app frontend
cd frontend
npm start
```

### 新增頁面


## Google sign in 設定
這邊以 Google sign in 為範例  
先到 google developer console 申請 (https://console.developers.google.com/)  
  
1. 新增專案
2. 輸入 project name
3. create
![Alt text](/src/create_project.png)
  
4. 到"憑證"頁面
5. 建立憑證 -> 選 "Oauth 用戶端 ID"
6. 應用程式類型選"網頁應用程式"
7. 輸入名稱
8. 輸入已授權的 JavaScript 來源以及重新導向 URI，填入 react 的網址(注意這邊要填localhost，因為google signin 只會辨別域名)
![Alt text](/src/web_client.png)

9. 記下 "用戶端 ID"
![Alt text](/src/oauth_client.png)

## Django Oauth

```
pip install django-cors-headers                 # CORS 跨域
pip install django-allauth                      # 第三方驗證
pip install dj-rest-auth                        # 第三方驗證 API，和 django-allauth 搭配使用
```

