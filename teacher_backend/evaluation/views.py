"""HTTP endpoint that orchestrates audio transcription and LLM evaluation."""
from __future__ import annotations

import json
import logging
from typing import Any, Mapping

from django.http import HttpRequest, JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from .prompts import CLASSROOM_EVALUATOR_PROMPT, build_user_prompt
from .schemas import LessonContext
from .services import AudioTranscriptionService, LLMEvaluator

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name="dispatch")
class ClassroomAudioEvaluationView(View):
    """Accepts an MP3 upload, transcribes it, and sends it to an LLM."""

    transcription_service_class = AudioTranscriptionService
    evaluator_class = LLMEvaluator

    def post(self, request: HttpRequest, *args, **kwargs):  # type: ignore[override]
        try:
            payload = self._extract_payload(request)
        except ValueError as exc:
            return JsonResponse({"error": str(exc)}, status=400)

        audio_file = request.FILES.get("audio") or request.FILES.get("file")
        if not audio_file:
            return JsonResponse({"error": "Missing audio file upload (use 'audio' field)."}, status=400)

        lesson_context = LessonContext.from_payload(payload.get("metadata") or payload)

        try:
            transcription_service = self.transcription_service_class()
            transcript_text = transcription_service.transcribe(audio_file)
        except Exception as exc:  # pragma: no cover - easier for CLI use
            logger.exception("Failed to transcribe audio")
            return JsonResponse({"error": f"Transcription failed: {exc}"}, status=500)

        try:
            evaluator = self.evaluator_class(system_prompt=CLASSROOM_EVALUATOR_PROMPT)
            user_prompt = build_user_prompt(lesson_context, transcript_text)
            evaluation = evaluator.evaluate(user_prompt)
        except Exception as exc:  # pragma: no cover - depends on external API
            logger.exception("LLM evaluation failed")
            return JsonResponse({"error": f"LLM evaluation failed: {exc}"}, status=502)

        response_body = {
            "metadata": lesson_context.to_prompt_payload(),
            "transcript": transcript_text,
            "evaluation": evaluation,
        }
        return JsonResponse(response_body, status=200, safe=False)

    def _extract_payload(self, request: HttpRequest) -> Mapping[str, Any]:
        content_type = request.META.get("CONTENT_TYPE", "")
        if "application/json" in content_type:
            try:
                body = request.body.decode() or "{}"
                return json.loads(body)
            except json.JSONDecodeError as exc:
                raise ValueError("Invalid JSON body") from exc

        data = request.POST.dict()
        metadata_blob = data.pop("metadata", None)
        if metadata_blob:
            try:
                parsed = json.loads(metadata_blob)
                data.setdefault("metadata", parsed)
            except json.JSONDecodeError:
                logger.warning("metadata field provided but not valid JSON; ignoring")
        return data


__all__ = ["ClassroomAudioEvaluationView"]
