# React Django JWT authentication & social authentication (Google sign in)

本篇提供給需要實作使用者登入機制(以 JWT 登入為主)，以及第三方登入機制的人使用!  
實現 React 作為 frontend，Django 作為 backend，使用 JWT 登入驗證，以及 Oauth (本篇先用 google sign in 為範例)。  
此篇聚焦在 JWT 登入以及 Oauth 實作上面，需要對於 React 以及 Django 有些基礎認識。  

## Requirements
- React (稍微了解，能夠實作官方範例)  
- Django (稍微了解，能夠實作官方範例)  
- JWT 基本概念  
- Oauth 基本概念  

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

## Outline
- Django 設定<a href="#django-設定"> :paperclip:</a>
- 加入 django-rest-framework 以及 JWT
- 建立 React 專案

## Django 設定

### 安裝所需套件
```
pip install django
pip install djangorestframework
pip install djangorestframework-simplejwt       # JWT authentication
pip install django-cors-headers                 # CORS 跨域
pip install django-allauth                      # 第三方驗證
pip install dj-rest-auth                        # 第三方驗證 API，和 django-allauth 搭配使用
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

將 app 加入 INSTALLED_APPS 中
```
# setting.py
INSTALLED_APPS = [
    ...
    'authentication',   # add this
]
```

