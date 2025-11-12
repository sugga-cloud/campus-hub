# users/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

# serializer.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        data['user'] = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "date_joined": self.user.date_joined.strftime("%Y-%m-%d %H:%M:%S"),  # formatted date
        }

        profile = getattr(self.user, 'profile', None)
        if profile:
            data['user']['profile'] = {
                "bio": profile.bio,
                "has_google_drive": profile.has_google_drive,
                "google_drive_folder_id": profile.google_drive_folder_id,
            }

        return data


class UserProfileSerializer(serializers.ModelSerializer):
    has_google_drive = serializers.BooleanField(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['bio', 'has_google_drive', 'google_drive_folder_id']
        read_only_fields = ['google_drive_folder_id']

    def create(self, validated_data):
        return UserProfile.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.bio = validated_data.get('bio', instance.bio)
        instance.save()
        return instance

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)  # Nested serializer
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'profile']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
