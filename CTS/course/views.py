from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Course
from .serializers import CourseSerializer
import re

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        youtube_url = serializer.validated_data.get('youtube_url')
        # Extract video ID from YouTube URL
        video_id = None
        if 'youtube.com/watch?v=' in youtube_url:
            video_id = youtube_url.split('watch?v=')[1].split('&')[0]
        elif 'youtube.com/playlist?list=' in youtube_url:
            # For playlists, keep the URL as is
            video_id = youtube_url.split('list=')[1].split('&')[0]
        elif 'youtu.be/' in youtube_url:
            video_id = youtube_url.split('youtu.be/')[1].split('?')[0]

        if video_id:
            # Set thumbnail URL based on video ID
            if 'playlist?list=' in youtube_url:
                thumbnail_url = f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
            else:
                thumbnail_url = f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
            
            serializer.save(
                author=self.request.user,
                thumbnail_url=thumbnail_url
            )
        else:
            serializer.save(author=self.request.user)

    def get_queryset(self):
        queryset = Course.objects.all()
        tag = self.request.query_params.get('tag', None)
        if tag:
            queryset = queryset.filter(tags__icontains=tag)
        return queryset