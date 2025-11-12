from rest_framework import serializers
from .models import ForumPost

from .models import Comment

class ForumPostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = ForumPost
        fields = ['id', 'author', 'author_username', 'title', 'content', 'media_link', 
                 'created_at', 'likes', 'dislikes', 'comment_count']
        read_only_fields = ['author', 'likes', 'dislikes']

    def get_comment_count(self, obj):
        return obj.comments.count()


class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    post = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'author_username', 'content', 'created_at']
        read_only_fields = ['post', 'author', 'created_at']
