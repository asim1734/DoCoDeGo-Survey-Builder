<p align="center">
  <a href="https://docodego.com/">
    <img src=".github/logo.png" alt="DoCoDeGo — Document · Compose · Demonstrate · Govern — an open framework for teams accountable for what AI produces in their name" width="500" />
  </a>
</p>

# Branded Survey Builder

A full-stack survey creation platform built for the DoCoDeGo SDE Intern take-home. Think a minimal Typeform / Tally clone — create surveys, brand them, share a public URL, and view responses.

## Live Demo

> Create a survey → brand it → share the link → view responses. No sign-in required to respond.

---

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
