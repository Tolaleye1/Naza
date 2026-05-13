# FR-02 — Hero Section

## Goal
Build the full-viewport hero section with the girlfriend's name animated in letter-by-letter,
floating hearts, a subtitle line, and a scroll-down indicator. This is the first thing
visitors see — it must be stunning and immediately set the romantic vintage mood.

## Design Reference
- Deep burgundy background (`var(--color-burgundy)`)
- Dark rose/floral texture overlay at 8% opacity (use `public/images/rose-bg.svg` — generate
  a simple repeating rose silhouette SVG if the file doesn't exist)
- Name in Dancing Script, very large, cream text, letter-by-letter reveal animation
- Floating hearts: `♥` characters scattered, floating upward, varying sizes and delays
- Subtitle below the name, smaller, Lato 300, muted cream
- Scroll indicator: small animated chevron at very bottom, cream, bouncing

## Implementation

### Component: `components/sections/hero-section.tsx`
Mark as `"use client"` — needs animation state.

#### Name Animation
- Split `Naza` into individual characters
- Each character animates in with `opacity: 0 → 1` + `translateY(20px → 0)`
- Stagger delay: `i * 0.08s` per character
- Use CSS `@keyframes fadeInUp` or Tailwind animation
- Pause animation until component is mounted (avoid SSR flash)

#### Floating Hearts
- Render 12–16 `♥` characters absolutely positioned
- Random `left` positions (10% to 90%)
- Random animation duration (6s to 14s)
- Random animation delay (0s to 8s)
- `animation: floatHeart linear infinite`
- Colors alternate between `var(--color-rose)` and `var(--color-rose-light)`
- Sizes: `text-sm` to `text-2xl` mixed

Define `@keyframes floatHeart` in globals.css:
```css
@keyframes floatHeart {
  0%   { transform: translateY(0) rotate(-15deg) scale(1); opacity: 0.8; }
  50%  { opacity: 1; transform: translateY(-50vh) rotate(10deg) scale(1.1); }
  100% { transform: translateY(-100vh) rotate(-5deg) scale(0.8); opacity: 0; }
}
```

#### Scroll Indicator
- Position: `absolute bottom-8 left-1/2 -translate-x-1/2`
- A `›` chevron rotated 90deg, or a small arrow SVG
- Animation: `animate-bounce` (Tailwind)
- Color: `var(--color-rose-light)` at 70% opacity

#### Layout
```
section
  └── div.overlay (rose texture, position absolute, inset 0, opacity 8%)
  └── div.content (relative, z-10, flex col center, min-h-screen)
      └── h1 (name, font-script, text-hero)
      └── p (subtitle, font-body, text-lg, cream-muted)
      └── div.hearts (absolute inset 0, overflow hidden, pointer-events-none)
          └── [heart spans]
      └── div.scroll-indicator (absolute bottom)
```

### Add to `app/page.tsx`
Import and render `<HeroSection />` as the first section.
Hero takes `name` and `subtitle` as props with default values set to `Naza`.

## Text Content (Placeholder — Boyfriend to update)
- Name: `Naza`
- Subtitle: `"Happy Birthday, my heart ♥"`

## Acceptance Criteria
- [ ] Full viewport height on all screen sizes
- [ ] Name animates in letter-by-letter on page load
- [ ] Floating hearts are visible and animating upward
- [ ] Background is dark burgundy with subtle texture
- [ ] Scroll indicator bounces at the bottom
- [ ] No horizontal scroll on mobile
- [ ] Visually matches the dark luxury aesthetic from ui-context.md
- [ ] TypeScript clean, build passes
