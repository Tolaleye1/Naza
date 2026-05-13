# FR-09 — Admin Panel

## Goal
Build a minimal password-protected admin panel at /admin where the boyfriend
can VIEW all shoutouts and DELETE any inappropriate ones. No approve/reject flow —
all shoutouts are live immediately. This is just a safety valve to remove anything
unwanted after the fact.

The PATCH route changes to a DELETE route only.
The dashboard shows all shoutouts (newest first) with a Delete button per card.

## Routes

### `app/api/admin/login/route.ts` (POST)
```typescript
// Body: { password: string }
// Check: password === process.env.ADMIN_PASSWORD
// On success: set httpOnly cookie 'admin_session' = 'authenticated', maxAge 86400
// Return: { success: true } or 401
```

### `app/api/shoutouts/[id]/route.ts` (DELETE)
```typescript
// Auth check: read 'admin_session' cookie, return 401 if not authenticated
// Delete the shoutout record in DB using supabaseAdmin
// Return: { success: true }
```

### `app/admin/page.tsx`
Server component — check cookie server-side.
If not authenticated: render login form only.
If authenticated: render the admin dashboard.

## Admin Login Page
Simple centered card:
```
div (min-h-screen bg-burgundy, flex center)
  └── div.card (bg-burgundy-card, p-8, rounded-xl, max-w-sm, w-full)
      ├── h1 "Admin Panel 🔑" (font-display, cream-text)
      ├── p "Birthday site admin" (font-body, cream-muted, text-sm)
      ├── input[type=password] (placeholder "Enter password", mt-6)
      ├── button "Login" (crimson bg, cream text, w-full, mt-4)
      └── p.error (if wrong password, error color)
```
Make this a `"use client"` component inside `app/admin/page.tsx` via a separate
`AdminLoginForm` client component.

On successful login: call `/api/admin/login`, then redirect to `/admin`.

## Admin Dashboard (authenticated state)

### Data Fetching
`app/admin/page.tsx` fetches from DB using `supabaseAdmin`:
- All shoutouts ordered by `created_at desc`
- Total shoutout count

### Layout
```
div (min-h-screen bg-parchment)
  └── header (bg-burgundy, px-8, py-4, flex justify-between)
  │     ├── h1 "Admin Panel" (font-display, cream-text)
  │     └── div (total count badge, logout button)
  └── main (px-8, py-8, max-w-4xl, mx-auto)
      ├── h2 "All Shoutouts ([count])" (font-display, crimson)
      └── div.list (space-y-4)
          └── [AdminShoutoutCard for each shoutout]
```

### AdminShoutoutCard Component (client, in `components/shared/admin-shoutout-card.tsx`)
Props: `shoutout: Shoutout`, `onDelete: (id) => void`

Display:
- Sender name (Playfair, crimson)
- Message type badge
- Content preview (text shown directly, image shown as thumbnail, video shown as filename)
- Timestamp
- One button: "Delete" (red)
- Loading state per card while action is in flight

On delete: call `DELETE /api/shoutouts/[id]`, then remove card from list optimistically.

### Logout
`/api/admin/logout` (POST) — clears the `admin_session` cookie, redirects to `/admin`.
Add a logout button to the admin header.

## Acceptance Criteria
- [ ] `/admin` shows login form when not authenticated
- [ ] Wrong password shows error message
- [ ] Correct password sets cookie and shows dashboard
- [ ] Dashboard shows all shoutouts
- [ ] Delete button removes a shoutout successfully
- [ ] Logout clears session and returns to login screen
- [ ] Admin route is inaccessible without the cookie (server-side check)
- [ ] TypeScript clean, build passes
