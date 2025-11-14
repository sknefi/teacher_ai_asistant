"""Django settings for the classroom audio evaluation backend."""
from __future__ import annotations

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "django-insecure-change-me")
DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"
ALLOWED_HOSTS = [host.strip() for host in os.environ.get("DJANGO_ALLOWED_HOSTS", "*").split(",") if host.strip()]

INSTALLED_APPS = [
    "corsheaders",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "evaluation",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "teacher_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "teacher_backend.wsgi.application"
ASGI_APPLICATION = "teacher_backend.asgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
MEDIA_ROOT = BASE_DIR / "media"
MEDIA_URL = "/media/"

CORS_RAW_ORIGINS = os.environ.get(
    "DJANGO_CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
).strip()

if CORS_RAW_ORIGINS == "*":
    CORS_ALLOW_ALL_ORIGINS = True
    CORS_ALLOWED_ORIGINS: list[str] = []
else:
    CORS_ALLOWED_ORIGINS = [
        origin.strip() for origin in CORS_RAW_ORIGINS.split(",") if origin.strip()
    ]

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
