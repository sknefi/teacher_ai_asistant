"""Utilities for turning uploaded audio into text via Whisper."""
from __future__ import annotations

import logging
import os
import tempfile
from pathlib import Path
from typing import BinaryIO, Protocol

from django.core.files.uploadedfile import UploadedFile

from .czech_transcriber import CzechTranscriber

logger = logging.getLogger(__name__)


class ChunkedFile(Protocol):
    """Structural protocol for Django UploadedFile objects."""

    name: str

    def chunks(self, chunk_size: int | None = None):  # pragma: no cover - provided by Django
        ...


class AudioTranscriptionService:
    """Simple wrapper around OpenAI Whisper for synchronous transcription."""

    def __init__(self, model_size: str | None = None, language: str | None = None):
        self.model_size = model_size or os.environ.get("WHISPER_MODEL", "small")
        self.language = language or os.environ.get("WHISPER_LANGUAGE", "cs")
        default_cache = Path(__file__).resolve().parents[2] / ".cache" / "whisper"
        cache_dir = os.environ.get("WHISPER_CACHE_DIR") or default_cache
        fallback_setting = os.environ.get("WHISPER_MODEL_FALLBACKS")
        fallback_models = (
            [m.strip() for m in fallback_setting.split(",") if m.strip()]
            if fallback_setting
            else ["base", "tiny"]
        )
        self.transcriber = CzechTranscriber(
            model_size=self.model_size,
            language=self.language,
            cache_dir=cache_dir,
            fallback_models=fallback_models,
        )

    def transcribe(self, audio_file: UploadedFile | ChunkedFile | BinaryIO) -> str:
        if audio_file is None:
            raise ValueError("audio_file must not be None")

        suffix = Path(getattr(audio_file, "name", "uploaded.mp3")).suffix or ".mp3"
        with tempfile.NamedTemporaryFile(suffix=suffix) as temp_input:
            if hasattr(audio_file, "chunks"):
                for chunk in audio_file.chunks():
                    temp_input.write(chunk)
            else:
                temp_input.write(audio_file.read())  # type: ignore[arg-type]
            temp_input.flush()

            logger.info("Running Whisper transcription for %s", temp_input.name)
            text = self.transcriber.transcribe_path(temp_input.name)

        logger.info("Transcription finished (%d chars)", len(text))
        return text


__all__ = ["AudioTranscriptionService"]
