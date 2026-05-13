# FR-06 — Shoutouts Feed

## Goal
Build the public shoutouts feed — a paginated grid of all submitted shoutouts.
Text shoutouts render as parchment cards. Photo shoutouts show the image with
sender name. Video shoutouts show an inline video player. Load 20 at a time
with a "Load more" button.

## API Route: `app/api/shoutouts/route.ts` (GET)
```typescript
// GET /api/shoutouts?page=1
// Fetches all shoutouts, 20 per page, ordered by created_at desc
// No status filter — all submitted shoutouts are public
// Returns: { shoutouts: Shoutout[], total: number, hasMore: boolean }
```
Use `supabaseAdmin` (service role).
Use `.range(offset, offset + 19)` for pagination.

## Shared Component: `components/shared/shoutout-card.tsx`
Props: `shoutout: Shoutout`

Three visual variants:

**Text card**: `var(--color-parchment-dark)`, stamp-border CSS class, padding.
- Sender name: Playfair Display semibold, crimson
- Message: Lato, italic, ink, mt-2
- Timestamp: text-xs, cream-muted, bottom right
- Small heart stamp icon (SVG) top-right corner

**Photo card**: Image fills card (aspect-ratio 4/3, object-cover), 
sender name overlay at bottom with gradient backdrop.

**Video card**: Same as Gallery VideoCard component, but smaller.
Sender name below video in Playfair crimson.

## Section Component: `components/sections/shoutouts-section.tsx`
Mark `"use client"` — needs pagination state.

State:
```typescript
const [shoutouts, setShoutouts] = useState<Shoutout[]>([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);
```

Fetch initial 20 on mount. "Load more" button fetches next 20 and appends.

Layout:
```
section (bg-parchment, py-24, px-4)
  └── h2 "Shoutouts from the Heart" (font-display, crimson, text-center)
  └── p "Everyone who loves you, sending their love" (font-script, ink)
  └── div.grid (grid cols-1 sm:cols-2 lg:cols-3, gap-6, mt-12)
      └── [ShoutoutCard for each]
  └── button "Load more shoutouts" (if hasMore)
  └── empty state (if 0 shoutouts)
```

Empty state: centered animated envelope emoji + "Be the first to leave a shoutout! 💌"

## Add to `app/page.tsx`
Render `<ShoutoutsSection />` below `<GallerySection />`.

## Acceptance Criteria
- [ ] Shoutouts display in responsive grid immediately after submission
- [ ] Three card types (text, photo, video) render correctly
- [ ] Load more button fetches next page and appends (no full reload)
- [ ] Empty state displays correctly
- [ ] Loading state shown during fetch
- [ ] TypeScript clean, build passes
