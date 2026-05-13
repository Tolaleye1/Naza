# FR-04 — Love Letter Section

## Goal
Build the "A Letter To You" section — a parchment-colored card styled as a physical
love letter with stamp border, postage stamp decorations, postmark, cursive salutation,
and the boyfriend's love letter body text. This is the most emotionally important
section and needs to feel like a real, tactile letter.

## Design Reference
- Section background: `var(--color-parchment)` — cream/off-white
- Card: `var(--color-parchment-dark)`, centered, max-width 680px, stamp border effect
- Postage stamps: top-right corner, two SVG stamps in crimson + gold
- Postmark circle: bottom-right of card, SVG circle with "SEALED WITH LOVE"
- "To:" and "From:" fields: Lato, thin red underlines
- Salutation: Dancing Script, crimson, `text-lg`
- Body: Lato 300, italic, ink color, line-height 1.9
- Date: bottom-left, Lato small, ink muted

## Implementation

### Component: `components/sections/letter-section.tsx`
Server component (no interactivity needed).

#### Stamp Border Effect
Use CSS to create a perforated/scalloped edge around the card:
```css
.stamp-border {
  position: relative;
  background: var(--color-parchment-dark);
  /* Scalloped edge using radial-gradient on the border */
  padding: 2rem;
  --stamp-size: 10px;
  background-image:
    radial-gradient(circle at 0 50%, var(--color-parchment) var(--stamp-size), transparent 0),
    radial-gradient(circle at 100% 50%, var(--color-parchment) var(--stamp-size), transparent 0);
}
```
Alternative simpler approach: a dashed border with thick border-radius circles, or
use an SVG border element. Choose whichever renders more accurately to the stamp aesthetic.

#### SVG Postage Stamps (inline SVG in the component)
Two small square stamps (80x80px each) in the top-right area:
- Stamp 1: heart icon, crimson border with serrated edge, "LOVE MAIL" label, gold background
- Stamp 2: envelope icon, crimson border with serrated edge, "FOREVER" label, cream background
Both use `var(--color-crimson)` and `var(--color-gold)` only.

#### SVG Postmark
Bottom right of the card. A circle with:
- Two horizontal wavy lines through the middle
- "SEALED WITH LOVE" text curving along the circle top
- Color: `var(--color-crimson)` at 50% opacity
Size: ~90x90px

#### Card Content Structure
```
section.letter-section (bg-parchment, py-24, px-4)
  └── div.section-label ("A Letter To You", Playfair Display, crimson, text-center, mb-12)
  └── div.letter-card (stamp-border class, max-w-2xl, mx-auto, relative)
      ├── div.stamps-area (absolute top-4 right-4, flex gap-2)
      │     ├── StampSVG (heart)
      │     └── StampSVG (envelope)
      ├── div.address-lines (mt-8, mb-6)
      │     ├── p "To: Naza" (font-script, crimson, with underline)
      │     └── p "From: [BOYFRIEND_NAME]" (font-script, crimson, with underline)
      ├── p.salutation "My Dearest Naza," (font-script, crimson, text-xl, mt-4)
      ├── div.letter-body (font-body, italic, ink, mt-4, space-y-4)
      │     └── [LETTER_BODY_PARAGRAPHS — split into <p> tags]
      ├── p.date (font-body, text-sm, ink, mt-8) "[BIRTHDAY_DATE]"
      └── div.postmark (absolute bottom-6 right-6)
            └── PostmarkSVG
```

#### Letter Body Placeholder
Use a romantic placeholder text that the boyfriend replaces before launch:
```
[Replace this with your love letter. Write from the heart.
Tell her what she means to you, your favorite memories together,
and why today is so special. This is your moment to make her cry happy tears.]
```
Add a JSX comment above it: `{/* BOYFRIEND: Replace the letter body below */}`

### Add to `app/page.tsx`
Import and render `<LetterSection />` below `<HeroSection />`.

## Acceptance Criteria
- [ ] Section is visually distinct from the hero — clear parchment cream background
- [ ] Stamp border is visible and resembles a letter edge
- [ ] Both postage stamps render in top-right corner
- [ ] Postmark SVG renders in bottom-right corner
- [ ] "To:" and "From:" lines use Dancing Script
- [ ] Letter body is in italic Lato
- [ ] Card is centered with max-width constraint
- [ ] Fully responsive on mobile (card takes 90% width)
- [ ] TypeScript clean, build passes
