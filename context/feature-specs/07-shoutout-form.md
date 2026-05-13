# FR-07 — Shoutout Upload Form

## Goal
Build the public-facing shoutout submission form. Anyone can submit their name,
choose a message type (text / photo / video), and upload their content.
After submission, a success animation plays. Shoutouts go into the DB and appear
in the public feed immediately.

## API Route: `app/api/shoutouts/route.ts` (POST)
```typescript
// POST /api/shoutouts
// Body: FormData (supports file uploads)
// Fields: sender_name, message_type, text_content?, media_file?, youtube_url?
// Steps:
//   1. Validate fields (name required, content required based on type)
//   2. If media_file: upload to Supabase Storage 'shoutouts-media' bucket
//   3. Insert shoutout record into DB (no status field — all shoutouts go live immediately)
//   4. Return { success: true, message: "Shoutout submitted!" }
```

Validation rules:
- `sender_name`: required, max 60 chars, sanitize (strip HTML)
- `text_content`: required if type='text', max 500 chars, sanitize
- `media_file`: required if type='photo' or type='video'
  - Photo: max 5MB, accept image/jpeg, image/png, image/webp only
  - Video: max 50MB, accept video/mp4, video/quicktime, video/webm only
- `youtube_url`: optional for video type (alternative to file upload)

## Component: `components/sections/shoutout-form-section.tsx`
Mark `"use client"`.

### Form State
```typescript
const [messageType, setMessageType] = useState<MessageType>('text');
const [senderName, setSenderName] = useState('');
const [textContent, setTextContent] = useState('');
const [mediaFile, setMediaFile] = useState<File | null>(null);
const [youtubeUrl, setYoutubeUrl] = useState('');
const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
const [errorMsg, setErrorMsg] = useState('');
```

### Message Type Selector
Three pill/tab buttons: "✍️ Text", "📷 Photo", "🎥 Video"
Active: crimson fill, cream text. Inactive: parchment-dark, ink text.
Switching type clears previous content fields.

### Form Fields
- Sender name: underline-style input (not boxed), label "Your Name"
- Text: textarea, 500 char counter bottom-right (remaining chars, turns red under 50)
- Photo: styled file input — hide native input, show a dashed crimson upload zone
  with "Click to upload photo" and file size limit note
- Video: two options — file upload zone 

### Submit Button
Crimson background, cream text, rounded, "Send Your Love 💌"
Loading state: spinning seal icon + "Sending..."

### Success State
Replace form with:
- Large animated envelope: flies in from bottom, a small stamp icon animates onto it
- Text: "Your shoutout has been sent! 💌" (Playfair Display)
- Floating hearts burst (reuse heart animation from Hero)
- "Send another shoutout?" link to reset the form

### Error State
Show error message below submit button in `var(--color-error)`.

### Form Card Layout
```
section (bg-parchment, py-24, px-4)
  └── h2 "Leave a Shoutout" (font-display, crimson, text-center)
  └── p "Write her a message she'll never forget" (font-script, ink)
  └── div.form-card (bg-white, rounded-xl, shadow-lg, max-w-lg, mx-auto, p-8, mt-12)
      └── [type selector pills]
      └── [name field]
      └── [content fields — conditional on type]
      └── [submit button]
```

## Add to `app/page.tsx`
Render `<ShoutoutFormSection />` below `<ShoutoutsSection />`.

## Acceptance Criteria
- [ ] All three message types selectable and switch correctly
- [ ] Character counter works and changes color near limit
- [ ] File upload validates size and type client-side
- [ ] Form submits via API route (FormData)
- [ ] Success state shows animated envelope + floating hearts
- [ ] Error state shows message
- [ ] Insert shoutout record into DB and make it publicly visible immediately
- [ ] TypeScript clean, build passes
