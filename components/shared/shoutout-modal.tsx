"use client";

import Image from "next/image";
import type { Shoutout } from "@/types/shoutout.types";

interface ShoutoutModalProps {
  shoutout: Shoutout;
  onClose: () => void;
}

function formatFullDate(dateStr?: string): string {
  if (!dateStr) return "June 9, 2026";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const Ornament = () => (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <path
      d="M4 44 Q4 4 44 4"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M4 44 Q24 44 24 24"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

export default function ShoutoutModal({ shoutout, onClose }: ShoutoutModalProps) {
  const formattedDate = formatFullDate(shoutout.created_at);

  if (shoutout.message_type === "photo") {
    return (
      <div className="letter-modal-overlay" onClick={onClose} style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.85)" }}>
        <button className="letter-modal-close" onClick={onClose} aria-label="Close" style={{ zIndex: 10 }}>
          ✕
        </button>
        <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {shoutout.media_url ? (
            <Image
              src={shoutout.media_url}
              alt={`From ${shoutout.sender_name}`}
              width={1200}
              height={900}
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                borderRadius: "8px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
              }}
              unoptimized
            />
          ) : (
            <div style={{ color: "#fff" }}>No photo available</div>
          )}
        </div>
      </div>
    );
  }

  if (shoutout.message_type === "video") {
    return (
      <div className="letter-modal-overlay" onClick={onClose} style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.85)" }}>
        <button className="letter-modal-close" onClick={onClose} aria-label="Close" style={{ zIndex: 10 }}>
          ✕
        </button>
        <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {shoutout.media_url ? (
            <video
              src={shoutout.media_url}
              controls
              playsInline
              autoPlay
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                width: "auto",
                height: "auto",
                borderRadius: "8px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
              }}
            />
          ) : (
            <div style={{ color: "#fff" }}>No video available</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="letter-modal-overlay" onClick={onClose}>
      <button className="letter-modal-close" onClick={onClose} aria-label="Close">
        ✕
      </button>

      <div className="letter-card" onClick={(e) => e.stopPropagation()}>
        {/* Corner Ornaments */}
        <div className="letter-ornament letter-ornament-tl">
          <Ornament />
        </div>
        <div className="letter-ornament letter-ornament-bl">
          <Ornament />
        </div>

        {/* Top Section (Date + Stamp) */}
        <div className="letter-top">
          <div className="letter-date-block">
            <span className="letter-date">{formattedDate}</span>
            <div className="letter-date-line" />
          </div>

          <div className="letter-stamp">
            {shoutout.profile_picture_url ? (
              <Image
                src={shoutout.profile_picture_url}
                alt={shoutout.sender_name}
                width={80}
                height={80}
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="letter-stamp-placeholder">
                <span className="letter-stamp-heart">♥</span>
                <span className="letter-stamp-text">LOVE</span>
              </div>
            )}
          </div>
        </div>

        {/* Letter Body */}
        <div className="letter-body">
          {shoutout.text_content}
        </div>

        <hr className="letter-rule" />

        {/* Signature Block */}
        <div className="letter-signature">
          <span className="letter-signature-from">From:</span>
          <span className="letter-signature-name">{shoutout.sender_name}</span>
        </div>
      </div>
    </div>
  );
}
