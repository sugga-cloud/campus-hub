from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import ForumPost, Comment, PostReaction
from .serializers import ForumPostSerializer, CommentSerializer

class ForumView(views.APIView):

    def get_permissions(self):
        # Allow GET for everyone, POST for authenticated users only
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, pk=None):
        """
        GET /forum/          -> all posts
        GET /forum/<id>/     -> post by id
        GET /forum/user/     -> all posts of logged-in user
        """
        # GET /forum/user/
        if request.path.endswith('/user/'):
            if not request.user.is_authenticated:
                return Response({"detail": "Authentication required."}, status=401)
            posts = ForumPost.objects.filter(author=request.user)
            serializer = ForumPostSerializer(posts, many=True)
            return Response(serializer.data)

        # GET /forum/<id>/
        if pk:
            post = get_object_or_404(ForumPost, id=pk)
            serializer = ForumPostSerializer(post)
            return Response(serializer.data)

        # GET /forum/
        posts = ForumPost.objects.all().order_by('-id')
        serializer = ForumPostSerializer(posts, many=True)
        return Response(serializer.data)

    def post(self, request):
        """
        POST /forum/ -> create new post
        """
        serializer = ForumPostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentListCreateView(views.APIView):
    """GET /forum/<post_id>/comments/ -> list comments for a post
       POST /forum/<post_id>/comments/ -> create comment (auth required)
    """
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, post_id):
        post = get_object_or_404(ForumPost, id=post_id)
        comments = Comment.objects.filter(post=post).order_by('created_at')
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    def post(self, request, post_id):
        post = get_object_or_404(ForumPost, id=post_id)
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user, post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PostReactionView(views.APIView):
    """POST /forum/<post_id>/like/ or /dislike/ to toggle reactions (auth required)."""
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id, action):
        post = get_object_or_404(ForumPost, id=post_id)
        if action not in ['like', 'dislike']:
            return Response({'detail': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Try to get existing reaction
        try:
            existing_reaction = PostReaction.objects.get(user=request.user, post=post)
            
            if existing_reaction.reaction_type == action:
                # If same reaction, remove it (toggle off)
                if action == 'like':
                    post.likes = max(0, post.likes - 1)
                else:
                    post.dislikes = max(0, post.dislikes - 1)
                existing_reaction.delete()
            else:
                # If different reaction, update it
                if action == 'like':
                    post.likes += 1
                    post.dislikes = max(0, post.dislikes - 1)
                else:
                    post.dislikes += 1
                    post.likes = max(0, post.likes - 1)
                existing_reaction.reaction_type = action
                existing_reaction.save()
                
        except PostReaction.DoesNotExist:
            # No existing reaction, create new one
            PostReaction.objects.create(
                user=request.user,
                post=post,
                reaction_type=action
            )
            if action == 'like':
                post.likes += 1
            else:
                post.dislikes += 1
                
        post.save()
        
        return Response({
            'likes': post.likes,
            'dislikes': post.dislikes
        })
