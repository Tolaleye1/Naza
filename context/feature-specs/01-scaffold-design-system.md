# FR-01 — Project Scaffold + Design System

## Goal
Bootstrap a clean Next.js 15 project with all dependencies installed, Supabase connected,
Google Fonts loaded, shadcn/ui configured with dark theme, and all CSS custom properties
from ui-context.md registered in globals.css. After this unit, the project should run
on localhost with the correct fonts and color tokens available globally.

## Implementation

### 1. Create Next.js Project
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir no --import-alias "@/*"
```

### 2. Install Dependencies
```bash
npm install @supabase/supabase-js
npm install @supabase/ssr
npx shadcn@latest init   # choose: Default style, Zinc base, CSS variables: yes
npx shadcn@latest add button card dialog input textarea badge tabs
```

### 3. Google Fonts
In `app/layout.tsx`, load via `next/font/google`:
```typescript
import { Playfair_Display, Dancing_Script, Lato } from 'next/font/google';
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const dancing = Dancing_Script({ subsets: ['latin'], variable: '--font-dancing' });
const lato = Lato({ subsets: ['latin'], weight: ['300','400','700'], variable: '--font-lato' });
```
Apply all three variables to the `<html>` element.

### 4. globals.css
Register ALL CSS custom properties from `ui-context.md`:
- Full color palette (all `--color-*` variables)
- Font variables (`--font-playfair`, `--font-dancing`, `--font-lato`)
- Text scale variables (`--text-hero` through `--text-xs`)
- Base body styles: `font-family: var(--font-lato)`, background `var(--color-parchment)`

### 5. tailwind.config.ts
Extend the theme to map CSS variables to Tailwind utilities:
```typescript
theme: {
  extend: {
    colors: {
      parchment: 'var(--color-parchment)',
      'parchment-dark': 'var(--color-parchment-dark)',
      ink: 'var(--color-ink)',
      crimson: 'var(--color-crimson)',
      'crimson-deep': 'var(--color-crimson-deep)',
      rose: 'var(--color-rose)',
      burgundy: 'var(--color-burgundy)',
      'burgundy-mid': 'var(--color-burgundy-mid)',
      gold: 'var(--color-gold)',
      'cream-text': 'var(--color-cream-text)',
    },
    fontFamily: {
      display: 'var(--font-playfair)',
      script: 'var(--font-dancing)',
      body: 'var(--font-lato)',
    },
  }
}
```

### 6. Supabase Setup
- Create `lib/supabase/server.ts` — admin client with service role key
- Create `lib/supabase/client.ts` — browser client with anon key
- Create `lib/supabase/types.ts` — Supabase Database type scaffold
- Create `.env.local` with all four env var placeholders (values empty, keys present)

### 7. Types
Create `types/shoutout.types.ts` with all types from code-standards.md.

### 8. Folder Structure
Create empty folders/index files:
```
app/
  admin/
  api/shoutouts/
  api/gallery/
  api/admin/
components/
  sections/
  shared/
  ui/        ← managed by shadcn, do not touch
lib/
  supabase/
  utils/
types/
public/
  audio/     ← placeholder README.md: "Place song.mp3 here"
  images/
```

### 9. Root Layout
`app/layout.tsx` — applies fonts, sets html lang="en", includes a basic metadata object:
```typescript
export const metadata = {
  title: "Naza's Special Day 🎂",
  description: "A birthday website made with love",
};
```

### 10. Root Page
`app/page.tsx` — temporary placeholder:
```typescript
export default function Home() {
  return (
    <main className="min-h-screen bg-burgundy flex items-center justify-center">
      <p className="font-script text-4xl text-cream-text">Coming soon with love 💌</p>
    </main>
  );
}
```

## Protected Files (Do Not Touch After This Unit)
- `components/ui/**` — shadcn managed

## Acceptance Criteria
- [ ] `npm run dev` starts without errors on localhost:3000
- [ ] Page shows "Coming soon with love 💌" in Dancing Script font
- [ ] Background is deep burgundy (`var(--color-burgundy)`)
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] All CSS custom properties are accessible in browser dev tools
- [ ] Supabase client files exist (even with placeholder env vars)
- [ ] `npm run build` passes
