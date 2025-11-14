# Classroom Audio Evaluation Backend

This Django backend exposes a single `/api/evaluate/` endpoint that accepts an MP3 upload plus optional lesson metadata. The server will:

1. Transcribe the audio locally using OpenAI Whisper.
2. Merge the POSTed metadata with sensible defaults.
3. Render the long-form "Classroom Audio Evaluator" rubric prompt and send it, together with the transcript, to an LLM (default `gpt-4o-mini`).
4. Return the LLM's JSON evaluation along with the transcript and resolved metadata.

## Quick start

```bash
cd teacher_backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Environment variables / `.env`

Create `teacher_backend/.env` (copy from `.env.example`) and add at least:

| Variable | Description |
| --- | --- |
| `OPENAI_API_KEY` | API key with access to the configured LLM (or `FEATHERLESS_API_KEY` if using Featherless). |
| `LLM_MODEL` (optional) | Defaults to `gpt-4o-mini`. |
| `WHISPER_MODEL` (optional) | Defaults to `small`. |
| `WHISPER_LANGUAGE` (optional) | Defaults to `cs`. |
| `DJANGO_SECRET_KEY` (optional) | Provide your own in production. |

The `.env` file is loaded automatically by `manage.py`, `asgi.py`, and `wsgi.py` so you don’t have to `export` values manually.

### Endpoint contract

`POST /api/evaluate/`

- **Body**: `multipart/form-data`
  - `audio` (file, required): MP3/WAV/M4A audio.
  - Either individual metadata fields (`teacher_name`, `school_name`, etc.) *or* a single `metadata` JSON string.
- **Response** `200 OK`:

```json
{
  "metadata": { ... resolved metadata ... },
  "transcript": "transcribed text",
  "evaluation": { ... LLM JSON ... }
}
```

Errors are returned as `{ "error": "message" }` with appropriate HTTP status codes.

### Notes

- Whisper and the OpenAI client both rely on system certificates. If you are on macOS and run into SSL issues, point `SSL_CERT_FILE` at your exported trust store or install `certifi` and export `REQUESTS_CA_BUNDLE=...`.
- The LLM response is parsed as JSON when possible. If the model returns malformed JSON, the raw string is returned so the client can decide how to handle it.
- Heavy transcription work should ideally be moved onto a worker queue in production; the current implementation runs inline for simplicity.
