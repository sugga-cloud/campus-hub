from rest_framework import serializers
from .models import Course

class CourseSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 
            'title', 
            'description', 
            'youtube_url', 
            'thumbnail_url',
            'content_type',
            'author_username',
            'created_at',
            'tags'
        ]
        read_only_fields = ['author_username']