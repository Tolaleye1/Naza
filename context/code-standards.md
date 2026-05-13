# Code Standards

## Language & Runtime

- TypeScript strict mode enabled — no `any`, no implicit `any`
- Target: ES2022, Node 20+
- Next.js 15 App Router — use Server Components by default
- Add `"use client"` only when the component needs: useState, useEffect, event handlers, browser APIs

## File & Folder Naming

- Files: `kebab-case.tsx` (e.g., `shoutout-card.tsx`, `music-player.tsx`)
- Components: PascalCase export (e.g., `export default function ShoutoutCard`)
- Hooks: `use-*.ts` (e.g., `use-shoutouts.ts`)
- API routes: `app/api/[resource]/route.ts`
- Types: `types/` folder, `*.types.ts` naming

## Component Patterns

```typescript
// Server component (default)
export default async function GallerySection() {
  const items = await getGalleryItems(); // server-side data fetch
  return <section>...</section>;
}

// Client component — only when needed
"use client";
export default function ShoutoutForm() {
  const [loading, setLoading] = useState(false);
  ...
}
```

## TypeScript Types

Define all shared types in `types/`:

```typescript
// types/shoutout.types.ts
export type MessageType = 'text' | 'photo' | 'video';
export type ShoutoutStatus = 'pending' | 'approved' | 'rejected';

export interface Shoutout {
  id: string;
  sender_name: string;
  message_type: MessageType;
  text_content?: string;
  media_url?: string;
  youtube_url?: string;
  status: ShoutoutStatus;
  created_at: string;
}
```

## API Routes

```typescript
// Always type the request body
// Always return typed responses
// Always handle errors with try/catch and appropriate status codes

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // validate...
    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Supabase Client Usage

```typescript
// lib/supabase/server.ts — server-side (use in API routes and Server Components)
import { createClient } from '@supabase/supabase-js';
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ONLY in server files
);

// lib/supabase/client.ts — client-side (anon key only)
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

## Styling Rules

- All colors via CSS custom properties — NEVER raw hex in className or style props
- Use Tailwind utility classes for layout and spacing
- Use CSS custom properties for all design tokens (colors, fonts, shadows)
- Tailwind config extended to map CSS vars to utility names where useful
- No inline `style={{ color: '#8B1A1A' }}` — use className with token

```typescript
// WRONG
<h1 style={{ color: '#8B1A1A' }}>Hello</h1>

// CORRECT
<h1 className="text-crimson font-display">Hello</h1>
// where text-crimson maps to var(--color-crimson) in tailwind.config.ts
```

## Error Handling

- API routes: always return `{ error: string }` on failure with correct HTTP status
- Client components: always show error state to user, never silent fail
- File uploads: validate type and size client-side before sending

## Form Handling

- Use controlled components with `useState` for form fields
- Validate before submission (client-side for UX, server-side for security)
- Show loading state during async operations
- Clear form after successful submission

## Image & Media

- All `<Image>` components use Next.js `Image` with explicit `width` and `height`
- All images have `alt` text
- Videos: use native `<video>` with `controls`, `preload="metadata"`, `playsInline`
- Music: use native `<audio>` with `preload="auto"`, controlled via React ref

## Commit Convention

```
feat: add shoutout upload form
fix: correct music autoplay on mobile
style: update polaroid frame shadow
chore: add supabase types
```

## Comments

- Comment WHY, not WHAT
- Mark all admin-only logic with `// ADMIN ONLY` comment
- Mark all env-var dependencies with `// requires: VARIABLE_NAME`
