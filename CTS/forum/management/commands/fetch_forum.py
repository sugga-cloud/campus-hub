import requests
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from ...models import ForumPost
from django.utils import timezone
import random

class Command(BaseCommand):
    help = "Fetch 50+ programming-related discussions from Dev.to and import them into ForumPost"

    def handle(self, *args, **options):
        User = get_user_model()
        user, _ = User.objects.get_or_create(
            username="admin",
            defaults={"email": "admin@example.com", "password": "admin123"},
        )

        # Fetch posts from Dev.to API
        url = "https://dev.to/api/articles?tag=programming&top=1&per_page=100"
        self.stdout.write("Fetching data from Dev.to...")
        response = requests.get(url, timeout=10)

        if response.status_code != 200:
            self.stdout.write(self.style.ERROR("Failed to fetch data."))
            return

        data = response.json()
        count = 0

        for article in data:
            title = article.get("title")
            content = article.get("description") or article.get("body_markdown") or "No content"
            media_link = article.get("cover_image") or ""

            if not title or ForumPost.objects.filter(title=title).exists():
                continue  # skip duplicates

            ForumPost.objects.create(
                author=user,
                title=title,
                content=content,
                media_link=media_link,
                created_at=timezone.now(),
                updated_at=timezone.now(),
                likes=random.randint(0, 200),
                dislikes=random.randint(0, 20),
            )
            count += 1

        self.stdout.write(self.style.SUCCESS(f"✅ Successfully imported {count} forum posts."))
