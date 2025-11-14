# Classroom Evaluation Dashboard

Modern Next.js dashboard that visualizes the JSON returned by the Django `/api/evaluate/` endpoint. It ships with Tailwind CSS, shadcn/ui primitives, and a sample evaluation payload so you can preview the interface without wiring up real data.

## Getting started

```bash
cd dashboard_ui
cp .env.local.example .env.local   # point to the Django server
npm install
npm run dev
```

Then visit `http://localhost:3000`.

## Connecting to the backend

Set `NEXT_PUBLIC_API_BASE_URL` inside `.env.local` (defaults to `http://127.0.0.1:8000`). When the Django backend is running, the “Upload lesson” form on the dashboard will:

1. Collect metadata + MP3 via the UI.
2. POST to `${NEXT_PUBLIC_API_BASE_URL}/api/evaluate/`.
3. Replace the on-screen charts, tables, and transcript panel with the live response.

A sample evaluation (`@/data/sample-evaluation`) still ships with the repo so the UI works without the backend, but it will be overwritten automatically after your first successful upload.

## Tech stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS + shadcn/ui components
- Lucide icons for visual cues
- Typed domain model in `src/types/evaluation.ts`

## Project layout

```
dashboard_ui/
├── src/app/                # App Router entrypoints (layout + dashboard page)
├── src/components/ui/      # shadcn/ui primitives
├── src/data/               # Sample evaluation data
├── src/types/              # Shared TypeScript types
├── tailwind.config.ts
└── components.json         # shadcn configuration
```

Feel free to extend the UI with routing, authentication, or integrations with storage for transcripts. The current implementation focuses on a single evaluation view that highlights strengths, growth areas, evidence, and suggestions in a coach-friendly layout.
