# Classroom Evaluation Dashboard

Modern Next.js dashboard that visualizes the JSON returned by the Django `/api/evaluate/` endpoint. It ships with Tailwind CSS, shadcn/ui primitives, and a sample evaluation payload so you can preview the interface without wiring up real data.

## Getting started

```bash
cd dashboard_ui
npm install
npm run dev
```

Then visit `http://localhost:3000`.

## Connecting to the backend

The dashboard expects the backend from `teacher_backend` to be running locally (default `http://localhost:8000`). When you're ready to replace the sample data with real evaluations:

1. Call the Django endpoint to upload audio + metadata: `POST http://localhost:8000/api/evaluate/`.
2. Persist the JSON response (metadata + evaluation) in your preferred store or pass it directly to the UI.
3. Replace the import from `@/data/sample-evaluation` with your fetch logic (e.g., `fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/evaluate/latest`)`).

You can set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` inside `.env.local` to keep the base URL configurable.

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
