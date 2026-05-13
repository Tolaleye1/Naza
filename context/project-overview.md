# Project Overview — Naza's Birthday Website

## Overview

A romantic, luxury-vintage birthday website built by [BOYFRIEND_NAME] for his girlfriend
Naza's birthday on [BIRTHDAY_DATE]. The site functions like a digital love letter
— visitors arrive to music playing, scroll through a romantic narrative, leave shoutouts,
and view a curated gallery of the couple's moments. The aesthetic is vintage love letter meets
luxury boutique: cream parchment, deep red, postage stamps, cursive script, polaroid photos.

## Goals

1. Make Naza feel celebrated — the site should feel personal, warm, and cinematic
2. Let friends and family leave shoutouts (text, photo, or video) that all appear in one feed
3. Show the couple's story through a curated photo and video gallery
4. Provide a way for people to send a gift to the celebrant
5. Create a stunning first impression with autoplay music and an animated hero

## Core User Flow

1. Visitor lands on the site — Lewis Capaldi song begins playing (unmuted on first click)
2. Hero section: Naza's name animated in, birthday message, floating hearts
3. Scroll to "A Letter To You" — the boyfriend's personal love letter on a parchment card
4. Scroll to "Our Gallery" — couple's photos and videos in polaroid frames
5. Scroll to "Shoutouts" — scrollable feed of all approved shoutouts (text, photo, video)
6. Scroll to "Leave a Shoutout" — upload form: name, message type, content
7. Scroll to "Gift Naza" — gift card with payment/wishlist link
8. Footer — date, names, small heart motif

## Features

### Hero Section
- Full viewport, dark deep-red/burgundy background with subtle dark rose texture
- Naza's name in large cursive script, animated letter-by-letter
- Subtitle: "Happy Birthday, my love" or similar
- Floating animated hearts (CSS)
- Scroll indicator arrow
- Music player bar fixed at bottom (shows song name, play/pause, muted state)

### A Letter To You
- Cream parchment card centered on screen
- Scalloped/perforated stamp border (SVG)
- Postage stamp decorations (top right of card)
- Postmark circle decoration
- "To: Naza" and "From: [BOYFRIEND_NAME]" header lines
- Love letter body text (boyfriend fills in before launch)
- Date field at bottom
- Subtle paper crinkle texture

### Our Gallery
- Section heading in cursive: "Us, Through the Years" or similar
- Two sub-tabs or scroll-separated blocks: "Photos" and "Videos"
- Photos render as polaroid frames (white border, slight rotation, shadow)
- Videos play inline on click, displayed in rounded card
- Images/videos uploaded by the boyfriend to Supabase Storage before launch
- No public upload here — this is curated content only

### Shoutouts Feed
- Masonry or card grid of all APPROVED shoutouts
- Each card shows: sender name, message/photo/video, timestamp
- Text shoutouts: parchment card with small heart stamp icon
- Photo shoutouts: photo displayed with sender name overlay
- Video shoutouts: video player card with sender name
- Empty state: "Be the first to leave a shoutout!" with animated envelope
- Loads latest 20, with "Load more" button

### Leave a Shoutout
- Public-facing upload form (no login required)
- Fields: Your Name, Message Type (text / photo / video), content
- Text: textarea with character limit (500 chars)
- Photo: image upload (max 5MB, JPG/PNG/WebP)
- Video: video upload (max 50MB, MP4/MOV) OR a YouTube link
- Submit button with loading state
- Success state: animated stamp being "posted"
- Admin approval required before appearing in feed (not instant)

### Gift Naza
- Elegant gift card with ribbon illustration
- Heading: "Send Naza Some Love"
- [GIFT_DETAILS] — bank account / payment link / wishlist URL
- Copy-to-clipboard for account details if applicable
- Optional: small note about what she's wishing for

### Music Player
- Fixed bottom bar across all pages
- Song: Lewis Capaldi — Someone You Loved
- Autoplay on load (browser-muted by default, unmuted on first user interaction)
- Shows vinyl/disc animation when playing
- Play/pause toggle
- Song title and artist shown

## Admin Panel (Simple)
- Route: `/admin` protected by a simple env-var password (no auth system needed)
- Lists all pending shoutouts
- Approve or reject each one
- View approved shoutouts
- No user accounts, no Clerk, just a password check

## Scope

### In Scope
- Single-page scrollable website with all sections above
- Shoutout submission and approval workflow
- Supabase storage for gallery media and shoutout media
- Background music autoplay
- Mobile-first responsive design
- Deployment to Vercel

### Out of Scope
- Multi-language support
- Comments or replies on shoutouts
- Email notifications
- Analytics dashboard
- Social media sharing integration

## Success Criteria

1. Site loads in under 3 seconds on mobile
2. Music plays automatically (unmuted on first interaction)
3. A visitor can submit a shoutout in under 60 seconds
4. Admin can approve or reject shoutouts from `/admin`
5. All gallery images display in polaroid frame style
6. The site looks beautiful on both mobile and desktop
