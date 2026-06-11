"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Shoutout } from "@/types/shoutout.types";
import Image from "next/image";

interface ShoutoutsResponse {
  shoutouts: Shoutout[];
  total: number;
  hasMore: boolean;
}

/* ── Modal for viewing a single shoutout ── */
function ShoutoutModal({
  shoutout,
  onClose,
}: {
  shoutout: Shoutout;
  onClose: () => void;
}) {
  const initial = shoutout.sender_name.charAt(0).toUpperCase();
  const isYouTube = !shoutout.media_url && !!shoutout.youtube_url;

  return (
    <div className="shoutout-modal-overlay" onClick={onClose}>
      <div
        className="shoutout-modal-card glass"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        {shoutout.profile_picture_url ? (
          <div className="modal-avatar">
            <Image
              src={shoutout.profile_picture_url}
              alt={shoutout.sender_name}
              width={72}
              height={72}
              className="modal-avatar-img"
            />
          </div>
        ) : (
          <div className="modal-avatar">{initial}</div>
        )}

        <h3 className="modal-sender">{shoutout.sender_name}</h3>
        {shoutout.created_at && (
          <p className="modal-timestamp">
            {new Date(shoutout.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}

        {shoutout.text_content && (
          <p className="modal-message">&ldquo;{shoutout.text_content}&rdquo;</p>
        )}

        {shoutout.media_url && shoutout.message_type === "photo" && (
          <Image
            src={shoutout.media_url}
            alt={`From ${shoutout.sender_name}`}
            width={480}
            height={360}
            className="modal-media-img"
          />
        )}

        {shoutout.media_url && shoutout.message_type === "video" && (
          <video
            src={shoutout.media_url}
            controls
            playsInline
            className="modal-media-video"
          />
        )}

        {isYouTube && shoutout.youtube_url && (
          <div className="modal-youtube-wrap">
            <iframe
              className="modal-youtube"
              src={shoutout.youtube_url.replace("watch?v=", "embed/")}
              title={`Video from ${shoutout.sender_name}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <div className="modal-flower">🌸</div>
      </div>
    </div>
  );
}

/* ── Shoutout card for normal grid view ── */
function ShoutoutGridCard({
  shoutout,
  onClick,
}: {
  shoutout: Shoutout;
  onClick: () => void;
}) {
  const initial = shoutout.sender_name.charAt(0).toUpperCase();

  return (
    <div className="glass" style={{ padding: "24px", cursor: "pointer" }} onClick={onClick}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
        {shoutout.profile_picture_url ? (
          <Image
            src={shoutout.profile_picture_url}
            alt={shoutout.sender_name}
            width={40}
            height={40}
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <div
            className="galaxy-node-initial"
            style={{ width: 40, height: 40, fontSize: "1rem" }}
          >
            {initial}
          </div>
        )}
        <div>
          <p style={{ fontFamily: "var(--ff-display)", color: "var(--text-light)", fontSize: "1.1rem", fontWeight: 400 }}>
            {shoutout.sender_name}
          </p>
          {shoutout.created_at && (
            <p style={{ fontFamily: "var(--ff-body)", color: "var(--text-muted)", fontSize: "0.75rem" }}>
              {new Date(shoutout.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}
            </p>
          )}
        </div>
      </div>

      {shoutout.text_content && (
        <p
          className="line-clamp-3"
          style={{
            fontFamily: "var(--ff-body)",
            color: "var(--text-light)",
            fontWeight: 300,
            fontStyle: "italic",
            lineHeight: 1.7,
            fontSize: "0.95rem",
          }}
        >
          &ldquo;{shoutout.text_content}&rdquo;
        </p>
      )}

      {shoutout.media_url && shoutout.message_type === "photo" && (
        <Image
          src={shoutout.media_url}
          alt={`From ${shoutout.sender_name}`}
          width={400}
          height={220}
          style={{ borderRadius: 12, width: "100%", height: "auto", marginTop: 8, objectFit: "cover" }}
        />
      )}
    </div>
  );
}

/* ── Galaxy View (interactive canvas-like with positioned nodes) ── */
function GalaxyView({
  shoutouts,
  onSelect,
}: {
  shoutouts: Shoutout[];
  onSelect: (s: Shoutout) => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple timeout to simulate "galaxy loading"
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  if (shoutouts.length === 0) {
    return (
      <div className="galaxy-canvas-wrap">
        <div className="galaxy-loading">
          <p>No shoutouts yet — be the first star ✨</p>
        </div>
      </div>
    );
  }

  return (
    <div className="galaxy-canvas-wrap">
      {loading && (
        <div className="galaxy-loading">
          <div className="galaxy-loading-spinner" />
          <p>Loading the galaxy...</p>
        </div>
      )}
      <div
        className="galaxy-mount"
        ref={mountRef}
        style={{
          display: loading ? "none" : "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
          padding: "24px",
          overflowY: "auto",
        }}
      >
        {shoutouts.map((s, i) => {
          const initial = s.sender_name.charAt(0).toUpperCase();
          const typeIcon =
            s.message_type === "photo" ? "📷" : s.message_type === "video" ? "🎥" : "✍️";

          return (
            <div
              key={s.id || i}
              className="galaxy-node"
              data-type={s.message_type}
              onClick={() => onSelect(s)}
              style={{
                animationDelay: `${i * 0.05}s`,
              }}
            >
              {s.profile_picture_url ? (
                <div className="galaxy-node-initial">
                  <Image
                    src={s.profile_picture_url}
                    alt={s.sender_name}
                    width={52}
                    height={52}
                    className="galaxy-node-pfp"
                  />
                </div>
              ) : (
                <div className="galaxy-node-initial">{initial}</div>
              )}
              <span className="galaxy-node-name">{s.sender_name}</span>
              <span className="galaxy-node-icon">{typeIcon}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function GalaxyShoutoutsSection() {
  const [view, setView] = useState<"galaxy" | "normal">("galaxy");
  const [shoutouts, setShoutouts] = useState<Shoutout[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Shoutout | null>(null);

  const fetchShoutouts = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shoutouts?page=${pageNum}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: ShoutoutsResponse = await res.json();
      setShoutouts((prev) =>
        pageNum === 1 ? data.shoutouts : [...prev, ...data.shoutouts]
      );
      setHasMore(data.hasMore);
    } catch {
      // Silent fail — empty state shows
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShoutouts(1);
  }, [fetchShoutouts]);

  function handleLoadMore() {
    const next = page + 1;
    setPage(next);
    fetchShoutouts(next);
  }

  return (
    <>
      <section id="galaxy-shoutouts">
        <div className="section-inner">
          <p className="section-eyebrow">in the stars</p>
          <h2 className="section-title">
            Shoutouts
            <br />
            <em>for Naza</em>
          </h2>
          <p className="galaxy-hint">
            Shoutouts will appear here as stars in the galaxy
          </p>
        </div>

        <div className="view-toggle-wrap">
          <button
            className={`view-toggle-btn ${view === "galaxy" ? "active" : ""}`}
            onClick={() => setView("galaxy")}
          >
            Galaxy View
          </button>
          <button
            className={`view-toggle-btn ${view === "normal" ? "active" : ""}`}
            onClick={() => setView("normal")}
          >
            Normal View
          </button>
        </div>

        {view === "galaxy" ? (
          <GalaxyView shoutouts={shoutouts} onSelect={setSelected} />
        ) : (
          <div className="shoutouts-normal-wrap">
            {loading && shoutouts.length === 0 ? (
              <div className="shoutouts-grid-skeleton">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton-card glass" />
                ))}
              </div>
            ) : shoutouts.length === 0 ? (
              <div className="shoutouts-grid-empty">
                <div className="shoutouts-grid-empty-icon">💌</div>
                <p>No shoutouts yet — be the first!</p>
              </div>
            ) : (
              <>
                <div className="shoutouts-grid-cards">
                  {shoutouts.map((s, i) => (
                    <ShoutoutGridCard
                      key={s.id || i}
                      shoutout={s}
                      onClick={() => setSelected(s)}
                    />
                  ))}
                </div>
                {hasMore && (
                  <div className="shoutouts-grid-loadmore">
                    <button
                      className="shoutouts-grid-loadmore-btn"
                      onClick={handleLoadMore}
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Load more"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>

      {selected && (
        <ShoutoutModal shoutout={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
