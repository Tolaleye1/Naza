"use client";

import { useState } from "react";
import Link from "next/link";

interface HomepagePhoto {
  slot: number;
  url: string;
  caption?: string | null;
}

export default function HomepageGalleryGrid({ photos }: { photos: HomepagePhoto[] }) {
  const [activePhoto, setActivePhoto] = useState<HomepagePhoto | null>(null);

  return (
    <>
      <div className="gallery-grid">
        {[1, 2, 3, 4].map((slotNum) => {
          const photo = photos.find((p) => p.slot === slotNum);
          const gcClass = `gc${slotNum}`;
          return (
            <div
              key={slotNum}
              className={`gallery-card glass ${gcClass}`}
              onClick={() => {
                if (photo) setActivePhoto(photo);
              }}
            >
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="gallery-img"
                  src={photo.url}
                  alt={photo.caption || `Memory ${slotNum}`}
                />
              ) : (
                <div className="gallery-placeholder">
                  <div className="gp-icon">🌸</div>
                  <p>Coming soon...</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
        <Link
          href="/gallery"
          style={{
            display: "inline-block",
            fontFamily: "var(--ff-body)",
            color: "var(--rose-light)",
            border: "1px solid var(--rose)",
            borderRadius: "999px",
            padding: "10px 32px",
            fontSize: "0.85rem",
            textDecoration: "none",
            letterSpacing: "0.05em",
            transition: "all 0.3s",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(232, 105, 138, 0.15)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--rose-light)";
            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--rose)";
            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
          }}
        >
          See More
        </Link>
      </div>

      {/* Lightbox overlay */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
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
            onClick={() => setActivePhoto(null)}
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

          {/* Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activePhoto.url}
            alt={activePhoto.caption || "Gallery photo"}
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

          {/* Inject keyframe animation */}
          <style>{`
            @keyframes lightboxFadeIn {
              from { opacity: 0; transform: scale(0.95); }
              to   { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
