"""WSGI config for teacher_backend project."""
from __future__ import annotations

import os

from django.core.wsgi import get_wsgi_application

from .env import load_env_file

load_env_file()
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "teacher_backend.settings")

application = get_wsgi_application()
