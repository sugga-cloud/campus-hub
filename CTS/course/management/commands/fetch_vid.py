import os
import django
import requests
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project_name.settings')
django.setup()

from course.models import Course

User = get_user_model()

# Your API key
YOUTUBE_API_KEY = "key"

SEARCH_TERMS = [
    "python full course tutorial",
    "javascript complete course",
    "machine learning full playlist",
    "web development full course",
    "react js full course",
    "data science complete course",
    "java full course",
    "c programming full course",
    "node js full course",
    "ai complete tutorial"
]

TARGET_COUNT = 50
MAX_RESULTS_PER_TERM = 15


class Command(BaseCommand):
    help = "Import YouTube course videos/playlists into Course model"

    def handle(self, *args, **options):
        author, _ = User.objects.get_or_create(
            username="admin",
            defaults={"email": "email", "password": "email"},
        )

        imported_count = 0
        seen_urls = set()

        for term in SEARCH_TERMS:
            if imported_count >= TARGET_COUNT:
                break

            # 1️⃣ Search playlists first — usually represent full courses
            playlist_params = {
                "part": "snippet",
                "q": term,
                "type": "playlist",
                "maxResults": MAX_RESULTS_PER_TERM,
                "key": YOUTUBE_API_KEY,
            }
            self.import_items(playlist_params, author, seen_urls, imported_count, "playlist")

            # 2️⃣ Then search long-form videos
            if imported_count < TARGET_COUNT:
                video_params = {
                    "part": "snippet",
                    "q": term,
                    "type": "video",
                    "maxResults": MAX_RESULTS_PER_TERM,
                    "key": YOUTUBE_API_KEY,
                    "videoDuration": "long",
                }
                self.import_items(video_params, author, seen_urls, imported_count, "video")

            imported_count = len(seen_urls)
            if imported_count >= TARGET_COUNT:
                break

        self.stdout.write(self.style.SUCCESS(f"✅ Completed. Total imported: {imported_count}"))

    def import_items(self, params, author, seen_urls, imported_count, search_type):
        response = requests.get("https://www.googleapis.com/youtube/v3/search", params=params)

        if response.status_code != 200:
            self.stdout.write(
                self.style.ERROR(
                    f"❌ Failed search for '{params['q']}' ({search_type}): {response.status_code} - {response.text}"
                )
            )
            return

        items = response.json().get("items", [])
        for item in items:
            snippet = item.get("snippet", {})
            title = snippet.get("title", "Untitled Course")
            description = snippet.get("description", "")
            thumbnail_url = snippet.get("thumbnails", {}).get("high", {}).get("url", "")

            if "playlistId" in item["id"]:
                playlist_id = item["id"]["playlistId"]
                youtube_url = f"https://www.youtube.com/playlist?list={playlist_id}"
                content_type = "playlist"
            else:
                video_id = item["id"].get("videoId")
                if not video_id:
                    continue
                youtube_url = f"https://www.youtube.com/watch?v={video_id}"
                content_type = "video"

            if youtube_url in seen_urls:
                continue

            seen_urls.add(youtube_url)

            Course.objects.create(
                title=title,
                description=description,
                youtube_url=youtube_url,
                thumbnail_url=thumbnail_url or "",
                content_type=content_type,
                author=author,
                tags=params["q"].replace(" ", ","),
                created_at=timezone.now(),
                updated_at=timezone.now(),
            )

            imported_count += 1
            self.stdout.write(self.style.SUCCESS(f"✅ Imported [{content_type}] {title}"))
