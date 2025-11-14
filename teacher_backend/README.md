# Classroom Audio Evaluation Backend

This Django backend exposes a single `/api/evaluate/` endpoint that accepts an MP3 upload plus optional lesson metadata. The server will:

1. Transcribe the audio locally using OpenAI Whisper.
2. Merge the POSTed metadata with sensible defaults.
3. Render the long-form "Classroom Audio Evaluator" rubric prompt and send it, together with the transcript, to an LLM (default `gpt-4o-mini`).
4. Return the LLM's JSON evaluation along with the transcript and resolved metadata.

## Quick start

1. Clone the repo and move into `teacher_backend/`.
2. Create/fill `.env` (see below) with your API keys.
3. Create a virtualenv and install deps:

    ```bash
    cd teacher_backend
    python -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    ```

4. Run migrations and start the dev server:

    ```bash
    python manage.py migrate
    python manage.py runserver 0.0.0.0:8000
    ```

The logs will show when Whisper finishes downloading its model; after that you can send evaluation requests.

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

### Testing with curl

Once the server is running locally, you can hit it from any shell:

```bash
curl -X POST http://127.0.0.1:8000/api/evaluate/ \
  -F "audio=@/absolute/path/to/lesson.mp3" \
  -F 'metadata={
        "teacher_name": "Ms. Novak",
        "school_name": "Gymnazium Praha",
        "region": "Central Bohemia, Czech Republic",
        "age_group": "Upper primary (9–11 years)",
        "subject": "Mathematics",
        "lesson_type": "Practice / consolidation"
      }'
```

You can also send individual form fields instead of the `metadata` JSON blob (e.g., `-F teacher_name=... -F subject=Math`). The response includes the resolved metadata, full transcript, and the rubric-aligned evaluation JSON.

### Notes

- Whisper and the OpenAI client both rely on system certificates. If you are on macOS and run into SSL issues, point `SSL_CERT_FILE` at your exported trust store or install `certifi` and export `REQUESTS_CA_BUNDLE=...`.
- The LLM response is parsed as JSON when possible. If the model returns malformed JSON, the raw string is returned so the client can decide how to handle it.
- Heavy transcription work should ideally be moved onto a worker queue in production; the current implementation runs inline for simplicity.
