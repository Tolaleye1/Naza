"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { Shoutout } from "@/types/shoutout.types";
import type { GalleryItem } from "@/types/gallery.types";
import GalaxyShoutoutsSection from "@/components/sections/galaxy-shoutouts-section";

/* ── Declare global initMainSite ── */
declare global {
  interface Window {
    initMainSite?: () => void;
  }
}

/* ── Helper: format date ── */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/* ════════════════════════════════════════════════════════
   HERO SECTION
   ════════════════════════════════════════════════════════ */
function HeroSection() {
  return (
    <section id="hero">
      <div className="hero-content">
        <p className="hero-eyebrow">a love letter for Naza</p>
        <h1 className="hero-title">
          <span className="line1">For You,</span>
          <span className="line2 italic">My Naza</span>
        </h1>
        <p className="hero-sub">
          Every moment with you is a petal pressed against my heart.
        </p>
        <div className="hero-flowers">
          <svg
            className="hero-flower"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g className="flower-group">
              <ellipse cx="50" cy="30" rx="12" ry="22" fill="rgba(255,182,193,0.85)" className="petal p1" />
              <ellipse cx="50" cy="30" rx="12" ry="22" fill="rgba(255,182,193,0.85)" className="petal p2" transform="rotate(60,50,50)" />
              <ellipse cx="50" cy="30" rx="12" ry="22" fill="rgba(255,182,193,0.85)" className="petal p3" transform="rotate(120,50,50)" />
              <ellipse cx="50" cy="30" rx="12" ry="22" fill="rgba(255,192,203,0.85)" className="petal p4" transform="rotate(180,50,50)" />
              <ellipse cx="50" cy="30" rx="12" ry="22" fill="rgba(255,192,203,0.85)" className="petal p5" transform="rotate(240,50,50)" />
              <ellipse cx="50" cy="30" rx="12" ry="22" fill="rgba(255,192,203,0.85)" className="petal p6" transform="rotate(300,50,50)" />
              <circle cx="50" cy="50" r="10" fill="rgba(255,220,180,0.95)" />
            </g>
          </svg>
        </div>
        <a href="#message" className="scroll-btn">
          <span>Scroll to discover</span>
          <div className="scroll-arrow">↓</div>
        </a>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════
   MESSAGE SECTION
   ════════════════════════════════════════════════════════ */
function MessageSection() {
  return (
    <section id="message">
      <div className="section-inner">
        <div className="message-card glass">
          <div className="card-flowers-top">
            <span className="inline-flower">🌸</span>
            <span className="inline-flower delay1">🌺</span>
            <span className="inline-flower delay2">🌸</span>
          </div>
          <p className="msg-label">from my heart</p>
          <h2 className="msg-title">
            You are my
            <br />
            <em>wildest dream</em>
            <br />
            come true.
          </h2>
          {/* BOYFRIEND: Replace paragraphs below with your love letter */}
          <p className="msg-body">
            In a world full of ordinary moments, you are the extraordinary one.
            The way you laugh, the way you care, the way you simply exist — it
            fills every corner of my world with something I never knew I needed.
          </p>
          <p className="msg-body">
            These flowers are not enough. No words ever could be. But they carry
            every unspoken feeling I hold for you, pressed between their petals
            like tiny love letters waiting to be found.
          </p>
          <div className="msg-signature">— Always yours 🌹</div>
        </div>
      </div>
      <div className="section-petals">
        <div className="s-petal sp1">🌸</div>
        <div className="s-petal sp2">🌺</div>
        <div className="s-petal sp3">🌼</div>
        <div className="s-petal sp4">🌸</div>
        <div className="s-petal sp5">🌷</div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════
   REASONS SECTION
   ════════════════════════════════════════════════════════ */
const REASONS = [
  { icon: "🌹", title: "Your Smile", text: "It lights up every room and every corner of my heart." },
  { icon: "💫", title: "Your Soul", text: "Rare, genuine, and more beautiful than anything I've ever known.", delay: "delay1" },
  { icon: "🌸", title: "Your Kindness", text: "The way you love the world makes me want to be better every single day.", delay: "delay2" },
  { icon: "✨", title: "Your Laughter", text: "The best sound in the universe. My favourite melody, always.", delay: "delay3" },
  { icon: "🌺", title: "Your Strength", text: "You carry so much grace through everything. I admire you endlessly.", delay: "delay4" },
  { icon: "💖", title: "Simply You", text: "Every version of you, every moment — you are more than enough.", delay: "delay5" },
];

function ReasonsSection() {
  return (
    <section id="reasons">
      <div className="section-inner">
        <p className="section-eyebrow">a thousand reasons why</p>
        <h2 className="section-title">Why I Love You</h2>
        <div className="reasons-grid">
          {REASONS.map((r, i) => (
            <div key={i} className={`reason-card glass reveal-card ${r.delay || ""}`}>
              <div className="reason-icon">{r.icon}</div>
              <h3>{r.title}</h3>
              <p>{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════
   GALLERY SECTION (memories)
   ════════════════════════════════════════════════════════ */
const GALLERY_CAPTIONS = ["forever", "my love", "together", "always"];

function GallerySection() {
  const [photos, setPhotos] = useState<GalleryItem[]>([]);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data: GalleryItem[]) => setPhotos(data))
      .catch(() => setPhotos([]));
  }, []);

  return (
    <section id="memories">
      <div className="section-inner">
        <p className="section-eyebrow">captured in time</p>
        <h2 className="section-title">
          Naza, Beautiful<br />
          <em>Always</em>
        </h2>
        <div className="gallery-grid">
          {[0, 1, 2, 3].map((idx) => {
            const photo = photos[idx];
            const gcClass = `gc${idx + 1}`;
            return (
              <div key={idx} className={`gallery-card glass ${gcClass}`}>
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="gallery-img"
                    src={photo.url}
                    alt={photo.caption || `Memory ${idx + 1}`}
                  />
                ) : (
                  <div className="gallery-placeholder">
                    <div className="gp-icon">🌸</div>
                    <p>Coming soon...</p>
                  </div>
                )}
                <div className="gallery-caption">
                  {photo?.caption || GALLERY_CAPTIONS[idx]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════
   RECENT SHOUTOUTS SECTION
   ════════════════════════════════════════════════════════ */
function RecentShoutoutsSection() {
  const [shoutouts, setShoutouts] = useState<Shoutout[]>([]);

  useEffect(() => {
    fetch("/api/shoutouts?page=1")
      .then((r) => r.json())
      .then((data: { shoutouts: Shoutout[] }) =>
        setShoutouts(data.shoutouts?.slice(0, 3) || [])
      )
      .catch(() => setShoutouts([]));
  }, []);

  if (shoutouts.length === 0) return null;

  return (
    <section id="recent-shoutouts">
      <div className="section-inner">
        <h2 className="section-title">
          Recent Shoutouts
        </h2>
      </div>
      <div className="recent-grid">
        {shoutouts.map((s, i) => {
          const initial = s.sender_name.charAt(0).toUpperCase();
          return (
            <div key={s.id || i} className="glass" style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div className="galaxy-node-initial" style={{ width: 40, height: 40, fontSize: "1rem" }}>
                  {initial}
                </div>
                <div>
                  <p style={{ fontFamily: "var(--ff-display)", color: "var(--text-light)", fontSize: "1.1rem", fontWeight: 400 }}>
                    {s.sender_name}
                  </p>
                  {s.created_at && (
                    <p style={{ fontFamily: "var(--ff-body)", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                      {formatDate(s.created_at)}
                    </p>
                  )}
                </div>
              </div>
              {s.text_content && (
                <p className="line-clamp-3" style={{
                  fontFamily: "var(--ff-body)",
                  color: "var(--text-light)",
                  fontWeight: 300,
                  fontStyle: "italic",
                  lineHeight: 1.7,
                  fontSize: "0.95rem",
                }}>
                  &ldquo;{s.text_content}&rdquo;
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="recent-cta" style={{ marginTop: "40px" }}>
        <Link
          href="/shoutouts"
          style={{
            display: "inline-block",
            fontFamily: "var(--ff-body)",
            color: "var(--rose-light)",
            border: "1px solid var(--rose)",
            borderRadius: "999px",
            padding: "10px 24px",
            fontSize: "0.85rem",
            textDecoration: "none",
            letterSpacing: "0.05em",
            transition: "all 0.3s",
            background: "transparent",
          }}
        >
          View All Shoutouts 💌
        </Link>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════
   FINALE SECTION + FOOTER
   ════════════════════════════════════════════════════════ */
function FinaleSection() {
  return (
    <>
      <section id="finale">
        <div className="finale-inner">
          <div className="finale-flowers">
            <span className="ff">🌸</span>
            <span className="ff delay1">🌺</span>
            <span className="ff delay2">🌹</span>
            <span className="ff delay3">🌸</span>
            <span className="ff delay4">🌷</span>
          </div>
          <p className="finale-eyebrow">always &amp; forever</p>
          <h2 className="finale-title">
            You Are Loved
            <br />
            <em>Beyond Words</em>
          </h2>
          <p className="finale-body">
            No matter where life takes us, know that somewhere in the universe,
            there is a garden blooming with every feeling I hold for you. You
            deserve the world. You deserve all the flowers. You deserve
            everything.
          </p>
          <div className="finale-heart">
            <div className="heart-pulse">💗</div>
          </div>
          <p className="finale-sig">Made with love, just for Naza 🌸</p>
        </div>
      </section>
      <footer>
        <p>🌸 crafted with love &amp; petals, just for Naza 🌸</p>
      </footer>
    </>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Trigger main-site initialization
    if (typeof window !== "undefined") {
      if (window.initMainSite) {
        window.initMainSite();
      } else {
        // Fallback: manually reveal cards if initMainSite hasn't loaded yet
        const cards = document.querySelectorAll(".reveal-card");
        cards.forEach((c) => c.classList.add("visible"));
      }
    }
  }, []);

  if (!mounted) return null;

  return (
    <main id="main-site">
      <HeroSection />
      <MessageSection />
      <ReasonsSection />
      <GallerySection />
      <RecentShoutoutsSection />
      <FinaleSection />
    </main>
  );
}
