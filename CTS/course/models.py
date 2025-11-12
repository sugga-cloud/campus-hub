from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Course(models.Model):
    TYPES = (
        ('video', 'Single Video'),
        ('playlist', 'Playlist'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    youtube_url = models.URLField()
    thumbnail_url = models.URLField(blank=True)
    content_type = models.CharField(max_length=10, choices=TYPES)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tags = models.CharField(max_length=255, blank=True, help_text="Comma-separated tags")

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']