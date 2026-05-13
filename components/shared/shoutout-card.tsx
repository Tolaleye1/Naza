"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import type { Shoutout } from "@/types/shoutout.types";

interface ShoutoutCardProps {
  shoutout: Shoutout;
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

/* ─── Text Shoutout Card ─── */
function TextCard({ shoutout }: ShoutoutCardProps) {
  return (
    <div className="stamp-border relative rounded-romantic transition-all duration-300 hover:-translate-y-1">
      {/* Heart stamp icon — top right */}
      <svg
        className="absolute right-3 top-3 h-6 w-6 opacity-50"
        viewBox="0 0 24 24"
        fill="var(--color-rose)"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>

      {/* Sender name */}
      <p className="font-display text-lg font-semibold text-crimson">
        {shoutout.sender_name}
      </p>

      {/* Message */}
      <p className="mt-2 font-body italic leading-relaxed text-ink">
        {shoutout.text_content}
      </p>

      {/* Timestamp */}
      {shoutout.created_at && (
        <p className="mt-3 text-right text-stamp text-cream-muted">
          {formatDate(shoutout.created_at)}
        </p>
      )}
    </div>
  );
}

/* ─── Photo Shoutout Card ─── */
function PhotoCard({ shoutout }: ShoutoutCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-romantic transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/3]">
        <Image
          src={shoutout.media_url || ""}
          alt={`Shoutout from ${shoutout.sender_name}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          loading="lazy"
        />

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-12">
          <p className="font-display text-base font-semibold text-cream-text">
            {shoutout.sender_name}
          </p>
          {shoutout.created_at && (
            <p className="mt-0.5 text-stamp text-cream-muted">
              {formatDate(shoutout.created_at)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Video Shoutout Card ─── */
function VideoCardSmall({ shoutout }: ShoutoutCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Resolve source: prefer media_url, fall back to youtube_url embed
  const videoSrc = shoutout.media_url || "";
  const isYouTube = !shoutout.media_url && !!shoutout.youtube_url;

  function handlePlay() {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }

  return (
    <div className="overflow-hidden rounded-romantic bg-parchment-dark transition-all duration-300 hover:-translate-y-1">
      {isYouTube ? (
        /* YouTube embed */
        <div className="relative aspect-video">
          <iframe
            src={shoutout.youtube_url?.replace("watch?v=", "embed/") || ""}
            title={`Video shoutout from ${shoutout.sender_name}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : (
        /* Hosted video */
        <div className="relative">
          <video
            ref={videoRef}
            src={videoSrc}
            controls={isPlaying}
            preload="metadata"
            playsInline
            className="aspect-video w-full object-cover"
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Play overlay */}
          {!isPlaying && (
            <button
              onClick={handlePlay}
              aria-label={`Play video from ${shoutout.sender_name}`}
              className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-crimson/90 transition-transform hover:scale-110">
                <svg
                  className="ml-0.5 h-5 w-5 text-cream-text"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Sender name below video */}
      <div className="px-4 py-3">
        <p className="font-display text-base font-semibold text-crimson">
          {shoutout.sender_name}
        </p>
        {shoutout.created_at && (
          <p className="mt-0.5 text-stamp text-cream-muted">
            {formatDate(shoutout.created_at)}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Main ShoutoutCard — routes to the correct variant ─── */
export default function ShoutoutCard({ shoutout }: ShoutoutCardProps) {
  switch (shoutout.message_type) {
    case "text":
      return <TextCard shoutout={shoutout} />;
    case "photo":
      return <PhotoCard shoutout={shoutout} />;
    case "video":
      return <VideoCardSmall shoutout={shoutout} />;
    default:
      return null;
  }
}
