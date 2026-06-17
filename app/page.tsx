import RecentShoutoutsSection from "@/components/sections/recent-shoutouts-section";
import MainSiteInit from "@/components/shared/main-site-init";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import HomepageGalleryGrid from "@/components/sections/homepage-gallery-grid";

interface HomepagePhoto {
  slot: number;
  url: string;
  caption?: string | null;
}

/* ── Force dynamic rendering so Supabase queries run at request time ── */
export const dynamic = "force-dynamic";

/* ── Query Supabase directly instead of self-referencing fetch ── */
async function getGalleryPhotos(): Promise<HomepagePhoto[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("gallery_items")
      .select("*")
      .eq("pin_type", "captured_in_time")
      .order("created_at", { ascending: false })
      .limit(4);

    if (error) {
      console.error("Homepage gallery fetch error:", error.message);
      return [];
    }

    return (data || []).map((item, index) => ({
      slot: index + 1,
      url: item.url,
      caption: item.caption,
    }));
  } catch (err) {
    console.error("Unexpected error fetching homepage gallery:", err);
    return [];
  }
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

function GallerySection({ photos }: { photos: HomepagePhoto[] }) {
  return (
    <section id="memories">
      <div className="section-inner">
        <h2 className="section-title" style={{ fontFamily: "var(--ff-script)" }}>
          Captured in Time
        </h2>
        <HomepageGalleryGrid photos={photos} />
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
        </div>
      </section>
      <footer>
        <p>Made with love, just for Naza</p>
      </footer>
    </>
  );
}

export default async function Home() {
  const photos = await getGalleryPhotos();

  return (
    <main id="main-site">
      <HeroSection />
      <MessageSection />
      <ReasonsSection />
      <GallerySection photos={photos} />
      <RecentShoutoutsSection />
      <FinaleSection />
      <MainSiteInit />
    </main>
  );
}
