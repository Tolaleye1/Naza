# FR-08 — Gift Section + Footer

## Goal
Build the gift section (dark luxury feel, ribbon bow, gift details with copy-to-clipboard)
and the footer (minimal, romantic, date + names + small heart motif).

## Gift Section Design Reference
- Background: `var(--color-burgundy)` — dark luxury, matches hero
- Centered gift card: `var(--color-burgundy-card)`, rounded-2xl, max-width 400px
- SVG ribbon bow at top of card in crimson + gold
- Heading: Playfair Display, cream-text
- Gift details: displayed in a monospace-style box, gold-light text
- Copy button: small icon button next to each detail
- Warm subtext from boyfriend (e.g. "Get her something special")

## Component: `components/sections/gift-section.tsx`
Server component.

### Ribbon Bow SVG
Inline SVG, centered above the card. A simple bow shape:
- Two loops (left and right) in `var(--color-crimson-deep)`
- Center knot in `var(--color-gold)`
- Two tails hanging down
Approximate size: 120x80px

### Gift Card Content
```
section (bg-burgundy, py-24, px-4)
  └── h2 "Gift Naza" (font-display, cream-text, text-center)
  └── p "Because she deserves the world" (font-script, rose-light, text-center, mb-12)
  └── div.gift-card (bg-burgundy-card, rounded-2xl, p-8, max-w-sm, mx-auto, text-center)
      ├── RibbonSVG (mb-6)
      ├── h3 "Send Some Love" (font-display, cream-text, text-lg)
      ├── p.note "[GIFT_NOTE — boyfriend fills in, e.g. 'She's been eyeing...']"
      ├── div.gift-details (mt-6, space-y-3)
      │     └── [GiftDetailRow for each detail]
      └── p.tagline "Every penny spent with love 💝" (font-script, rose-light, mt-6)
```

### GiftDetailRow Component (inline in gift-section.tsx)
Props: `label: string`, `value: string`
```
div (flex items-center justify-between, bg-burgundy, rounded-lg, px-4, py-2)
  ├── span.label (font-body, text-xs, cream-muted)
  ├── span.value (font-mono, text-sm, gold-light)
  └── button.copy (icon, copies value to clipboard, shows "✓" for 2 seconds on success)
```

### Placeholder Gift Details
```typescript
const giftDetails = [
  { label: 'Bank Name', value: '[BANK_NAME]' },
  { label: 'Account Name', value: '[ACCOUNT_NAME]' },
  { label: 'Account Number', value: '[ACCOUNT_NUMBER]' },
];
// OR a single payment link:
// { label: 'Payment Link', value: '[PAYMENT_LINK_URL]' }
// Boyfriend replaces before launch
```
Add JSX comment: `{/* BOYFRIEND: Replace gift details below */}`

---

## Footer Component: `components/sections/footer-section.tsx`
Server component. Minimal and romantic.

```
footer (bg-burgundy, border-t border-crimson/20, py-12, px-4, text-center)
  ├── p "[BOYFRIEND_NAME] ♥ Naza" (font-script, text-xl, rose-light)
  ├── p "[BIRTHDAY_DATE]" (font-body, text-sm, cream-muted, mt-2)
  ├── p "Made with love, just for you 💌" (font-body, text-xs, cream-muted, mt-4)
  └── div.hearts (3 small static ♥ icons, rose, spacing)
```

## Add to `app/page.tsx`
Render `<GiftSection />` and `<FooterSection />` at the bottom.

## Acceptance Criteria
- [ ] Gift section has dark burgundy background matching hero
- [ ] Ribbon bow SVG renders above the card
- [ ] Gift details display with copy-to-clipboard
- [ ] Copy button shows confirmation state for 2 seconds
- [ ] Footer is clean, minimal, romantic
- [ ] Footer names and date are in Dancing Script / correct fonts
- [ ] TypeScript clean, build passes
