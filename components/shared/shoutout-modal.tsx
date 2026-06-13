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
  const isYouTube = !shoutout.media_url && !!shoutout.youtube_url;
  const formattedDate = formatFullDate(shoutout.created_at);

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

        {/* Media Attachments */}
        {shoutout.media_url && shoutout.message_type === "photo" && (
          <Image
            src={shoutout.media_url}
            alt={`From ${shoutout.sender_name}`}
            width={600}
            height={450}
            className="letter-media-img"
            style={{ width: "100%", height: "auto" }}
          />
        )}

        {shoutout.media_url && shoutout.message_type === "video" && (
          <video
            src={shoutout.media_url}
            controls
            playsInline
            className="letter-media-video"
          />
        )}

        {isYouTube && shoutout.youtube_url && (
          <div className="letter-youtube-wrap">
            <iframe
              src={shoutout.youtube_url.replace("watch?v=", "embed/")}
              title={`Video from ${shoutout.sender_name}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

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
