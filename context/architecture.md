# Architecture Context

## Stack

| Layer | Technology | Role |
|-------|------------|------|
| Framework | Next.js 15 (App Router) | Full-stack, SSR, routing |
| Styling | Tailwind CSS v4 + CSS custom properties | Design tokens, layout |
| UI Components | shadcn/ui | Base component primitives |
| Database | Supabase (PostgreSQL) | Shoutout records, approval status |
| Storage | Supabase Storage | Gallery media, shoutout media uploads |
| Deployment | Vercel | Hosting, edge functions |
| Music | Self-hosted audio file in `/public/audio/` | Background song |
| Fonts | Google Fonts (Playfair Display, Dancing Script, Lato) | Typography |

## System Boundaries

- `app/` — Next.js App Router pages and layouts
- `app/api/` — API routes (shoutouts CRUD, admin actions)
- `components/sections/` — Full page sections (Hero, Letter, Gallery, Shoutouts, Gift)
- `components/ui/` — shadcn primitives (DO NOT MODIFY after generation)
- `components/shared/` — Shared components (MusicPlayer, ShoutoutCard, PolaroidFrame)
- `lib/supabase/` — Supabase client (server and browser instances)
- `lib/utils/` — Utility functions
- `context/` — Six-file context methodology docs (not shipped to production)

## Supabase Schema

### Table: `shoutouts`

```sql
create table shoutouts (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null,
  message_type text not null check (message_type in ('text', 'photo', 'video')),
  text_content text,
  media_url text,
  youtube_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);

-- Index for fetching approved shoutouts efficiently
create index shoutouts_status_created on shoutouts(status, created_at desc);
```

### Supabase Storage Buckets

- `gallery` — Boyfriend's curated photos/videos (private, served via signed URLs or public policy)
- `shoutouts-media` — User-uploaded photos/videos for shoutouts (private until approved)

### Row Level Security (RLS)

- `shoutouts`: public INSERT (anyone can submit), only service role can UPDATE status
- `shoutouts-media` bucket: public upload, admin-only delete

## Storage Model

- **Supabase DB**: Shoutout metadata (sender name, type, text content, media URL, status)
- **Supabase Storage `gallery`**: Curated couple photos/videos (uploaded manually by boyfriend)
- **Supabase Storage `shoutouts-media`**: User-uploaded shoutout photos/videos
- **`/public/audio/`**: Lewis Capaldi song MP3 (client must provide the file, named `song.mp3`)
- **`/public/images/`**: Static decorative assets (stamp SVGs, texture overlays, etc.)

## Auth and Access Model

- No user authentication for public visitors
- Admin route `/admin` is password-protected via `ADMIN_PASSWORD` env variable
  - Check: compare submitted password against `process.env.ADMIN_PASSWORD` server-side
  - Session: simple cookie set on successful login, cleared on logout
  - No Clerk, no NextAuth — keep it minimal
- Supabase service role key used only in API routes (never exposed to client)

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/shoutouts` | Fetch approved shoutouts (paginated) |
| POST | `/api/shoutouts` | Submit a new shoutout (pending status) |
| PATCH | `/api/shoutouts/[id]` | Admin: approve or reject a shoutout |
| GET | `/api/gallery` | Fetch gallery items from Supabase Storage |
| POST | `/api/admin/login` | Admin password check, set session cookie |

## Invariants — Rules the Codebase Must Never Violate

1. The `SUPABASE_SERVICE_ROLE_KEY` must NEVER be used in client-side code
2. All Supabase mutations (INSERT, UPDATE) happen through API routes — never directly from client
3. No hardcoded color values — always use CSS custom properties defined in `globals.css`
4. The music file path is `/audio/song.mp3` — do not reference it anywhere else
5. The admin password check must happen server-side — never send the password to the client for comparison
6. Media files are uploaded to Supabase Storage — never stored in the public folder (except static assets)
7. All user-submitted content is sanitized before storing
8. Shoutouts only appear in the public feed after status = 'approved'

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
```
