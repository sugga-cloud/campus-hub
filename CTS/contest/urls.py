from django.urls import path
from django.http import HttpResponse
from . import views

urlpatterns = [
    path('', lambda request: HttpResponse("Welcome to the Contest App")),

    # Contest endpoints
    path('contests/', views.ContestListView.as_view(), name='contest-list'),
    path('contests/<int:pk>/', views.ContestDetailView.as_view(), name='contest-detail'),

    # Participation
    path('contests/<int:pk>/join/', views.JoinContestView.as_view(), name='contest-join'),
    path('contests/<int:pk>/participants/', views.ParticipantListView.as_view(), name='contest-participants'),

    # Submissions
    path('contests/<int:pk>/submit/', views.SubmissionCreateView.as_view(), name='contest-submit'),
    path('submissions/', views.SubmissionListView.as_view(), name='submission-list'),
    path('submissions/<int:pk>/', views.SubmissionDetailView.as_view(), name='submission-detail'),

    # Question paper
    path('contests/<int:pk>/questions/', views.QuestionPaperView.as_view(), name='contest-questions'),

    # Results / leaderboard
    path('contests/<int:pk>/results/', views.ContestResultView.as_view(), name='contest-results'),
    path('leaderboard/', views.LeaderboardView.as_view(), name='leaderboard'),
]
