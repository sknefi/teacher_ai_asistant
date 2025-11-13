"""Whisper-based Czech transcription helper mirroring the CLI tool."""
from __future__ import annotations

import logging
import os
import shutil
import warnings
from pathlib import Path
from typing import Union

import librosa

logger = logging.getLogger(__name__)

# Suppress FP16 warnings (CPU inference)
warnings.filterwarnings("ignore", message="FP16 is not supported on CPU; using FP32 instead")


class CzechTranscriber:
    """Utility that loads Whisper once and reuses it for multiple files."""

    def __init__(
        self,
        model_size: str = "medium",
        language: str = "cs",
        cache_dir: str | os.PathLike[str] | None = None,
        fallback_models: list[str] | None = None,
    ) -> None:
        self.model_size = model_size
        self.language = language
        default_cache = Path(__file__).resolve().parents[2] / ".cache" / "whisper"
        configured_cache = cache_dir or os.environ.get("WHISPER_CACHE_DIR") or default_cache
        self.cache_dir = Path(configured_cache).expanduser()
        env_fallback = os.environ.get("WHISPER_MODEL_FALLBACKS")
        fallback = fallback_models
        if fallback is None:
            if env_fallback:
                fallback = [m.strip() for m in env_fallback.split(",") if m.strip()]
            else:
                fallback = ["small", "tiny"]
        self.fallback_models = [m for m in fallback if m and m != self.model_size]
        self._model = None

    def _load_model(self) -> None:
        if self._model is not None:
            return
        try:
            import whisper
        except ImportError as exc:  # pragma: no cover - environmental
            raise RuntimeError("openai-whisper must be installed to transcribe audio.") from exc

        self.cache_dir.mkdir(parents=True, exist_ok=True)
        candidates = [self.model_size] + self.fallback_models
        last_exc: RuntimeError | None = None
        for candidate in candidates:
            try:
                logger.info("Loading Whisper %s model (cache: %s)", candidate, self.cache_dir)
                model = self._load_specific_model(candidate)
                self._model = model
                self.model_size = candidate
                logger.info("Whisper model ready (%s)", candidate)
                return
            except RuntimeError as exc:
                logger.error("Failed to load Whisper model %s: %s", candidate, exc)
                last_exc = exc
        raise last_exc or RuntimeError("Unable to load any Whisper model")

    def _load_specific_model(self, model_name: str):
        import whisper  # local import to avoid heavy import unless needed

        try:
            return whisper.load_model(model_name, download_root=str(self.cache_dir))
        except RuntimeError as exc:
            if "checksum" in str(exc).lower():
                logger.warning(
                    "Checksum mismatch detected for %s. Clearing cache and retrying...", model_name
                )
                self._clear_cache()
                return whisper.load_model(model_name, download_root=str(self.cache_dir))
            raise

    def _clear_cache(self) -> None:
        if self.cache_dir.exists():
            shutil.rmtree(self.cache_dir, ignore_errors=True)
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _load_audio_array(self, file_path: Path):
        if not file_path.exists():
            raise FileNotFoundError(f"Audio file not found: {file_path}")
        logger.info("Loading %s and resampling to 16kHz mono", file_path)
        audio_data, _sample_rate = librosa.load(str(file_path), sr=16000, mono=True)
        return audio_data.astype("float32")

    def transcribe_path(self, file_path: Union[str, Path]) -> str:
        """Transcribe an audio file on disk and return plain text."""
        audio_array = self._load_audio_array(Path(file_path))
        return self._transcribe_array(audio_array)

    def _transcribe_array(self, audio_array) -> str:
        self._load_model()
        logger.info("Transcribing waveform with Whisper %s", self.model_size)
        result = self._model.transcribe(  # type: ignore[call-arg]
            audio_array,
            language=self.language,
            verbose=False,
            fp16=False,
        )
        text = result.get("text", "").strip()
        logger.info("Transcription complete (%d chars)", len(text))
        return text


__all__ = ["CzechTranscriber"]
