# create_superuser.py
from django.contrib.auth import get_user_model
from django.db.utils import OperationalError

User = get_user_model()

try:
    if not User.objects.filter(username="admin").exists():
        User.objects.create_superuser("admin", "admin@example.com", "admin123")
        print("✅ Superuser created successfully.")
    else:
        print("ℹ️ Superuser already exists.")
except OperationalError:
    print("⚠️ Database not ready yet. Skipping superuser creation.")
