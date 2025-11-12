from django.db import models

# Create your models here.
class Contest(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    TYPE_CHOICES = [
        ('free', 'Free'),
        ('paid', 'Paid'),
    ]
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('ongoing', 'Ongoing'),
        ('past', 'Past'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='free')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='upcoming')
    deadline = models.DateTimeField()
    duration = models.CharField(max_length=50)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    prize = models.CharField(max_length=200)
    requirements = models.TextField(blank=True)
    rules = models.TextField(blank=True)
    tags = models.JSONField(default=list)
    organizer = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='organized_contests')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
class Participant(models.Model):
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE)
    userId = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    payment_status = models.BooleanField(default=False)
    registered_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.userId.username} - {self.contest.title}"
    
class Submission(models.Model):
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE)
    submission = models.JSONField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    score = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Submission by {self.participant.userId.username} for {self.participant.contest.title}"

class QuestionPaper(models.Model):
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE)
    questions = models.JSONField()
    max_score = models.FloatField()

    def __str__(self):
        return f"Question Paper for {self.contest.title}"

