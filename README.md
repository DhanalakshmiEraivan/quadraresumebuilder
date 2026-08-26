# QuadraResume — World-Class AI Career Studio

React + TypeScript + Vite + Supabase career platform with a premium light/ink-blue visual system.

## What this build fixes

- **Existing-resume import:** layout-aware PDF OCR now detects separated columns, keeps the left rail and main column in logical order, groups company/institution lines correctly, and uses deterministic extraction as the source of truth. Backend AI only fills missing scalar fields instead of overwriting good structured arrays.
- **Original resume content:** imported text is preserved as closely as the source allows; nothing is intentionally rewritten during import. Every extracted field remains editable.
- **PDF export:** downloads are rendered from a clean off-screen A4 clone, not the scaled/shadowed editor preview. UI transforms, box shadows and filters are removed before html2pdf captures the page, eliminating the grey shadow artifact.
- **Profile photos:** private `resume-assets` storage is configured in SQL. If a deployment has not yet applied the storage migration, the editor falls back to a local image data URL instead of showing `Bucket not found` and losing the photo.
- **Template picker:** 50+ templates are displayed as visual live previews in a dedicated modal rather than a text-only select.
- **Automatic saving:** existing resumes are debounced and saved to Supabase after edits; explicit Save remains available.
- **Free usage:** all free-plan tool actions share one monthly counter: **5 total actions per calendar month**, not 5 per tool.
- **Ownership:** the earliest registered account is the initial admin/owner. The owner can promote or revoke additional admins from the admin console.
- **Authentication:** email sign-in/sign-up, Google OAuth, forgot-password email flow and secure password reset page are included.
- **Landing page:** rebuilt as a long-form product site with About, Features, Templates, Pricing, security, workflow and CTA sections plus remote professional imagery. Videos were removed.
- **Visual language:** the previous blue/green gradient treatment has been replaced with the light paper + ink navy + electric blue system.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Type check:

```bash
npm run typecheck
```

## Environment

Copy `.env.example` to `.env` and configure:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Never put an LLM secret/API key in the Vite frontend.

## Supabase setup

Run every migration in `supabase/migrations` in filename order. The latest migration is:

`20260826000000_five_total_monthly_credits.sql`

It changes the Free plan to a shared **5-action monthly quota** and keeps Unlimited/Business/Admin unlimited.

The SQL also configures:

- `profiles` + admin/user roles
- first-account ownership
- resume row-level security
- `resume-assets` private bucket
- payment-proof bucket
- UPI payment submissions
- admin approval functions
- monthly credit tracking
- realtime resume metadata

### Google login

In Supabase Authentication → Providers → Google, enable Google and add your Google OAuth client credentials. Set the Supabase redirect configuration so the site origin is allowed. The frontend calls `signInWithOAuth({ provider: 'google' })` and returns to the current site.

### Password reset

The app sends a Supabase reset email to:

`<site-origin>?reset=1`

The reset page requires a new password + confirmation and updates the authenticated account directly through Supabase Auth.

## Optional backend AI parser

The import pipeline works without an external AI key. For stronger semantic parsing, deploy:

`supabase/functions/parse-resume/index.ts`

and set `OPENAI_API_KEY` as a Supabase Edge Function secret.

The backend parser is defensive: it is validated before its output is allowed into the structured resume model.

## Import pipeline

```text
Upload
  ↓
File validation
  ↓
PDF.js / Mammoth / text parser / Tesseract OCR
  ↓
Column-aware OCR line reconstruction
  ↓
Section detection
  ↓
Deterministic structured parser
  ↓
Optional backend AI semantic fill
  ↓
Defensive normalization
  ↓
Editable ResumeData
  ↓
Live template + ATS + autosave + history
```

## Template system

The project contains 50+ template definitions using reusable A4 layout primitives. The editor's **Browse 50+ templates** modal renders live visual samples using the current resume data, and selecting a card immediately updates the live document.

## PDF export

The editor preview is intentionally scaled for screen viewing. PDF generation never captures that scaled preview directly. It creates a clean 210mm × 297mm export surface and removes shadows/transforms before rasterization.


## Latest UX upgrade

- The public site now has separate About Us, Features and Pricing pages.
- The public navbar includes an authentication-gated AI Resume Builder entry point.
- The AI Resume Builder starts directly from a clean canvas; the old import-existing-resume choice has been removed from the builder UI.
- Template selection uses lightweight visual thumbnails instead of mounting every full resume renderer at once, preventing blank/skeleton-looking template grids.
- Lucide React is pinned to a newer compatible release so icons such as BriefcaseBusiness are no longer missing from the installed package.
- Marketing imagery is focused on professional workspaces, career planning and interview preparation.

## Latest hardening update — 2026-08-26

- Resume editor autosaves drafts after a short idle window and can create the first draft automatically.
- Resume input state is kept local while typing; realtime database refreshes no longer replace the active editor state, preventing cursor jumps/flicker.
- Resume versions are created on explicit Save rather than on every keystroke.
- Template thumbnails use a rich sample resume canvas instead of placeholder bars.
- Added a public Contact Us page with Supabase-backed `contact_messages` storage.
- Added realtime Contact Inbox to the Admin Console with read/replied/closed status and stored admin replies.
- Added `/public/media/ai-resume-hero.svg` for the dedicated AI resume builder landing hero.
- Apply `supabase/migrations/20260826110000_contact_messages.sql` to enable the contact center backend.
"# quadraresumebuilder" 
"# quadraresumebuilder" 
"# quadraresumebuilder" 
