# Branded Survey Builder

A full-stack survey creation platform. Create surveys, brand them with your own visual identity, share a public URL, and view responses — no third-party tools required.


## Features

### Survey Builder
- Create and manage multiple surveys from a personal dashboard
- **6 question types:** Short Text, Long Text, Multiple Choice, Checkboxes, Rating (1–5 stars), Linear Scale, and Date
- Drag-and-drop reordering of questions (via `@dnd-kit`)
- Mark questions as required/optional
- Live preview of the survey as you build it

### Full Theme Customisation
- **Brand Colour** — controls the header banner at the top of each survey card
- **Card Background Colour** — the background of the survey content container
- **Page Background Colour** — the full-page background behind the card
- **Font Family** — choose from a curated set of Google Fonts
- **Logo** — enter a URL for your logo, displayed prominently at the top of the survey

### Public Survey Sharing
- Each survey gets a shareable URL at `/s/:surveyId`
- Respondents see the survey with the owner's full branding applied — no login required
- Required-field validation before submission
- A polished thank-you screen after submission

### Response Dashboard
- View all responses per survey in a table
- CSV export of all responses

### Auth
- Magic-link / OTP email authentication — no passwords
- Session-based, persisted in Cloudflare D1

---

## Stack

| Layer      | Technology                                         |
|------------|----------------------------------------------------|
| Backend    | [Hono](https://hono.dev/) on Cloudflare Workers    |
| Frontend   | React 19 + Vite + TanStack Router                  |
| Database   | Cloudflare D1 (SQLite)                             |
| Drag & Drop | [@dnd-kit](https://dnd-kit.com/)                  |
| Styling    | Tailwind CSS v4                                    |
| Linting    | [Biome](https://biomejs.dev/)                      |
| Language   | TypeScript (both frontend and backend)             |

---

## Database Schema

```
users         — email + optional display name
sessions      — active login sessions
otp_codes     — one-time passwords for magic link auth
surveys       — per-user surveys with full theme config
questions     — ordered questions belonging to a survey
responses     — anonymous submissions
answers       — individual answers within a response
```

---

## Getting Started

This is a pnpm workspace. One install covers both `api/` and `web/`.

```bash
pnpm install        # install all dependencies
pnpm dev            # api on :8787, web on :5173 (output prefixed [api]/[web])
```

Open http://localhost:5173.

### Other useful scripts

```bash
pnpm check          # Biome — formatting + linting
pnpm check:fix      # auto-fix what Biome can fix
pnpm typecheck      # tsc --noEmit across both packages
pnpm build          # production build of web
```

### Cloudflare Bindings

When adding D1 bindings in `api/wrangler.jsonc`, regenerate `Env` types:

```bash
pnpm --filter sde-intern-task-api cf-typegen
```

---

## Key Design Decisions

**Three-tone theming** — Surveys have three independently configurable colour layers: the outermost page background, the survey card background, and the brand-colour header banner. This gives a real sense of ownership to survey creators while keeping the public view clean.

**Live preview** — The editor right panel renders a faithful preview of the exact public survey experience as you type and change colours, so there are no surprises between editing and sharing.

**Auto-resizing title input** — The survey title editor uses an auto-growing `<textarea>` rather than a fixed `<input>`, so long titles wrap naturally rather than clipping or requiring horizontal scroll.

**OTP auth** — A password-less magic-link flow was chosen as it is simpler to implement securely than OAuth (no third-party credentials to manage) while still being production-grade in terms of UX.

**Cloudflare D1 for persistence** — D1 is SQLite at the edge and integrates natively with Hono Workers — zero extra infrastructure, and the relational model maps cleanly to the survey/question/response hierarchy.

---

## Project Structure

```
/
├── api/
│   └── src/
│       ├── db/
│       │   └── schema.sql          # Full D1 schema
│       ├── routes/
│       │   ├── auth.ts             # OTP login / session management
│       │   ├── surveys.ts          # Authenticated survey CRUD + theme
│       │   ├── questions.ts        # Question CRUD + reorder
│       │   ├── responses.ts        # Response read + CSV export
│       │   └── public.ts           # Unauthenticated survey fetch + submission
│       └── index.ts
└── web/
    └── src/
        ├── components/
        │   ├── BrandingPanel.tsx       # Theme controls (colors, font, logo)
        │   ├── QuestionEditor.tsx      # Per-question editing UI
        │   ├── QuestionRenderer.tsx    # Renders a question for respondents
        │   ├── ExportCsvButton.tsx     # CSV export trigger
        │   ├── SurveyCard.tsx          # Dashboard survey card
        │   ├── editor/                 # Editor sub-components (QuestionList, ResponsesTable, etc.)
        │   └── question-types/         # Per-type renderer components
        ├── hooks/
        │   ├── useSurveyEditor.ts      # Editor state + autosave logic
        │   ├── useSurveyQuestions.ts   # Question CRUD + drag-and-drop
        │   └── useSurvey.ts            # Survey data fetching
        └── routes/
            ├── dashboard.tsx           # Survey list
            ├── login.tsx               # Auth flow
            ├── surveys/$surveyId.edit.tsx      # Editor
            ├── surveys/$surveyId.responses.tsx # Responses view
            └── s/$surveyId.tsx         # Public survey (no auth)
```

---

## API Reference

All routes under `/api/surveys/*` are protected and require a valid session cookie.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/send-code` | Send a 6-digit OTP to an email address |
| `POST` | `/api/auth/verify` | Verify OTP, create account if new, set session cookie |
| `POST` | `/api/auth/logout` | Delete session |
| `GET` | `/api/auth/me` | Get the current authenticated user |

### Surveys

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/surveys` | List all surveys for the current user |
| `POST` | `/api/surveys` | Create a new survey |
| `GET` | `/api/surveys/:id` | Get a single survey with questions |
| `PUT` | `/api/surveys/:id` | Update survey title, theme, or publish status |
| `DELETE` | `/api/surveys/:id` | Delete a survey and all its data |

### Questions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/surveys/:id/questions` | Add a question |
| `PUT` | `/api/surveys/:id/questions/:qid` | Update a question |
| `DELETE` | `/api/surveys/:id/questions/:qid` | Delete a question |
| `PUT` | `/api/surveys/:id/questions/reorder` | Reorder all questions |

### Responses

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/surveys/:id/responses` | Get all responses with answers |
| `GET` | `/api/surveys/:id/responses/export` | Download responses as CSV |

### Public (no auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/public/surveys/:id` | Fetch a published survey with questions and theme data |
| `POST` | `/api/public/surveys/:id/respond` | Submit a response |

---

## Auth Flow

Authentication uses **email OTP (magic code)** — no passwords.

1. User enters their email on the login page.
2. A 6-digit code is generated and stored in `otp_codes` with a **5 minute expiry**.
3. In development the code is logged to the `[api]` console output — copy-paste it into the form.
4. On verification the code is marked `used = 1` (single-use) and a `session` cookie is set with a **7 day TTL**.
5. All protected API routes are checked by `authMiddleware`, which reads the session cookie and rejects expired or missing sessions with `401`.

> **For production:** swap the `console.log` in `auth.ts` for a real email provider (Resend, AWS SES, etc.). The rest of the flow needs no changes.

---

## Theming

Each survey stores three independent colour values and a font:

| Field | Controls | Default |
|-------|----------|---------|
| `brand_color` | Header banner at the top of the survey card | `#4f46e5` |
| `bg_color` | Background of the entire survey card | `#ffffff` |
| `page_bg_color` | Full-screen background behind the card | `#f8fafc` |
| `font_family` | Typography across the entire survey | `Inter` |

The editor shows a **live preview** of the public survey experience — what you see in the editor is pixel-identical to what respondents see. Theme changes are reflected instantly and persisted on "Save Theme".

Available fonts: **Inter**, **Roboto**, **Outfit**, **Playfair Display**.

---

## Question Types

| Type | Key | Notes |
|------|-----|-------|
| Short Text | `short_text` | Single-line text input |
| Long Text | `long_text` | Multi-line textarea |
| Multiple Choice | `multiple_choice` | Single-select radio buttons |
| Checkboxes | `checkboxes` | Multi-select checkboxes |
| Rating | `rating` | 1–5 interactive star rating |
| Linear Scale | `linear_scale` | Configurable 1–10 slider scale |
| Date | `date` | Native date picker |

All question types support marking as **required** — required questions are validated before the public survey form can be submitted.

---

## Deployment

The project is designed to run on Cloudflare's edge.

1. **Create a D1 database** in your Cloudflare dashboard and add the binding to `api/wrangler.jsonc`.
2. **Apply the schema:**
   ```bash
   wrangler d1 execute <DB_NAME> --file=api/src/db/schema.sql
   ```
3. **Deploy the API:**
   ```bash
   pnpm --filter sde-intern-task-api run deploy
   ```
4. **Build and deploy the frontend** to Cloudflare Pages (or any static host):
   ```bash
   pnpm build
   ```
5. Set the `VITE_API_URL` env var on your Pages project to point at your deployed Worker URL if the frontend and API are on different domains.

---

## Contributing

```bash
git clone <repo>
pnpm install
pnpm dev
```

Before opening a PR:

```bash
pnpm check:fix   # auto-fix linting and formatting
pnpm typecheck   # ensure no TypeScript errors
```
