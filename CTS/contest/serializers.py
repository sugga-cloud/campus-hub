from rest_framework import serializers
from .models import Contest, Participant, Submission, QuestionPaper

# -------- Contest Serializer --------
class ContestSerializer(serializers.ModelSerializer):
    organizer_username = serializers.CharField(source='organizer.username', read_only=True)
    participants_count = serializers.SerializerMethodField()

    class Meta:
        model = Contest
        fields = [
            'id', 'title', 'description', 'type', 'status', 'deadline',
            'duration', 'difficulty', 'prize', 'requirements', 'rules',
            'tags', 'organizer', 'organizer_username', 'created_at',
            'updated_at', 'participants_count'
        ]
        read_only_fields = ['organizer', 'status', 'participants_count']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['organizer'] = request.user
        return super().create(validated_data)

    def get_participants_count(self, obj):
        return obj.participant_set.count()


# -------- Participant Serializer --------
class ParticipantSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='userId.username', read_only=True)
    contest_title = serializers.CharField(source='contest.title', read_only=True)

    class Meta:
        model = Participant
        fields = ['id', 'contest', 'contest_title', 'userId', 'username', 'payment_status', 'registered_at']


# -------- Submission Serializer --------
class SubmissionSerializer(serializers.ModelSerializer):
    participant_name = serializers.CharField(source='participant.userId.username', read_only=True)
    contest_title = serializers.CharField(source='participant.contest.title', read_only=True)

    class Meta:
        model = Submission
        fields = ['id', 'participant', 'participant_name', 'contest_title', 'submission', 'submitted_at', 'score']


# -------- QuestionPaper Serializer --------
class QuestionPaperSerializer(serializers.ModelSerializer):
    contest_title = serializers.CharField(source='contest.title', read_only=True)

    class Meta:
        model = QuestionPaper
        fields = ['id', 'contest', 'contest_title', 'questions', 'max_score']
