# UI Context — Design System

## Aesthetic Direction

**Primary reference**: Classic Vintage Love Letter + Aesthetic Love Letter Canva Template
**Secondary references**: Luxury Floral Boutique (dark luxury sections), Taplink doodle hearts layout
**Mood**: A sealed envelope you open — warm, romantic, vintage, tactile, cinematic

The site has two visual modes that alternate by section:

- **Light mode sections** (Hero letter, shoutout form, gift card): Cream parchment `#FAF6F0` backgrounds,
  deep red `#8B1A1A` text and borders, cursive script headings, postage stamp borders
- **Dark mode sections** (Hero, gallery): Deep burgundy `#1A0A0A` or `#2D0A0A` backgrounds,
  cream text, subtle dark-rose texture overlay, gold accents

---

## Color Palette

Define all of these as CSS custom properties in `globals.css`. Never use raw hex values in components.

```css
:root {
  /* Base */
  --color-parchment:       #FAF6F0;   /* cream background for light sections */
  --color-parchment-dark:  #F0E8DC;   /* darker parchment for cards/borders */
  --color-ink:             #2C1A0E;   /* primary dark text on light sections */

  /* Reds */
  --color-crimson:         #8B1A1A;   /* primary red — borders, headings, stamps */
  --color-crimson-deep:    #5C0E0E;   /* darker red — hover states, pressed */
  --color-crimson-light:   #C4444480; /* semi-transparent red — subtle overlays */
  --color-rose:            #D4526E;   /* pink-rose accent — floating hearts */
  --color-rose-light:      #F2A0B0;   /* light pink — decorative elements */

  /* Dark luxury */
  --color-burgundy:        #1A0508;   /* deepest dark bg for hero */
  --color-burgundy-mid:    #2D0A0F;   /* dark section bg */
  --color-burgundy-card:   #3D1218;   /* card bg in dark sections */

  /* Gold */
  --color-gold:            #C9A84C;   /* postage stamp, premium accents */
  --color-gold-light:      #E8D08A;   /* gold highlights */

  /* Cream text (for dark sections) */
  --color-cream-text:      #FAF0E6;
  --color-cream-muted:     #D4C5B0;

  /* Neutrals */
  --color-border-stamp:    #8B1A1A;   /* stamp/letter borders */
  --color-shadow:          rgba(44, 26, 14, 0.15);

  /* States */
  --color-success:         #4A7C59;
  --color-error:           #C0392B;
}
```

---

## Typography

Install via Google Fonts in `layout.tsx`. Load all three.

```
Playfair Display  — serif headings, section titles, formal labels
Dancing Script    — cursive script, names, love letter salutations
Lato              — body text, form labels, UI copy (weights: 300, 400, 700)
```

### Usage Rules

```css
/* Section headings (e.g., "Our Gallery", "Leave a Shoutout") */
font-family: 'Playfair Display', serif;
font-weight: 700;

/* Names, love letter salutations, "To:", "From:", romantic callouts */
font-family: 'Dancing Script', cursive;
font-weight: 600;

/* All body copy, form fields, buttons, metadata */
font-family: 'Lato', sans-serif;
font-weight: 400;
```

### Font Scale

| Token | Size | Usage |
|-------|------|-------|
| `--text-hero` | clamp(3rem, 8vw, 7rem) | Hero name (Dancing Script) |
| `--text-xl` | clamp(1.75rem, 4vw, 3rem) | Section headings (Playfair) |
| `--text-lg` | clamp(1.25rem, 2.5vw, 1.75rem) | Sub-headings |
| `--text-base` | 1rem | Body text |
| `--text-sm` | 0.875rem | Captions, metadata |
| `--text-xs` | 0.75rem | Stamps, labels |

---

## Decorative Motifs & Patterns

### Postage Stamp Border
Used on: Love Letter card, shoutout text cards, gift section card.
Implementation: CSS with a `radial-gradient` or SVG clip-path creating scalloped edge effect.
```css
/* Stamp border pattern - semi-circles cut from edge */
border: 2px solid var(--color-border-stamp);
--stamp-size: 8px;
/* Use a repeating radial-gradient background-clip trick or SVG */
```

### Postmark Circle
Used on: Bottom right of letter card, bottom right of shoutout cards.
An SVG circle with two wavy lines through it, "LOVE MAIL" or "SEALED WITH LOVE" text.
Color: `var(--color-crimson)` at 60% opacity.

### Floating Hearts
Used on: Hero section, success state after submitting shoutout.
Small `♥` icons in `var(--color-rose)` and `var(--color-rose-light)`, animated upward float.
```css
@keyframes floatHeart {
  0%   { transform: translateY(0) rotate(-10deg); opacity: 1; }
  100% { transform: translateY(-100vh) rotate(10deg); opacity: 0; }
}
```

### Polaroid Frame
Used on: Gallery photos.
White border (`24px` top/side, `48px` bottom), slight random rotation (-3deg to +3deg),
box-shadow, optional handwritten-style caption below.

### Paper Texture Overlay
Used on: Parchment section backgrounds.
A subtle noise/grain overlay at 4% opacity using a repeating SVG filter or a static PNG.
Reference: `public/images/paper-texture.png` (to be provided or generated).

### Ribbon/Bow Illustration
Used on: Gift section card.
SVG ribbon bow in `var(--color-crimson)` with `var(--color-gold)` highlights.

---

## Section-by-Section Design Spec

### Hero Section
- Background: `var(--color-burgundy)` with dark rose pattern overlay at 8% opacity
- Centered content, full viewport height
- Name: Dancing Script, `var(--text-hero)`, `var(--color-cream-text)`, letter-by-letter animation
- Subtitle: Lato 300, `var(--color-cream-muted)`
- Scroll arrow: animated bounce, `var(--color-rose-light)`
- Floating hearts scattered across viewport

### Love Letter Card
- Background section: `var(--color-parchment)`
- Card: `var(--color-parchment-dark)`, stamp border, centered, max-width 680px
- "To / From" lines: Lato 400, `var(--color-ink)`, with a thin underline
- Salutation: Dancing Script, `var(--text-lg)`, `var(--color-crimson)`
- Body: Lato 300, `var(--color-ink)`, italic, line-height 1.8
- Postage stamps: top-right corner, SVG decorative stamps in gold + crimson

### Gallery Section
- Background: `var(--color-burgundy-mid)` — dark luxury feel
- Section heading: Playfair Display, `var(--color-cream-text)`, centered
- Photos: Polaroid frames on a dark surface with subtle scatter
- Videos: Rounded `16px` card with red play button overlay
- Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop

### Shoutouts Feed
- Background: `var(--color-parchment)` — back to light
- Each shoutout card: `var(--color-parchment-dark)` background, stamp border variant
- Sender name: Playfair Display semibold, `var(--color-crimson)`
- Message: Lato, `var(--color-ink)`
- Timestamp: `var(--text-sm)`, `var(--color-cream-muted)`

### Shoutout Upload Form
- Same parchment background
- Form card: white background, subtle shadow, rounded `12px`
- Inputs: thin underline style (not box input) on parchment background
- Submit button: `var(--color-crimson)` fill, cream text, stamp-shaped border-radius OR standard rounded
- Loading state: wax seal spinning animation
- Success state: envelope flying animation + floating hearts burst

### Gift Section
- Background: `var(--color-burgundy)` — back to dark luxury
- Gift card: `var(--color-burgundy-card)`, centered, ribbon bow SVG at top
- Heading: Playfair Display, `var(--color-cream-text)`
- Account details: monospace, `var(--color-gold-light)`, copy-to-clipboard button

### Music Player Bar
- Fixed bottom, full width
- Background: `var(--color-burgundy-card)`, 95% opacity + blur backdrop
- Height: 56px
- Left: vinyl disc icon (spinning CSS animation when playing)
- Center: Song name + Artist
- Right: Play/pause button + muted indicator
- On first user interaction anywhere on page: unmute and start playing

---

## Component Conventions

- All section wrappers: `min-h-screen`, horizontal padding `px-4 sm:px-8 lg:px-16`
- All section headings: `text-center mb-12`
- Cards max-width: `680px` (letter card), `400px` (shoutout card), `340px` (gift card)
- Border radius: `8px` (cards), `4px` (buttons), `0px` (stamp borders — square feel)
- Transitions: `transition-all duration-300 ease-in-out` as default
- Hover on cards: `translateY(-4px)` lift + shadow increase
- All images: `loading="lazy"`, `object-fit: cover`, explicit width/height

## Responsive Breakpoints

Follow Tailwind defaults:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

Mobile is the primary design target.
