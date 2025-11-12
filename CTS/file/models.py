from django.db import models
from django.contrib.auth.models import User
import uuid
from django.utils import timezone
from datetime import timedelta


class DriveNode(models.Model):
    """
    Represents both files and folders in a Google Drive-like tree structure.
    """

    # Basic Info
    name = models.CharField(max_length=255)
    is_folder = models.BooleanField(default=False)

    # Google Drive Details
    drive_file_id = models.CharField(max_length=200, unique=True, null=True, blank=True)
    mime_type = models.CharField(max_length=100, null=True, blank=True)
    web_view_link = models.URLField(null=True, blank=True)
    size = models.BigIntegerField(null=True, blank=True)  # in bytes

    # Tree Structure
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        related_name='children',
        on_delete=models.CASCADE
    )

    # Ownership and Timestamps
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='drive_nodes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Drive Node"
        verbose_name_plural = "Drive Nodes"
        ordering = ['name']

    def __str__(self):
        return f"{'📁' if self.is_folder else '📄'} {self.name}"

    def get_path(self):
        """
        Returns the full path from root to this file/folder.
        """
        path = [self.name]
        parent = self.parent
        while parent:
            path.append(parent.name)
            parent = parent.parent
        return '/'.join(reversed(path))

    @property
    def is_root(self):
        return self.parent is None

class ShareLink(models.Model):
    """
    Represents a shareable link for a file or folder
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file_id = models.CharField(max_length=200,null=True)  # Google Drive file ID
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    download_count = models.IntegerField(default=0)
    last_accessed = models.DateTimeField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            # Default expiry of 7 days
            self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        if not self.expires_at:
            return False
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"Share link for {self.file_id} ({'active' if self.is_active and not self.is_expired else 'inactive'})"
