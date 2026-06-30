"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import type { GalleryItem } from "@/types/gallery.types";

interface GalleryTabsProps {
  photos: GalleryItem[];
  videos: GalleryItem[];
}

/* ─── Lightbox ─────────────────────────────────────────── */

function Lightbox({
  photos,
  startIndex,
  onClose,
}: {
  photos: GalleryItem[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const goPrev = useCallback(
    () => setIndex((i) => (i > 0 ? i - 1 : photos.length - 1)),
    [photos.length],
  );
  const goNext = useCallback(
    () => setIndex((i) => (i < photos.length - 1 ? i + 1 : 0)),
    [photos.length],
  );

  /* keyboard navigation */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, goPrev, goNext]);

  /* lock body scroll while open */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* touch / swipe handlers */
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }
  function handleTouchEnd() {
    const SWIPE_THRESHOLD = 50;
    if (touchDeltaX.current > SWIPE_THRESHOLD) goPrev();
    else if (touchDeltaX.current < -SWIPE_THRESHOLD) goNext();
    touchStartX.current = null;
    touchDeltaX.current = 0;
  }

  const photo = photos[index];

  return (
    <div
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "zoom-out",
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close lightbox"
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 10,
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "50%",
          width: 44,
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#fff",
          fontSize: "1.3rem",
          backdropFilter: "blur(8px)",
          transition: "background 0.2s",
        }}
      >
        ✕
      </button>

      {/* Counter */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "var(--ff-body)",
          fontSize: "0.85rem",
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "0.05em",
        }}
      >
        {index + 1} / {photos.length}
      </div>

      {/* Prev arrow */}
      {photos.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          aria-label="Previous photo"
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "50%",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#fff",
            fontSize: "1.4rem",
            backdropFilter: "blur(8px)",
            transition: "background 0.2s",
          }}
        >
          ‹
        </button>
      )}

      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={photo.id}
        src={photo.url}
        alt={photo.caption ?? "Gallery photo"}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw",
          maxHeight: "85vh",
          objectFit: "contain",
          borderRadius: "12px",
          cursor: "default",
          userSelect: "none",
          animation: "lightboxFadeIn 0.2s ease",
        }}
      />

      {/* Next arrow */}
      {photos.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          aria-label="Next photo"
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "50%",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#fff",
            fontSize: "1.4rem",
            backdropFilter: "blur(8px)",
            transition: "background 0.2s",
          }}
        >
          ›
        </button>
      )}

      {/* Inject keyframe animation */}
      <style>{`
        @keyframes lightboxFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ─── Photo Grid ───────────────────────────────────────── */

function PhotoGrid({
  photos,
  onPhotoClick,
}: {
  photos: GalleryItem[];
  onPhotoClick: (index: number) => void;
}) {
  if (photos.length === 0) {
    return (
      <p
        style={{
          fontFamily: "var(--ff-body)",
          color: "var(--text-muted)",
          textAlign: "center",
          padding: "40px 0",
          fontSize: "0.95rem",
        }}
      >
        No photos yet
      </p>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "16px",
      }}
    >
      {photos.map((photo, i) => (
        <div
          key={photo.id ?? i}
          onClick={() => onPhotoClick(i)}
          style={{
            borderRadius: "16px",
            overflow: "hidden",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,150,180,0.15)",
            aspectRatio: "1 / 1",
            position: "relative",
            cursor: "zoom-in",
            transition: "transform 0.2s, border-color 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = "scale(1.03)";
            (e.currentTarget as HTMLDivElement).style.borderColor =
              "rgba(255,150,180,0.35)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
            (e.currentTarget as HTMLDivElement).style.borderColor =
              "rgba(255,150,180,0.15)";
          }}
        >
          <Image
            src={photo.url}
            alt={photo.caption ?? "Gallery photo"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            style={{ objectFit: "cover" }}
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}

/* ─── Video Grid ───────────────────────────────────────── */

function VideoGrid({ videos }: { videos: GalleryItem[] }) {
  if (videos.length === 0) {
    return (
      <p
        style={{
          fontFamily: "var(--ff-body)",
          color: "var(--text-muted)",
          textAlign: "center",
          padding: "40px 0",
          fontSize: "0.95rem",
        }}
      >
        No videos yet
      </p>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "16px",
      }}
    >
      {videos.map((video, i) => (
        <VideoItem key={video.id ?? i} video={video} />
      ))}
    </div>
  );
}

/* ─── Video Item ───────────────────────────────────────── */

function VideoItem({ video }: { video: GalleryItem }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,150,180,0.15)",
        position: "relative",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "16 / 9" }}>
        <video
          src={video.url}
          controls={playing}
          playsInline
          preload="none"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          onPlay={() => {
            setPlaying(true);
            window.dispatchEvent(new CustomEvent("naza:video:play"));
          }}
          onPause={() => {
            setPlaying(false);
            window.dispatchEvent(new CustomEvent("naza:video:stop"));
          }}
          onEnded={() => {
            setPlaying(false);
            window.dispatchEvent(new CustomEvent("naza:video:stop"));
          }}
        />
        {!playing && (
          <button
            onClick={() => setPlaying(true)}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.3)",
              border: "none",
              cursor: "pointer",
            }}
            aria-label="Play video"
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(232,105,138,0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Main Tabs Component ──────────────────────────────── */

export default function GalleryTabs({ photos, videos }: GalleryTabsProps) {
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visiblePhotosCount, setVisiblePhotosCount] = useState(20);

  const displayedPhotos = photos.slice(0, visiblePhotosCount);

  return (
    <>
      {/* Tab Toggle */}
      <div className="view-toggle-wrap" style={{ marginBottom: 32 }}>
        <button
          className={`view-toggle-btn ${activeTab === "photos" ? "active" : ""}`}
          onClick={() => setActiveTab("photos")}
        >
          📷 Photos {photos.length > 0 && `(${photos.length})`}
        </button>
        <button
          className={`view-toggle-btn ${activeTab === "videos" ? "active" : ""}`}
          onClick={() => setActiveTab("videos")}
        >
          🎥 Videos {videos.length > 0 && `(${videos.length})`}
        </button>
      </div>

      {activeTab === "photos" ? (
        <>
          <PhotoGrid
            photos={displayedPhotos}
            onPhotoClick={(i) => setLightboxIndex(i)}
          />
          {visiblePhotosCount < photos.length && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
              <button
                onClick={() => setVisiblePhotosCount((prev) => prev + 8)}
                style={{
                  fontFamily: "var(--ff-body)",
                  color: "var(--rose-light)",
                  border: "1px solid var(--rose)",
                  borderRadius: "999px",
                  padding: "10px 32px",
                  fontSize: "0.85rem",
                  letterSpacing: "0.05em",
                  cursor: "pointer",
                  background: "transparent",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(232, 105, 138, 0.15)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--rose-light)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--rose)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
              >
                Load More
              </button>
            </div>
          )}
        </>
      ) : (
        <VideoGrid videos={videos} />
      )}

      {/* Lightbox overlay */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={displayedPhotos}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
