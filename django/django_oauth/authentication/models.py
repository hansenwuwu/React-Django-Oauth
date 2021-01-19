from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    title = models.CharField(max_length=300, default='staff')