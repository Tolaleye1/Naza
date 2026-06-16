"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Shoutout } from "@/types/shoutout.types";
import ShoutoutCard from "@/components/shared/shoutout-card";
import ShoutoutModal from "@/components/shared/shoutout-modal";

export default function RecentShoutoutsSection() {
  const [shoutouts, setShoutouts] = useState<Shoutout[]>([]);
  const [activeShoutout, setActiveShoutout] = useState<Shoutout | null>(null);

  useEffect(() => {
    fetch("/api/shoutouts?page=1")
      .then((r) => r.json())
      .then((data: { shoutouts: Shoutout[] }) => {
        const sorted = (data.shoutouts || [])
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setShoutouts(sorted.slice(0, 3));
      })
      .catch(() => setShoutouts([]));
  }, []);

  if (shoutouts.length === 0) return null;

  return (
    <>
      <section id="recent-shoutouts">
        <div className="section-inner">
          <h2 className="section-title">
            Recent Shoutouts
          </h2>
        </div>
        <div className="recent-grid">
          {shoutouts.map((s) => (
            <ShoutoutCard
              key={s.id}
              shoutout={s}
              onClick={() => setActiveShoutout(s)}
            />
          ))}
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
      {activeShoutout && (
        <ShoutoutModal
          shoutout={activeShoutout}
          onClose={() => setActiveShoutout(null)}
        />
      )}
    </>
  );
}
