"""Utilities for turning uploaded audio into text via Whisper."""
from __future__ import annotations

import logging
import os
import tempfile
from pathlib import Path
from typing import BinaryIO, Protocol

from django.core.files.uploadedfile import UploadedFile

logger = logging.getLogger(__name__)


class ChunkedFile(Protocol):
    """Structural protocol for Django UploadedFile objects."""

    name: str

    def chunks(self, chunk_size: int | None = None):  # pragma: no cover - provided by Django
        ...


class AudioTranscriptionService:
    """Simple wrapper around OpenAI Whisper for synchronous transcription."""

    def __init__(self, model_size: str | None = None, language: str | None = None):
        self.model_size = model_size or os.environ.get("WHISPER_MODEL", "medium")
        self.language = language or os.environ.get("WHISPER_LANGUAGE", "cs")
        self._model = None

    def _ensure_model(self) -> None:
        if self._model is not None:
            return
        try:
            import whisper
        except ImportError as exc:  # pragma: no cover - runtime feedback
            raise RuntimeError(
                "openai-whisper is required for transcription. Install it inside your virtualenv."
            ) from exc
        logger.info("Loading Whisper model '%s'", self.model_size)
        self._model = whisper.load_model(self.model_size)

    def transcribe(self, audio_file: UploadedFile | ChunkedFile | BinaryIO) -> str:
        if audio_file is None:
            raise ValueError("audio_file must not be None")

        self._ensure_model()

        suffix = Path(getattr(audio_file, "name", "uploaded.mp3")).suffix or ".mp3"
        with tempfile.NamedTemporaryFile(suffix=suffix) as temp_input:
            if hasattr(audio_file, "chunks"):
                for chunk in audio_file.chunks():
                    temp_input.write(chunk)
            else:
                temp_input.write(audio_file.read())  # type: ignore[arg-type]
            temp_input.flush()

            logger.info("Running Whisper transcription for %s", temp_input.name)
            transcription = self._model.transcribe(temp_input.name, language=self.language)

        text = transcription.get("text", "").strip()
        logger.info("Transcription finished (%d chars)", len(text))
        return text


__all__ = ["AudioTranscriptionService"]
