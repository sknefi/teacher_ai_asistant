# Classroom Audio Evaluation Backend — Project Brief

## Purpose

This service helps instructional coaches analyze classroom audio. A teacher (or admin) uploads an MP3 plus lesson context; the backend transcribes it with Whisper, feeds the transcript and metadata into a detailed “Classroom Audio Evaluator” prompt, and returns JSON scores aligned to multiple classroom-observation rubrics. It enables faster, evidence-based feedback without reviewing full recordings manually.

## High-level Architecture

| Layer | Responsibility | Key Files |
| --- | --- | --- |
| HTTP API (Django) | Handles `/api/evaluate/` requests, validates payloads, returns JSON | `teacher_backend/evaluation/views.py`, `teacher_backend/teacher_backend/urls.py` |
| Transcription Service | Runs Whisper locally, handles resampling and caching | `teacher_backend/evaluation/services/czech_transcriber.py`, `transcription.py` |
| Prompt + Evaluation | Holds prompt template, formats metadata, calls the LLM provider | `teacher_backend/evaluation/prompts.py`, `schemas.py`, `services/evaluator.py` |
| Configuration | `.env` loader, settings, requirements | `teacher_backend/.env`, `.env.example`, `settings.py`, `requirements.txt` |

**Request flow**
1. Frontend uploads `multipart/form-data` with an `audio` file and metadata fields (or a JSON blob).
2. `ClassroomAudioEvaluationView` persists the upload to a temp file and passes it to `AudioTranscriptionService`.
3. `CzechTranscriber` loads Whisper (cached checkpoints under `teacher_backend/.cache/whisper/`), resamples the audio, and returns text.
4. Metadata is merged with defaults via `LessonContext`, and `build_user_prompt` injects the transcript.
5. `LLMEvaluator` submits the prompt to the configured model (OpenAI by default; ready to swap to Featherless once API details are provided).
6. API response bundles `{ metadata, transcript, evaluation }`.

## Endpoint & Contract

- `POST /api/evaluate/`
  - Form fields: `audio` file (required) plus either per-field metadata (`teacher_name`, `subject`, etc.) or a `metadata` JSON string.
  - Response: `200 OK` with the normalized metadata, Whisper transcript, and LLM evaluation JSON; non-2xx responses carry `{ "error": "…" }`.
  - Health probe: `GET /health/` returns `{ "status": "ok" }`.

## Configuration & Environment

1. Copy `teacher_backend/.env.example` to `.env` and fill:
   - `OPENAI_API_KEY` (or `FEATHERLESS_API_KEY` once the integration is finalized)
   - `LLM_MODEL` (`gpt-4o-mini` default)
   - Optional: `WHISPER_MODEL`, `WHISPER_LANGUAGE`, `DJANGO_SECRET_KEY`
2. Virtual environment (repo root):
   ```bash
   cd teacher_backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
3. Initialize DB and runserver:
   ```bash
   python manage.py migrate
   python manage.py runserver 0.0.0.0:8000
   ```
4. Curl demo:
   ```bash
   curl -X POST http://127.0.0.1:8000/api/evaluate/ \
     -F "audio=@/path/to/lesson.mp3" \
     -F 'metadata={"teacher_name":"Ms. Novak","subject":"Math","age_group":"Upper primary (9–11 years)"}'
   ```

Whisper downloads its checkpoint the first time it runs; caches live under `teacher_backend/.cache/whisper/` (configurable via `WHISPER_CACHE_DIR`).

## Key Dependencies

- Python 3.12+
- Django 5.2
- openai ≥ 1.40 (or Featherless API client when available)
- openai-whisper, librosa, soundfile (transcription stack)
- NumPy/SciPy/torch (pulled in by Whisper)

## Presentation Talking Points

1. **Problem & Outcome** – Teachers upload real classroom audio; the system returns rubric-aligned insights within minutes.
2. **Architecture** – Highlight modular services (transcription vs. evaluation) and why Django suits the API needs.
3. **Demo Flow** – Show `curl` upload → watch logs (Whisper download once, “Transcription complete…” log, LLM call) → inspect JSON response.
4. **Prompting Strategy** – Emphasize the strict JSON schema and evidence-based rules baked into `prompts.py`.
5. **Extensibility** – Swap LLM providers, plug in task queues, or add authentication without changing core logic.
6. **Known Constraints** – CPU-bound Whisper inference, large model downloads, dependence on LLM quotas; discuss future work (GPU support, async jobs, UI).

## Future Enhancements

- Background job queue (Celery/RQ) for long-running transcriptions.
- Persistent storage of transcripts/evaluations with teacher dashboards.
- BYO-LLM abstraction (OpenAI, Featherless, local models) selected via config.
- Speaker diarization to auto-label TEACHER/STUDENT voices before evaluation.
- Automated unit/integration tests (currently manual due to heavy dependencies).

Use this document as the narrative backbone for stakeholder presentations or onboarding new contributors.
