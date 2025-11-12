from rest_framework import serializers
from .models import DriveNode, ShareLink
from django.urls import reverse


class ShareLinkSerializer(serializers.ModelSerializer):
    share_url = serializers.SerializerMethodField()
    node_name = serializers.CharField(source='node.name', read_only=True)
    
    class Meta:
        model = ShareLink
        fields = [
            'id','file_id', 'created_by', 'created_at', 'expires_at',
            'is_active', 'download_count', 'last_accessed', 'share_url'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'download_count', 'last_accessed']

    def get_share_url(self, obj):
        request = self.context.get('request')
        if request:
            url = reverse('shared-file', kwargs={'share_id': obj.id})
            return request.build_absolute_uri(url)
        return None

class DriveNodeSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField(read_only=True)
    path = serializers.SerializerMethodField(read_only=True)
    share_links = ShareLinkSerializer(many=True, read_only=True)
    has_active_share = serializers.SerializerMethodField()

    class Meta:
        model = DriveNode
        fields = [
            'id', 'name', 'is_folder', 'drive_file_id', 'mime_type', 'web_view_link',
            'size', 'parent', 'owner', 'created_at', 'updated_at', 'children', 'path'
        ]
        read_only_fields = ['owner', 'created_at', 'updated_at']

    def get_children(self, obj):
        """List children nodes for folders."""
        return DriveNodeSerializer(obj.children.all(), many=True).data if obj.is_folder else []

    def get_path(self, obj):
        return obj.get_path()
