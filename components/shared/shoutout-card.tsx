"use client";

import Image from "next/image";
import type { KeyboardEvent } from "react";
import type { Shoutout } from "@/types/shoutout.types";
import { getYouTubeEmbedSrc } from "@/lib/youtube";

interface ShoutoutCardProps {
  shoutout: Shoutout;
  onClick?: () => void;
  onToggle?: () => void;
}

function handleKeyboardActivation(event: KeyboardEvent<HTMLDivElement>, onClick?: () => void) {
  if (!onClick) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onClick();
  }
}

/** Format a timestamp into a readable relative or short date string */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ─── Text Shoutout Card (Envelope Style) ─── */
function TextCard({ shoutout, onClick }: ShoutoutCardProps) {
  const previewText = shoutout.text_content || "";
  return (
    <div
      className="envelope-card"
      onClick={onClick}
      onKeyDown={(event) => handleKeyboardActivation(event, onClick)}
      role="button"
      tabIndex={0}
      aria-label={`Open shoutout from ${shoutout.sender_name}`}
    >
      <div className="envelope-flap">
        <span className="flap-heart">♥</span>
      </div>
      <div className="envelope-inner">
        <div className="envelope-body">
          <div className="envelope-sender">From: {shoutout.sender_name}</div>
          <hr className="envelope-divider" />
          <div className="envelope-preview">{previewText}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Photo Shoutout Card (White card, full image layout) ─── */
function PhotoCard({ shoutout, onClick }: ShoutoutCardProps) {
  return (
    <div
      className="envelope-card"
      onClick={onClick}
      onKeyDown={(event) => handleKeyboardActivation(event, onClick)}
      role="button"
      tabIndex={0}
      aria-label={`Open photo shoutout from ${shoutout.sender_name}`}
    >
      <div className="envelope-inner overflow-hidden">
        <div className="relative aspect-[4/3] w-full h-full">
          {shoutout.media_url ? (
            <Image
              src={shoutout.media_url}
              alt={`Shoutout from ${shoutout.sender_name}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full min-h-[220px] w-full items-center justify-center bg-black/30 text-sm text-[rgba(200,150,170,0.85)]">
              No image available
            </div>
          )}

          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-12">
            <p className="font-display text-base font-semibold text-white">
              From: {shoutout.sender_name}
            </p>
            {shoutout.created_at && (
              <p className="mt-0.5 text-xs text-neutral-300">
                {formatDate(shoutout.created_at)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Video Shoutout Card (White card, video at top, sender name below) ─── */
function VideoCardSmall({ shoutout, onClick }: ShoutoutCardProps) {
  const videoSrc = shoutout.media_url || "";
  const isYouTube = !shoutout.media_url && !!shoutout.youtube_url;
  const youtubeEmbedSrc = shoutout.youtube_url ? getYouTubeEmbedSrc(shoutout.youtube_url) : "";

  return (
    <div
      className="envelope-card"
      onClick={onClick}
      onKeyDown={(event) => handleKeyboardActivation(event, onClick)}
      role="button"
      tabIndex={0}
      aria-label={`Open video shoutout from ${shoutout.sender_name}`}
    >
      <div className="envelope-inner overflow-hidden">
        {isYouTube && youtubeEmbedSrc ? (
          /* YouTube placeholder/embed on card with pointer-events disabled */
          <div className="relative aspect-video pointer-events-none">
            <iframe
              src={youtubeEmbedSrc}
              title={`Video shoutout from ${shoutout.sender_name}`}
              className="h-full w-full"
            />
          </div>
        ) : (
          /* Hosted video placeholder/player on card with pointer-events disabled */
          <div className="relative aspect-video pointer-events-none">
            <video
              src={videoSrc}
              preload="metadata"
              playsInline
              className="h-full w-full object-cover"
            />
            {/* Play icon overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-700/90">
                <svg
                  className="ml-0.5 h-5 w-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Sender name below video */}
        <div className="px-4 py-3 bg-white">
          <p className="envelope-sender" style={{ marginBottom: 0 }}>
            From: {shoutout.sender_name}
          </p>
          {shoutout.created_at && (
            <p className="mt-0.5 text-xs text-neutral-500">
              {formatDate(shoutout.created_at)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main ShoutoutCard — routes to the correct variant ─── */
export default function ShoutoutCard(props: ShoutoutCardProps) {
  const handleClick = props.onClick || props.onToggle;
  const wrappedProps = { ...props, onClick: handleClick };

  switch (props.shoutout.message_type) {
    case "text":
      return <TextCard {...wrappedProps} />;
    case "photo":
      return <PhotoCard {...wrappedProps} />;
    case "video":
      return <VideoCardSmall {...wrappedProps} />;
    default:
      return null;
  }
}
