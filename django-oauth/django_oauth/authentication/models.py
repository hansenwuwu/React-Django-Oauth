from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    provider = models.CharField(max_length=200, default='google') # 若未來新增其他的登入方式,如Facebook,GitHub...
    unique_id = models.CharField(max_length=500)    # 提供 oauth 去檢查是否產生過此 user
    title = models.CharField(max_length=300, default='staff')