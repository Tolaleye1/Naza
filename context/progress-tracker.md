# Progress Tracker

## Current Phase
🟡 Setup — FR-01 complete, ready for Hero section

## Current Goal
Scaffold Next.js project, install dependencies, configure Supabase, set up design system

---

## Feature Specs Queue

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 01 | Project Scaffold + Design System | ✅ Complete | Next.js 15 scaffold, design tokens, Supabase helpers, and placeholder structure added |
| 02 | Hero Section | ✅ Complete | Full-viewport hero with letter-by-letter name animation, 16 floating hearts, rose texture overlay, and bouncing scroll indicator |
| 03 | Music Player | ✅ Complete | Fixed bottom player bar with muted autoplay, first-interaction unmute, vinyl spin animation, play/pause + mute controls, graceful missing-file handling |
| 04 | Love Letter Section | ⬜ Pending | |
| 05 | Gallery Section | ⬜ Pending | |
| 06 | Shoutouts Feed | ⬜ Pending | |
| 07 | Shoutout Upload Form | ⬜ Pending | |
| 08 | Gift Section + Footer | ⬜ Pending | |
| 09 | Admin Panel | ⬜ Pending | |
| 10 | Polish + Deployment | ⬜ Pending | |

---

## Completed Units
- FR-01: Project scaffolded on Next.js 15 with Tailwind v4 tokens, shadcn/ui baseline, Supabase helpers, and placeholder app structure.

---

## Architectural Decisions Log
- Kept the project on Tailwind CSS v4 and added a root `tailwind.config.ts` plus CSS custom properties so later sections can use semantic romance-themed utility classes.
- Added both browser and admin/server Supabase client factories; the actual database SQL still requires manual execution in the Supabase dashboard because no live project credentials were provided.
- Updated the shoutout-related feature specs to use immediate public publishing with a delete-only admin safety tool instead of approval/rejection states.

---

## Session Notes
- 2026-05-13: Started FR-01 project scaffold and design system setup.
- 2026-05-13: Completed FR-01 verification with `npx tsc --noEmit`, `npm run lint`, `npm run build`, and a successful `npm run dev` boot on port 3001 because port 3000 was already in use locally.
- 2026-05-13: Reviewed `context/current-issues.md` and aligned FR-06, FR-07, FR-09, and FR-10 with the immediate-publish shoutout flow.

---

## Environment Variables Checklist
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `ADMIN_PASSWORD`

## Pre-Launch Checklist (Boyfriend To Fill In)
- [ ] Girlfriend's name added everywhere marked `Naza`
- [ ] Boyfriend's name added everywhere marked `[BOYFRIEND_NAME]`
- [ ] Birthday date added everywhere marked `[BIRTHDAY_DATE]`
- [ ] Love letter body text written and inserted
- [ ] Lewis Capaldi song file placed at `/public/audio/song.mp3`
- [ ] Lewis Capaldi song name updated in `context/project-overview.md` and music player
- [ ] Gallery photos/videos uploaded to Supabase Storage `gallery` bucket
- [ ] Gift details (bank account / payment link) added to gift section
- [ ] `ADMIN_PASSWORD` set in Vercel env vars
- [ ] Domain/URL configured on Vercel
