"""
Django settings for CTS project.
"""

from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# ---------------------------
# SECURITY
# ---------------------------

SECRET_KEY = 'django-insecure-x^=bxt$9rl2_!)6v)$9p(16ec_-t194kushg9gye!$rkskw&q0'
DEBUG = True   # Set to False in production

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "campus-hub-6k38.onrender.com"
]

# ---------------------------
# SESSION & COOKIE SETTINGS
# ---------------------------

SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_COOKIE_NAME = 'sessionid'
SESSION_COOKIE_AGE = 86400  # 24 hours
SESSION_COOKIE_HTTPONLY = True
SESSION_SAVE_EVERY_REQUEST = True

# IMPORTANT FOR GOOGLE OAUTH CROSS-SITE REDIRECT
if not DEBUG:
    # Local development (no HTTPS)
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SAMESITE = 'Lax'
    CSRF_COOKIE_SECURE = False
    SESSION_COOKIE_DOMAIN = None
else:
    # Production (REQUIRED for OAuth)
    SESSION_COOKIE_SAMESITE = 'None'
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SAMESITE = 'None'
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_DOMAIN = "campus-hub-6k38.onrender.com"

# When behind Render reverse proxy
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# ---------------------------
# JWT SETTINGS
# ---------------------------

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ---------------------------
# APPLICATIONS
# ---------------------------

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Your apps
    'file',
    'forum',
    'contest',
    'rest_framework',
    'user',
    'corsheaders',
    'course',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'CTS.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'CTS.wsgi.application'

# ---------------------------
# DATABASE
# ---------------------------

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ---------------------------
# AUTHENTICATION
# ---------------------------

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ---------------------------
# I18N
# ---------------------------

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ---------------------------
# DRF CONFIG
# ---------------------------

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}

# ---------------------------
# CORS & CSRF CONFIG
# ---------------------------

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://educus.netlify.app",
    "https://campus-hub-6k38.onrender.com"
]

CSRF_TRUSTED_ORIGINS = [
    "https://educus.netlify.app",
    "https://campus-hub-6k38.onrender.com",
]

CORS_ALLOW_METHODS = [
    "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
]

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# ---------------------------
# FRONTEND URL
# ---------------------------

FRONTEND_URL = "https://educus.netlify.app"

# ---------------------------
# STATIC FILES
# ---------------------------

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
