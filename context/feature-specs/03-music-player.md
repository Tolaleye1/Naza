# FR-03 — Music Player

## Goal
Build a fixed bottom music player bar that plays the Lewis Capaldi song automatically.
The browser starts it muted (browsers block autoplay with sound). On the first user
interaction anywhere on the page, it unmutes and begins playing audibly.
The bar is visible on all sections as the user scrolls.

## Design Reference (from ui-context.md)
- Fixed bottom, full width, z-index 50
- Background: `var(--color-burgundy-card)` at 95% opacity + `backdrop-filter: blur(8px)`
- Height: 56px
- Left: spinning vinyl disc icon (CSS animation when playing, paused when not)
- Center: Song title + "Lewis Capaldi" in small text
- Right: play/pause button + muted/unmuted icon

## Implementation

### Audio File
The file lives at `public/audio/song.mp3`.
If this file doesn't exist at build time, the player should render but show
"Music loading..." and gracefully handle a missing src with an error event listener.

### Component: `components/shared/music-player.tsx`
Mark as `"use client"`.

#### Audio Ref Setup
```typescript
const audioRef = useRef<HTMLAudioElement>(null);
const [isPlaying, setIsPlaying] = useState(false);
const [isMuted, setIsMuted] = useState(true);
const [hasInteracted, setHasInteracted] = useState(false);
```

#### Autoplay Strategy
On mount, attempt to play muted:
```typescript
useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;
  audio.muted = true;
  audio.play().catch(() => {
    // Autoplay blocked — wait for interaction
    setIsPlaying(false);
  });
}, []);
```

On first interaction anywhere on the document:
```typescript
useEffect(() => {
  const handleFirstInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      const audio = audioRef.current;
      if (audio) {
        audio.muted = false;
        audio.play();
        setIsPlaying(true);
        setIsMuted(false);
      }
    }
  };
  document.addEventListener('click', handleFirstInteraction, { once: true });
  document.addEventListener('touchstart', handleFirstInteraction, { once: true });
  return () => {
    document.removeEventListener('click', handleFirstInteraction);
    document.removeEventListener('touchstart', handleFirstInteraction);
  };
}, [hasInteracted]);
```

#### Vinyl Disc Icon
An SVG or emoji-based spinning disc. Pure CSS spin:
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.vinyl-spinning { animation: spin 3s linear infinite; }
.vinyl-paused   { animation-play-state: paused; }
```

#### Play/Pause Button
Toggle `audio.play()` / `audio.pause()`, update `isPlaying` state.

#### Mute/Unmute Button (optional — secondary icon next to play)
Toggle `audio.muted`, update `isMuted` state.

#### Bar Layout
```
div.player-bar (fixed bottom-0, full width, flex, items-center, px-4, gap-3)
  ├── div.vinyl (spinning disc, 36x36)
  ├── div.track-info (flex col, flex-1)
  │     ├── span.title (Someone You Loved, font-display text-sm, cream-text)
  │     └── span.artist ("Lewis Capaldi", font-body text-xs, cream-muted)
  └── div.controls (flex gap-2)
        ├── button.play-pause (icon only, 36x36)
        └── span.muted-indicator (icon, text-xs)
```

#### Muted State Indicator
If muted (before first interaction): show a small animated wave "🔇 Tap to hear the music"
tooltip/label that fades after first interaction.

### Add to `app/layout.tsx`
Import `<MusicPlayer />` and render it inside `<body>`, outside of `{children}`,
so it persists across all routes.

## Acceptance Criteria
- [ ] Player bar visible at bottom of page, doesn't overlap content (add `pb-14` to main)
- [ ] Audio attempts autoplay muted on page load
- [ ] On first click/tap anywhere: audio unmutes and plays
- [ ] Play/pause button correctly toggles playback
- [ ] Vinyl disc spins when playing, pauses when audio is paused
- [ ] Song name and artist are displayed
- [ ] Player is readable on both mobile and desktop
- [ ] Gracefully handles missing `song.mp3` (no crash)
- [ ] TypeScript clean, build passes
