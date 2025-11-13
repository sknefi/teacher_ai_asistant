"""API routes for classroom evaluation."""
from __future__ import annotations

from django.urls import path

from .views import ClassroomAudioEvaluationView

urlpatterns = [
    path("evaluate/", ClassroomAudioEvaluationView.as_view(), name="classroom-audio-evaluate"),
]
