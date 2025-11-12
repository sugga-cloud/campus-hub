from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.db import models

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, null=True)
    logo = models.TextField(blank=True, null=True,default='https://example.com/default_logo.png')
    google_drive_credentials = models.JSONField(blank=True, null=True)
    google_drive_folder_id = models.CharField(max_length=100, blank=True, null=True)
    
    def __str__(self):
        return self.user.username
    
    @property
    def has_google_drive(self):
        return bool(self.google_drive_credentials)
    
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
