from rest_framework import generics, views, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Contest, Participant, Submission, QuestionPaper
from .serializers import (
    ContestSerializer,
    ParticipantSerializer,
    SubmissionSerializer,
    QuestionPaperSerializer,
)

# ---------- Contest Views ----------

class ContestListView(generics.ListCreateAPIView):
    queryset = Contest.objects.all().order_by('-created_at')
    serializer_class = ContestSerializer
    permission_classes = [AllowAny]  # Anyone can view, authenticated users can create

    def get_permissions(self):
        if self.request.method == 'POST':
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        # Pass request in serializer context so we can access user in serializer
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class ContestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Contest.objects.all()
    serializer_class = ContestSerializer
    permission_classes = [AllowAny]


# ---------- Participant Views ----------

class JoinContestView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        contest = get_object_or_404(Contest, pk=pk)
        user = request.user

        # Check if already joined
        if Participant.objects.filter(contest=contest, userId=user).exists():
            return Response({"message": "Already joined this contest."}, status=400)

        participant = Participant.objects.create(contest=contest, userId=user, payment_status=True)
        return Response(
            {"message": f"Joined contest '{contest.title}' successfully!", "participant_id": participant.id},
            status=201
        )


class ParticipantListView(generics.ListAPIView):
    serializer_class = ParticipantSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Participant.objects.filter(contest_id=self.kwargs['pk']).select_related('userId', 'contest')


# ---------- Submission Views ----------

class SubmissionCreateView(generics.CreateAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        participant = get_object_or_404(Participant, userId=self.request.user, contest_id=self.kwargs['pk'])
        serializer.save(participant=participant)


class SubmissionListView(generics.ListAPIView):
    queryset = Submission.objects.all().select_related('participant')
    serializer_class = SubmissionSerializer
    permission_classes = [AllowAny]


class SubmissionDetailView(generics.RetrieveAPIView):
    queryset = Submission.objects.all().select_related('participant')
    serializer_class = SubmissionSerializer
    permission_classes = [AllowAny]


# ---------- Question Paper ----------

class QuestionPaperView(generics.RetrieveAPIView):
    serializer_class = QuestionPaperSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        return get_object_or_404(QuestionPaper, contest_id=self.kwargs['pk'])


# ---------- Result / Leaderboard ----------

class ContestResultView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        submissions = Submission.objects.filter(participant__contest_id=pk).order_by('-score')
        serializer = SubmissionSerializer(submissions, many=True)
        return Response(serializer.data)


class LeaderboardView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        top_scores = (
            Submission.objects
            .select_related('participant__userId', 'participant__contest')
            .order_by('-score')[:10]
        )
        serializer = SubmissionSerializer(top_scores, many=True)
        return Response(serializer.data)
