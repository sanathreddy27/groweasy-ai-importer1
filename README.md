# GrowEasy AI CSV Importer

An AI-powered CSV importer that maps arbitrary CSV column layouts —
Facebook Lead exports, Google Ads exports, real estate CRM exports,
manually created spreadsheets — into GrowEasy's fixed CRM lead schema,
using Gemini for field extraction.

## Design

The UI is built around an **architectural blueprint / import manifest**
identity rather than a generic dashboard template — grounded in the fact
that GrowEasy's leads are for real property developments (`meridian_tower`,
`eden_park`, `sarjapur_plots`).

- **Title block header** — modeled on the metadata block on an actual
  architectural drawing sheet (project, engine, date, sheet number).
- **Stage tracker** — Upload → Preview → Confirm → Extracted, shown as a
  real sequence with genuine state (active/done), not decorative numbering.
- **Ink-stamp status badges** — CRM statuses (`GOOD_LEAD_FOLLOW_UP`,
  `BAD_LEAD`, etc.) render as rotated rubber-stamp marks instead of
  rounded pills, reinforcing the "processed document" metaphor.
- **Blueprint grid backdrop + corner registration marks** on the main
  card, echoing drafting paper.
- **Typography** — IBM Plex Mono for all technical/data labels (table
  headers, stamps, stage tracker), Inter for body copy — a deliberate
  technical/humanist pairing rather than one font doing both jobs.
- **"Plotting…" loading state** — a scanning beam animation instead of a
  generic spinner, framed as a pen plotter drawing the record set.

## Tech Stack

- **Frontend:** React + Vite (no routing/SSR needed for a single upload →
  preview → import flow, so Vite keeps the dev loop fast)
- **Backend:** Node.js + Express
- **AI:** Google Gemini (`gemini-2.5-flash`)
- **CSV Parsing:** `csv-parser` (backend), `papaparse` (frontend preview)

## Project Structure

```
backend/
  controllers/importController.js   # request handling, cleanup
  middleware/uploadMiddleware.js     # multer config, file validation
  routes/importRoutes.js             # /api/import route
  services/csvService.js             # CSV -> JSON records
  services/aiService.js              # batched Gemini extraction, retries
  server.js

frontend/
  src/App.css                        # design system (tokens, layout, stamps)
  src/components/                    # UploadBox, PreviewTable, CRMTable,
                                      # SummaryCards, LoadingSpinner
  src/services/api.js                # axios instance
  src/App.jsx
```

## How It Works

1. **Upload** — drag/drop or file picker (`UploadBox`).
2. **Preview** — CSV parsed client-side with PapaParse, shown in a
   scrollable table with sticky headers. No AI call happens yet.
3. **Confirm Import** — only on click does the file POST to the backend
   (`/api/import`, multipart/form-data).
4. **Backend processing:**
   - `csvService.js` converts the CSV into row objects.
   - `aiService.js` splits records into batches of 25 and sends each to
     Gemini with a prompt that maps arbitrary column names to GrowEasy's
     fixed CRM schema, enforces allowed enum values for `crm_status` /
     `data_source`, merges duplicate emails/phones into `crm_note`, and
     skips records with neither an email nor a phone.
   - Each batch retries up to 3 times with backoff if Gemini's response
     isn't valid JSON; a batch that still fails returns an empty array
     rather than failing the whole import.
5. **Result** — total imported / skipped / total counts plus a table of
   extracted CRM records, each status shown as an ink-stamp badge.

## Setup — Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env and add your GEMINI_API_KEY
npm run dev        # http://localhost:5000
```

Get a Gemini API key at https://aistudio.google.com/app/apikey.

## Setup — Frontend

```bash
cd frontend
npm install
cp .env.example .env
# edit .env — VITE_API_URL should point at your backend
npm run dev         # http://localhost:5173 (or next free port)
```

**Important:** Vite only reads `.env` at startup. If you create or edit
it while `npm run dev` is running, restart the dev server.

## Deployment

- **Backend:** Render (or similar). Set `GEMINI_API_KEY` as an
  environment variable in the dashboard — never commit `.env`.
- **Frontend:** Vercel. Set `VITE_API_URL` in Vercel's project →
  Settings → Environment Variables to your live backend URL
  (e.g. `https://your-backend.onrender.com`), then redeploy — Vite bakes
  env vars in at build time, so adding the variable without a new build
  has no effect.
- Render's free tier spins the backend down after ~15 min idle and takes
  30-60s to wake — the first import after idle time may be slow.

## Known Limitations / Future Improvements

- No persistence layer — stateless per the assignment's optional-database
  note. Records aren't stored after being returned.
- No virtualization for very large result tables yet (bonus item).
- No automated tests yet (bonus item).
- CORS is currently open (`cors()` with no origin restriction) for ease
  of grading — in production this should be locked to the deployed
  frontend origin.

## Testing

A sample CSV with intentionally messy column names and edge cases
(missing email, missing phone, blank row, multiple emails/phones per
field, unrecognized data source) is included as `test_leads.csv`.
