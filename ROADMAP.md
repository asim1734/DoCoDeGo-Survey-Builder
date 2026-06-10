# ROADMAP — Branded Survey Builder MVP

> A phase-by-phase plan to build a Typeform-lite clone on Cloudflare Workers + React.
> Target: ~3–4 days of focused work. Ship a tight MVP with great UX.

---

## 1. Starter Kit Inventory (what's already here)

| Layer | What exists | Key detail |
|-------|------------|------------|
| Monorepo | pnpm workspace, root `package.json` | `pnpm dev` runs api + web concurrently |
| API | Hono app, single `/api/health` route | `wrangler.jsonc` has D1/KV/R2 binding examples commented out |
| Web | React 19 + Vite 8 + TanStack Router | File-based routing, auto code-splitting, Vite proxies `/api` → `:8787` |
| Linting | Biome 2.4 at root | Single quotes, no semicolons, trailing commas, 2-space indent, 100-char line width |
| TypeScript | TS 6, strict mode, `noUncheckedIndexedAccess` | API includes `worker-configuration.d.ts` (auto-generated, gitignored) |
| CI gate | `pnpm check && pnpm typecheck` | Must pass on every commit |

---

## 2. Tech Stack Decisions

### Auth: Email OTP (one-time password via code)

**What:** User enters email → receives a 6-digit code → enters code → gets a session cookie.

**Why this over alternatives:**
- **OAuth (Google/GitHub):** Requires registering an OAuth app, handling redirects, managing client secrets. Way too much ceremony for a 1-week project. Hard to explain in a walkthrough if you haven't done it before.
- **Magic link via email:** Requires an actual email-sending service (Resend, SES). The link-click flow is harder to test locally.
- **Email OTP:** Same security model as magic links but simpler. During development, just log the code to the console — no email service needed. Can plug in Resend later as a stretch goal. Every CS student has seen "enter your verification code" and can explain it.

**Session storage:** A `sessions` table in D1 with a random token stored as an HttpOnly cookie. No JWTs — JWTs are harder to revoke and harder to explain. A session row in the database is the simplest mental model: "the cookie has a token, the token maps to a user row."

### Styling: Tailwind CSS v4

**Why Tailwind v4:**
- The README says "styling is your call — pick tools you can defend."
- Tailwind v4 uses a pure CSS-based config (`@import "tailwindcss"` in your CSS file) — no `tailwind.config.js`, no extra config files to explain.
- Utility classes mean styles live right next to the markup. No switching between `.tsx` and `.css` files. You can read a component top-to-bottom and understand it.
- Every MERN developer has seen Tailwind. The class names are descriptive: `text-lg`, `bg-blue-500`, `rounded-xl`, `p-4`. Nothing cryptic.
- A component library (Radix, shadcn) is great in production but adds dozens of imports the developer needs to understand cold. Not worth it for a 1-week project.
- For per-survey branding, use Tailwind's CSS custom properties support: set `--color-brand` via inline style on the survey wrapper, then reference it with `bg-[var(--color-brand)]` or define a theme extension in the CSS file. Clean and explicit.

### Drag-and-drop: @dnd-kit/core + @dnd-kit/sortable

**Why:**
- It's the standard React DnD library — well-maintained, accessible, and lightweight.
- `@dnd-kit/sortable` gives us vertical list reordering with ~20 lines of code.
- The developer only needs to understand: `DndContext`, `SortableContext`, `useSortable`, `arrayMove`. Four concepts, all named clearly.
- Alternative (react-beautiful-dnd) is deprecated. Manual drag with mouse events is too error-prone.

### Cloudflare Primitives

| Primitive | Use | Rationale |
|-----------|-----|-----------|
| **D1** | All persistence (users, sessions, surveys, questions, responses, answers) | It's a SQL database on the edge. One binding, one query language. No need for KV's key-value model. |
| **KV** | Not used | Sessions in D1 are simpler — one less binding to configure and explain. KV's eventual consistency also makes session lookups unreliable. |
| **R2** | Stretch goal only — logo file upload | Only add if MVP is done early. For MVP, logos are just a URL string the user pastes in. |

### Additional Libraries

| Library | Purpose | Why |
|---------|---------|-----|
| `nanoid` | Generate unguessable IDs for surveys, users, etc. | Survey IDs double as URL slugs — must not be sequential. `nanoid` is tiny (130 bytes), no dependencies. |
| `hono/cookie` | Read/write session cookies | Built into Hono, zero extra deps. |

---

## 3. D1 Database Schema

All primary keys are nanoid strings. No auto-increment integers.
Survey IDs double as public URL slugs and must be unguessable.

```sql
-- Users who can create surveys
CREATE TABLE users (
  id TEXT PRIMARY KEY,            -- nanoid
  email TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Active login sessions
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,            -- nanoid (this is the cookie value)
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- One-time passwords for email login
CREATE TABLE otp_codes (
  id TEXT PRIMARY KEY,            -- nanoid
  email TEXT NOT NULL,
  code TEXT NOT NULL,             -- 6-digit string like "482913"
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- A survey created by a user
CREATE TABLE surveys (
  id TEXT PRIMARY KEY,            -- nanoid (also the public URL slug)
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  brand_color TEXT NOT NULL DEFAULT '#6366f1',  -- hex color
  logo_url TEXT DEFAULT '',                     -- URL to logo image (paste-in for MVP)
  is_published INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- A question belonging to a survey
CREATE TABLE questions (
  id TEXT PRIMARY KEY,            -- nanoid
  survey_id TEXT NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  type TEXT NOT NULL,             -- 'short_text' | 'multiple_choice' | 'rating'
  title TEXT NOT NULL,
  options TEXT DEFAULT '[]',      -- JSON array, e.g. '["Yes","No","Maybe"]' for multiple_choice
  is_required INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- A single submission to a survey (one respondent fills out the whole thing)
CREATE TABLE responses (
  id TEXT PRIMARY KEY,            -- nanoid
  survey_id TEXT NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- One answer within a response (one per question per response)
CREATE TABLE answers (
  id TEXT PRIMARY KEY,            -- nanoid
  response_id TEXT NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  value TEXT NOT NULL DEFAULT ''  -- always TEXT: "4" for rating, "Option B" for MC, free text for short_text
);
```

**Key design decisions:**
- **All answer values are TEXT.** A rating of 4 is stored as `"4"`. This avoids type gymnastics and makes the schema uniform. Parse to number in the UI when needed.
- **Options stored as JSON column.** `'["Red","Blue","Green"]'` — parsed with `JSON.parse()` in the API. Simple, no join table needed for a fixed set of choices.
- **`sort_order` on questions.** Integer for drag-and-drop reordering. When the user reorders, send the new order to the API and UPDATE each question's `sort_order`.
- **`is_published` on surveys.** Default 0 (draft). Set to 1 when the user explicitly publishes. The public URL only works when `is_published = 1`.
- **Cascade deletes.** Deleting a survey removes its questions, responses, and answers. Clean and expected behavior.

---

## 4. Folder Structure

Consistent with the starter kit's existing conventions.

```
DoCoDeGo-Survey-Builder/
├── api/
│   ├── src/
│   │   ├── index.ts                 # Hono app entry — mounts route groups
│   │   ├── db/
│   │   │   ├── schema.sql           # CREATE TABLE statements (copy-paste to D1 console)
│   │   │   └── seed.sql             # Optional: sample data for development
│   │   ├── routes/
│   │   │   ├── auth.ts              # POST /api/auth/send-code, POST /api/auth/verify, POST /api/auth/logout, GET /api/auth/me
│   │   │   ├── surveys.ts           # CRUD for surveys (list, create, get, update, delete)
│   │   │   ├── questions.ts         # CRUD for questions within a survey
│   │   │   ├── public.ts            # GET /api/public/surveys/:id (no auth), POST /api/public/surveys/:id/respond
│   │   │   └── responses.ts         # GET /api/surveys/:id/responses (owner only)
│   │   └── middleware/
│   │       └── auth.ts              # Middleware: read session cookie, attach user to context
│   ├── package.json
│   ├── tsconfig.json
│   └── wrangler.jsonc
│
├── web/
│   ├── src/
│   │   ├── main.tsx                 # React entry (already exists)
│   │   ├── app.css                  # Tailwind v4 entry: @import "tailwindcss", theme overrides, custom properties
│   │   ├── routes/
│   │   │   ├── __root.tsx           # Root layout: nav bar, auth context provider
│   │   │   ├── index.tsx            # Landing / redirect to dashboard if logged in
│   │   │   ├── login.tsx            # Email + OTP code entry
│   │   │   ├── dashboard.tsx        # List of user's surveys
│   │   │   ├── surveys/
│   │   │   │   ├── $surveyId.edit.tsx   # Survey builder (add/remove/reorder questions, branding)
│   │   │   │   └── $surveyId.responses.tsx  # View responses for a survey
│   │   │   └── s/
│   │   │       └── $surveyId.tsx    # Public survey page (no auth required)
│   │   ├── components/
│   │   │   ├── QuestionEditor.tsx   # One question card in the builder
│   │   │   ├── QuestionRenderer.tsx # One question in the public survey form
│   │   │   ├── BrandingPanel.tsx    # Color picker + logo URL input
│   │   │   ├── SurveyCard.tsx       # Survey card for the dashboard list
│   │   │   └── ResponseTable.tsx    # Table of responses
│   │   └── lib/
│   │       └── api.ts              # fetch() wrappers for each API endpoint
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── ROADMAP.md          ← you are here
├── biome.json
├── package.json
└── pnpm-workspace.yaml
```

**Principles:**
- No barrel files (`index.ts` that re-exports). Every import points to the actual file.
- No `utils/` junk drawer. If a helper doesn't belong to a specific route or component, put it in `lib/`.
- API routes are split by resource, not by HTTP method. Each file handles all methods for one resource.
- Web components are flat — no nested `components/common/ui/Button.tsx` hierarchy. If it's a component, it's in `components/`.

---

## 5. Phase-by-Phase Build Plan

### Phase 0: Project Setup (2–3 hours)

**What to do:**
1. Add D1 binding to `wrangler.jsonc` (local dev — no real database ID needed for `wrangler dev`)
2. Run `pnpm cf-typegen` to generate `Env` types with `DB` binding
3. Create `api/src/db/schema.sql` with the full schema above
4. Apply schema to local D1: `wrangler d1 execute survey-builder --local --file=src/db/schema.sql`
5. Install `nanoid` in `api/`
6. Install `@dnd-kit/core` and `@dnd-kit/sortable` in `web/`
7. Install Tailwind CSS v4: `pnpm --filter sde-intern-task-web add tailwindcss @tailwindcss/vite`
8. Add `@tailwindcss/vite` plugin to `vite.config.ts` (before the react plugin)
9. Create `web/src/app.css` with `@import "tailwindcss"` and theme overrides (brand colors, fonts)
10. Import `app.css` in `main.tsx`
11. Set up Google Fonts (Inter) via `index.html` link tag

**Done means:**
- `pnpm check` passes
- `pnpm typecheck` passes
- `pnpm dev` starts both servers without errors
- `/api/health` still returns `{ "status": "ok" }`
- Local D1 database exists with all tables (verify with `wrangler d1 execute survey-builder --local --command "SELECT name FROM sqlite_master WHERE type='table'"`)

**Manual testing checklist:**
- [ ] `pnpm dev` starts without errors
- [ ] `http://localhost:5173` loads the page with Tailwind styles applied (e.g., default font, background color)
- [ ] `http://localhost:5173/api/health` returns `{ "status": "ok" }` (Vite proxy works)
- [ ] D1 tables exist when queried via wrangler CLI

**Recommended Commits:**
1. `docs: create project roadmap` (ROADMAP.md)
2. `chore: project setup, tailwind, and dependencies` (Config files, package.json, app.css, main.tsx)
3. `feat(api): define D1 database schema` (api/src/db/schema.sql)

---

### Phase 1: Auth — Email OTP + Sessions (4–5 hours)

**What to build:**

API routes:
- `POST /api/auth/send-code` — takes `{ email }`, generates a 6-digit OTP, stores it in `otp_codes`, logs it to console (no email sending for MVP)
- `POST /api/auth/verify` — takes `{ email, code }`, validates OTP, creates user if first time, creates session, sets HttpOnly cookie
- `POST /api/auth/logout` — deletes session row, clears cookie
- `GET /api/auth/me` — returns current user from session cookie, or 401

Auth middleware:
- Reads `session` cookie, looks up session in D1, attaches `user` to Hono context
- Applied to all `/api/surveys/*` and `/api/surveys/*/responses` routes (not to `/api/public/*`)

Web pages:
- `/login` — email input → submit → code input → submit → redirect to dashboard
- Root layout: check `/api/auth/me` on load, store user in React context, show login/logout nav

**Done means:**
- `pnpm check` and `pnpm typecheck` pass
- Full login flow works in the browser

**Manual testing checklist:**
- [ ] Go to `/login`, enter any email, see OTP code in the API terminal output
- [ ] Enter the correct code → redirected to dashboard (or `/` with logged-in state)
- [ ] Refresh the page → still logged in (cookie persists)
- [ ] Click logout → session cleared, redirected to login
- [ ] Enter a wrong code → see an error message, not a crash
- [ ] Enter an expired code (wait >5 min or manually expire it) → error message
- [ ] Hit `/api/auth/me` directly → returns user JSON when logged in, 401 when not
- [ ] Try accessing `/dashboard` when logged out → redirected to `/login`

**Recommended Commits:**
1. `feat(api): implement email OTP and session routes` (api/src/routes/auth.ts, middleware, index.ts)
2. `feat(web): implement login flow and auth context` (web/src/routes/login.tsx, __root.tsx, lib/api.ts, etc.)

---

### Phase 2A: Survey API Setup (1–2 hours)

**What to build:**
- `GET /api/surveys` — list all surveys for the logged-in user
- `POST /api/surveys` — create a new survey (default title, default brand color)
- `GET /api/surveys/:id` — get survey with its questions (owner only)
- `PUT /api/surveys/:id` — update survey title, brand_color, logo_url, is_published
- `DELETE /api/surveys/:id` — delete survey and all related data (cascade)

**Done means:**
- `pnpm check` and `pnpm typecheck` pass.
- API endpoints return expected JSON and enforce authentication.

---

### Phase 2B: Dashboard UI (2–3 hours)

**What to build:**
- `/dashboard` — list user's surveys as cards.
- Add "Create Survey" button that calls the POST API and redirects.
- Survey cards show: title, number of questions, number of responses, published status, created date.

**Done means:**
- Click "Create Survey" → new survey appears in the list.
- Survey card displays correct details and links to the builder.
- Delete a survey → it disappears from the list.

---

### Phase 3A: Question API Setup (1–2 hours)

**What to build:**
- `POST /api/surveys/:id/questions` — add a question
- `PUT /api/surveys/:surveyId/questions/:questionId` — update question (title, type, options, is_required)
- `DELETE /api/surveys/:surveyId/questions/:questionId` — remove a question
- `PUT /api/surveys/:id/questions/reorder` — update `sort_order`

**Done means:**
- Question endpoints can be curled/tested successfully.
- Correct error codes returned for missing data.

---

### Phase 3B: Survey Builder Layout & Branding (2–3 hours)

**What to build:**
- `/surveys/$surveyId/edit` page skeleton (Left/Right panel split).
- **Top/Side bar:** Branding controls (color picker for `brand_color`, text input for `logo_url`).
- **Preview section:** Visual preview of the survey that reacts instantly to branding changes.
- **Publish toggle:** Switch survey between draft and published.

**Done means:**
- Changing brand color updates the preview immediately.
- Toggling "Publish" saves to the database successfully.

---

### Phase 3C: Question Editor Components (3–4 hours)

**What to build:**
- UI to add 3 question types: Short text, Multiple choice, Rating.
- Inline editor for question titles.
- Options editor for Multiple Choice (add/remove strings).
- Required toggle for each question.

**Done means:**
- Can add, edit, and delete all 3 types of questions.
- Multiple choice options save to the JSON array correctly in the DB.

---

### Phase 3D: Drag-and-Drop Reordering (1–2 hours)

**What to build:**
- Implement `@dnd-kit/core` and `@dnd-kit/sortable` in the left panel list.
- Wire up the `onDragEnd` event to call the `reorder` API endpoint.

**Done means:**
- Dragging a question reorders it visually.
- Refreshing the page proves the order saved in the DB.

---

### Phase 4A: Public Survey API & Validation (1–2 hours)

**What to build:**
- `GET /api/public/surveys/:id` — returns survey + questions (no auth required, only if `is_published = 1`).
- `POST /api/public/surveys/:id/respond` — accepts `{ answers: [{ questionId, value }] }`, validates, creates response + answers.

**Done means:**
- Public endpoints work without cookies.
- Validation rejects invalid or missing required answers.

---

### Phase 4B: Public Survey Form UI (2–3 hours)

**What to build:**
- `/s/$surveyId` — Public-facing survey page.
- Renders in the survey owner's brand (brand_color, logo).
- Submit button → POST answers → show "Thank you" screen.

**Done means:**
- Open `/s/<survey-id>` → renders with correct branding.
- Short text, Multiple choice, and Rating inputs all function.
- Submit with required fields empty → UI validation error.
- Submit with all valid → "Thank you" screen.

---

### Phase 5: Responses Dashboard (2–3 hours)

**What to build:**
- `GET /api/surveys/:id/responses` — API to fetch responses.
- `/surveys/$surveyId/responses` — Table view of submitted data.
- Row per response, column per question.

**Done means:**
- Table displays responses correctly.
- Page handles empty states elegantly ("No responses yet").

---

### Phase 6: Polish + UX + Final Checks (3–4 hours)

**What to do:**
- Responsive design — test on mobile viewport sizes
- Loading states — show spinners or skeletons during API calls
- Error states — show user-friendly error messages, not blank screens
- Empty states — "No surveys yet, create your first one!" etc.
- Transitions and hover effects — subtle CSS animations on cards, buttons
- Consistent spacing, alignment, and typography across all pages
- Final `pnpm check` and `pnpm typecheck` pass
- Test the entire happy path end-to-end one more time
- Clean up any console.log statements (except OTP code logging for demo purposes)

**Manual testing checklist:**
- [ ] Happy path works perfectly: sign in → create survey → add questions → brand it → publish → open public URL → respond → view responses
- [ ] All pages look good on both desktop (1280px+) and mobile (375px)
- [ ] No console errors in the browser
- [ ] `pnpm check` passes
- [ ] `pnpm typecheck` passes
- [ ] No broken links or dead routes
- [ ] Loading and error states are handled on every page

---

## 6. Daily Schedule

### Day 1 (~8 hours): Foundation + Auth
| Time | Task |
|------|------|
| Morning (3h) | Phase 0: Project setup, D1 schema, CSS design tokens, dependencies |
| Afternoon (5h) | Phase 1: Auth system — OTP flow, session middleware, login page, auth context |

### Day 2 (~8 hours): Survey CRUD + Builder
| Time | Task |
|------|------|
| Morning (3h) | Phase 2: Survey CRUD API + dashboard page |
| Afternoon (5h) | Phase 3: Survey builder — question CRUD, drag-and-drop, branding panel |

### Day 3 (~8 hours): Public Survey + Responses + Polish
| Time | Task |
|------|------|
| Morning (4h) | Phase 4: Public survey page + response submission |
| Afternoon (4h) | Phase 5: Responses dashboard |

### Day 4 (~4–6 hours): Polish + Record
| Time | Task |
|------|------|
| Morning (3h) | Phase 6: Polish, responsive design, UX refinements |
| Afternoon (2–3h) | Record Loom walkthrough, final testing, submit |

**Total: ~28–30 hours over 4 days.**

If you're ahead of schedule after Day 3, use the extra time on:
1. Better animations and transitions in the builder
2. Response analytics (counts, averages, per-question breakdowns)
3. CSV export of responses
4. Logo upload via R2 (stretch)

---

## 7. Risk Register

### Risk 1: D1 local dev quirks

**Problem:** `wrangler dev` uses a local SQLite file for D1. The database resets if you delete `.wrangler/`. Schema changes require re-running the SQL file manually.

**Mitigation:**
- Keep `schema.sql` as the source of truth. Always re-apply it with: `wrangler d1 execute survey-builder --local --file=src/db/schema.sql`
- Create a `seed.sql` with sample data so you can quickly restore test state.
- Never delete `.wrangler/` unless you intend to reset.
- Add `.wrangler/` to `.gitignore` (already done in the starter).

### Risk 2: D1 query results are untyped

**Problem:** D1's `db.prepare("SELECT ...").all()` returns `{ results: unknown[] }`. There's no ORM to give you typed rows. You'll be casting to `as SomeType` everywhere.

**Mitigation:**
- Define simple TypeScript types for each table row (e.g., `type User = { id: string; email: string; created_at: string }`).
- Put these types in the route file where they're used — don't create a shared types package.
- Only cast at the query boundary: `const users = result.results as User[]`.
- Keep queries simple — no joins across 3+ tables. Do two queries instead if needed.

### Risk 3: Workers runtime is not Node.js

**Problem:** Cloudflare Workers use the V8 isolate runtime, not Node.js. Some Node APIs don't exist (`fs`, `crypto.randomBytes`, `Buffer` in some cases). Some npm packages won't work.

**Mitigation:**
- The starter already has `"compatibility_flags": ["nodejs_compat"]` which provides many Node APIs.
- `nanoid` works in Workers out of the box (it uses `crypto.getRandomValues`).
- Don't import anything from `node:fs`, `node:path`, or `node:child_process`.
- If a package doesn't work, check if it has a `browser` or `worker` export.
- Test everything in `wrangler dev`, not in Node directly.

### Risk 4: Wrangler types generation fails silently

**Problem:** `wrangler types` (the `cf-typegen` script) generates `worker-configuration.d.ts` with an `Env` interface. If the generation fails or the file is stale, TypeScript won't know about your D1 binding and you'll get confusing type errors.

**Mitigation:**
- Run `pnpm --filter sde-intern-task-api cf-typegen` every time you change `wrangler.jsonc`.
- The starter has `"postinstall": "wrangler types"` so `pnpm install` auto-regenerates it.
- If types seem wrong, delete `api/worker-configuration.d.ts` and re-run `cf-typegen`.

### Risk 5: CORS / cookie issues between Vite and Wrangler

**Problem:** In dev, the frontend is on `localhost:5173` and the API is on `localhost:8787`. Cookies might not work across different ports if SameSite/Secure settings are wrong.

**Mitigation:**
- Vite's proxy is already configured: `/api` → `http://localhost:8787`. This means the browser always talks to `:5173` for both the frontend and the API. No CORS issues.
- Set the session cookie with `Path=/`, `HttpOnly=true`, `SameSite=Lax`, `Secure=false` in development.
- Do NOT set `Domain` on the cookie in development.
- If you deploy, switch `Secure=true` and `SameSite=Strict`.

### Risk 6: JSON column parsing

**Problem:** D1 stores JSON as a plain TEXT column. If you forget to `JSON.parse()` the `options` column from `questions`, you'll get a string like `'["A","B","C"]'` instead of an array.

**Mitigation:**
- Always parse the `options` column immediately after querying: `question.options = JSON.parse(question.options as string)`.
- Always stringify before inserting: `JSON.stringify(options)`.
- Add a comment at the query site if it helps: `// options is stored as JSON text in D1`.

### Risk 7: Forgetting to re-run Biome before committing

**Problem:** `pnpm check` will fail on the reviewer's machine if code doesn't match Biome's format. The reviewer runs this as part of their review.

**Mitigation:**
- Run `pnpm check:fix` before every commit.
- Better: set up a git pre-commit hook or just make it a habit.
- If Biome complains about generated files (`routeTree.gen.ts`), it's already excluded via the comments at the top. Don't worry about it.

---

## 8. Walkthrough Prep Notes (5–10 min Loom)

### Structure the recording

1. **Introduction (30 sec):** "Hi, I'm [name]. I built a branded survey builder — here's what it does."
2. **Happy path demo (3–4 min):** Screen-share the full flow.
3. **Key decisions (2–3 min):** Pick 3–4 and explain your thinking.
4. **What I'd do differently (1 min):** Be honest.
5. **AI usage (1 min):** Quick and transparent.

---

### Happy Path Demo Script

Walk through this exact flow, narrating each step:

1. **Sign in:** Open the app → enter email → show the OTP code in the terminal → enter it → land on the dashboard.
2. **Create a survey:** Click "Create Survey" → give it a title like "Customer Feedback."
3. **Add questions:**
   - Add a short text question: "What's your name?"
   - Add a multiple choice question: "How did you hear about us?" with options "Google", "Friend", "Social Media"
   - Add a rating question: "How would you rate your experience?" (1–5)
4. **Reorder:** Drag the rating question to the top to show drag-and-drop works.
5. **Brand it:** Pick a brand color (something visually distinct), paste in a logo URL.
6. **Publish:** Toggle the survey to published. Copy the public URL.
7. **Respond:** Open the public URL in a new tab (or incognito). Show the branding. Fill out the survey. Submit.
8. **View responses:** Go back to the dashboard → click into the survey → view responses → see the submission.

**Pro tip:** Do the demo in one smooth take. Practice once before recording.

---

### Key Decisions to Highlight (pick 3–4)

**Decision 1: Email OTP instead of OAuth**
> "I chose email OTP because it's the simplest auth flow I could stand behind. There's no OAuth setup, no third-party dependency for MVP. The code logs the OTP to the terminal so I can demo without an email service. In production, I'd plug in Resend or SES — the architecture supports it, I just didn't want to add that complexity in a week."

**Decision 2: Tailwind CSS v4 with custom properties for branding**
> "I used Tailwind v4 because it's fast to build with and v4 specifically requires zero config files — just `@import 'tailwindcss'` in one CSS file and you're done. For branding, I set a `--color-brand` CSS variable on the survey wrapper using inline styles, then reference it in Tailwind classes with `bg-[var(--color-brand)]`. This means the brand color flows through the whole survey UI without any React context or prop drilling. Every class name in every component is readable and self-documenting."

**Decision 3: D1 for everything, no KV**
> "The README mentions D1, KV, and R2 as options. I put everything in D1 because it's all relational data — surveys have questions, questions have answers, users have sessions. KV's eventual consistency would have been a problem for sessions. R2 is only useful for file uploads, and I used URL-based logos for MVP."

**Decision 4: Question options as a JSON column**
> "I stored multiple-choice options as a JSON array in a TEXT column instead of a separate `options` table. For this scale — a survey with maybe 10 questions and 5 options each — a join table is overkill. JSON.parse on read, JSON.stringify on write. It's three lines of code instead of a whole table with foreign keys."

---

### "What I'd Do Differently"

Pick ONE honest thing. Examples:

- **"I'd add real email sending early."** "I logged OTP codes to the console, which works for demo but isn't production-ready. If I had another week, I'd integrate Resend on day 1 so the full flow works without checking the terminal."

- **"I'd invest more in the response viewing UX."** "The responses page is a basic table. With more time, I'd add per-question charts — bar charts for multiple choice, average rating displays, maybe a CSV export."

- **"I'd add optimistic updates to the builder."** "Right now, every change to a question does a round-trip to the API before the UI updates. With more time, I'd update the UI immediately and sync in the background, so the builder feels instant."

---

### How to Describe AI Tool Usage

Be specific and honest. Example framing:

> "I used [Cursor / Claude / Copilot] throughout the project. It was most helpful for:
> - **Boilerplate:** generating the initial route handlers and form components.
> - **CSS:** getting the base styles and layout right quickly.
> - **D1 queries:** writing the SQL and the TypeScript types for query results.
>
> Where it got in the way:
> - **Wrangler config:** it sometimes generated config for older versions of wrangler. I had to check the docs.
> - **Over-engineering:** it wanted to add error boundaries, context providers, and custom hooks for everything. I kept pulling it back to simpler patterns.
>
> I reviewed every line before committing and rewrote anything I couldn't explain."

**The key message: "I used AI as a drafting tool, not an autopilot. I own every line."**
