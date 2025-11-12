from django.urls import path
from .views import ForumView, CommentListCreateView, PostReactionView

urlpatterns = [
    path('forum/', ForumView.as_view(), name='forum-list-create'),       # GET all, POST new
    path('forum/<int:pk>/', ForumView.as_view(), name='forum-detail'),   # GET by ID
    path('forum/user/', ForumView.as_view(), name='forum-user'),         # GET user’s posts

    # Comments
    path('forum/<int:post_id>/comments/', CommentListCreateView.as_view(), name='forum-comments'),

    # Reactions
    path('forum/<int:post_id>/<str:action>/', PostReactionView.as_view(), name='forum-reaction'),
]
