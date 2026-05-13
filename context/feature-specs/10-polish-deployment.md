# FR-10 — Polish + Deployment

## Goal
Final polish pass: smooth scroll between sections, section reveal animations on scroll,
performance audit, metadata/OG tags, and Vercel deployment setup.

## Implementation

### 1. Smooth Scroll
In `globals.css`:
```css
html { scroll-behavior: smooth; }
```

### 2. Section Reveal Animations
Using Intersection Observer (no external library):
Create `hooks/use-intersection-observer.ts`:
```typescript
export function useInView(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, inView };
}
```
Apply to each section: `opacity-0 translate-y-8 transition-all duration-700` → `opacity-100 translate-y-0`
when `inView` is true.

### 3. Performance
- Verify all `<Image>` components have correct `width`/`height`/`priority` props
- Add `priority` to hero section images (if any)
- Verify no unused CSS is being shipped (Tailwind purge is default)
- Verify audio file is NOT in the JS bundle (it's in `/public`)

### 4. Open Graph Metadata
In `app/layout.tsx`, extend the metadata object:
```typescript
export const metadata: Metadata = {
  title: "Happy Birthday Naza 🎂",
  description: "A special day deserves a special place. Made with love.",
  openGraph: {
    title: "Happy Birthday Naza 🎂",
    description: "A special day deserves a special place.",
    type: 'website',
    // Add an OG image if available
  },
};
```

### 5. Favicon
Add a simple ♥ emoji favicon or a small heart PNG to `/public/favicon.ico`.

### 6. Mobile Viewport Meta
Verify `<meta name="viewport" content="width=device-width, initial-scale=1" />` is in layout.

### 7. Vercel Deployment Prep
Create `vercel.json` in root:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

Add `postinstall` script in `package.json` — NOT needed since we're not using Prisma.

### 8. Environment Variables Checklist
In Vercel dashboard, set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`

### 9. Pre-launch Content Replacements
Scan ALL files for placeholder tokens and confirm they are replaced:
- `Naza`
- `[BOYFRIEND_NAME]`
- `[BIRTHDAY_DATE]`
- `Someone You Loved`
- `[LETTER_BODY_PARAGRAPHS]`
- `[GIFT_DETAILS]`

### 10. Final Build Verification
```bash
npm run build
# Must pass with zero errors and zero warnings
```

## Acceptance Criteria
- [ ] Smooth scroll works between sections
- [ ] Sections reveal on scroll (fade + slide up)
- [ ] `npm run build` passes clean
- [ ] OG tags are set correctly
- [ ] All `[PLACEHOLDER]` tokens are replaced with real content
- [ ] Site deploys to Vercel successfully
- [ ] Music plays on mobile (test on a real device)
- [ ] All shoutout features work on production (submit, appears in feed immediately, admin delete works)
- [ ] Lighthouse mobile score: Performance > 75, Accessibility > 90
