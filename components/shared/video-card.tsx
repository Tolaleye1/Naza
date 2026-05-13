"use client";

import { useRef, useState } from "react";

interface VideoCardProps {
  src: string;
  name: string;
}

export default function VideoCard({ src, name }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  function handlePlay() {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl bg-burgundy-card transition-all duration-300 hover:-translate-y-1">
      {/* Video container */}
      <div className="relative">
        <video
          ref={videoRef}
          src={src}
          controls={isPlaying}
          preload="metadata"
          playsInline
          className="aspect-video w-full object-cover"
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Play button overlay — hidden once playing */}
        {!isPlaying && (
          <button
            onClick={handlePlay}
            aria-label={`Play ${name}`}
            className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-crimson/90 transition-transform hover:scale-110">
              <svg
                className="ml-1 h-7 w-7 text-cream-text"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* Caption */}
      <p className="px-4 py-3 text-center font-body text-sm text-cream-muted">
        {name}
      </p>
    </div>
  );
}
