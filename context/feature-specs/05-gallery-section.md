# FR-05 — Gallery Section

## Goal
Build the "Our Gallery" section showing the couple's curated photos and videos
in a luxurious dark setting. Photos render in polaroid frames. Videos render in
rounded dark cards with a play button. Media is fetched from the Supabase Storage
`gallery` bucket. The boyfriend uploads files there before launch.

## Design Reference
- Section background: `var(--color-burgundy-mid)` — dark luxury
- Section heading: Playfair Display, cream-text, centered
- Photos: white polaroid frame, slight random rotation, shadow, optional caption
- Videos: dark rounded card `var(--color-burgundy-card)`, crimson play button circle
- Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop

## Implementation

### API Route: `app/api/gallery/route.ts`
Fetch from Supabase Storage `gallery` bucket, list all files.
Return a typed array of `{ name, url, type }` objects.
Determine `type` ('photo' | 'video') by file extension:
- Photo: `.jpg`, `.jpeg`, `.png`, `.webp`
- Video: `.mp4`, `.mov`, `.webm`
Use `supabaseAdmin.storage.from('gallery').list()` and generate public URLs.
Return max 50 items, sorted by name.

```typescript
interface GalleryItem {
  name: string;
  url: string;
  type: 'photo' | 'video';
  caption?: string; // derived from filename, strip extension and replace _ with space
}
```

### Shared Component: `components/shared/polaroid-frame.tsx`
Props: `src: string`, `alt: string`, `caption?: string`, `rotation?: number`
```typescript
// rotation: a value from -4 to +4 degrees, passed as prop
// Each polaroid in the grid gets a deterministic rotation based on its index:
// rotation = (index % 7 - 3) * 1.2
```
White background, thick white border (`border-[20px] border-white border-b-[52px]`),
caption text in Dancing Script below the image inside the white bottom border,
`box-shadow: 0 4px 20px rgba(0,0,0,0.4)`,
`transform: rotate(${rotation}deg)`,
`transition: transform 0.2s` — on hover, rotates back to 0deg and lifts.

### Shared Component: `components/shared/video-card.tsx`
Props: `src: string`, `name: string`
Dark card background (`var(--color-burgundy-card)`), rounded-xl, overflow-hidden.
Native `<video>` element: `controls`, `preload="metadata"`, `playsInline`, `poster` optional.
A large crimson play button circle overlaid in center — clicking removes the overlay
and starts the video. Caption below in Lato small, cream-muted.

### Section Component: `components/sections/gallery-section.tsx`
Server component — fetches from `/api/gallery` on server.

Tabs (shadcn Tabs): "Photos 📷" and "Videos 🎥"
- Photos tab: masonry-like grid using CSS columns or CSS grid with `auto-rows`
- Videos tab: standard grid

```
section.gallery (bg-burgundy-mid, py-24, px-4)
  └── h2 "Us, Through the Years" (font-display, text-xl, text-cream-text, text-center, mb-4)
  └── p.subtitle "Every moment, forever ours" (font-script, text-rose-light, text-center, mb-12)
  └── Tabs (photos | videos)
      └── TabsContent photos
          └── div.photos-grid (columns-1 sm:columns-2 lg:columns-3, gap-6)
              └── [PolaroidFrame for each photo]
      └── TabsContent videos
          └── div.videos-grid (grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3, gap-6)
              └── [VideoCard for each video]
```

Empty state (no items): centered message with a small heart and "Coming soon..."

### Add to `app/page.tsx`
Render `<GallerySection />` below `<LetterSection />`.

## Acceptance Criteria
- [ ] Section has dark background, distinct from parchment sections
- [ ] Photos tab shows polaroids with rotation effect
- [ ] Polaroids rotate back to 0 on hover
- [ ] Videos tab shows video cards with play button overlay
- [ ] Tabs switch between photos and videos smoothly
- [ ] Responsive grid works on mobile (single column)
- [ ] Empty state renders gracefully if bucket is empty
- [ ] API route returns correct typed data
- [ ] TypeScript clean, build passes
