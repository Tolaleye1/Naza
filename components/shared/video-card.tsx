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
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  }

  return (
    <div className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-burgundy-card/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      {/* Video container */}
      <div className="relative h-full w-full">
        <video
          ref={videoRef}
          src={src}
          controls={isPlaying}
          preload="metadata"
          playsInline
          className="h-full w-full object-cover"
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />

        {/* Play/Pause overlay button */}
        {!isPlaying && (
          <button
            onClick={handlePlay}
            aria-label={`Play ${name}`}
            className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-crimson/90 transition-transform group-hover:scale-110">
              <svg
                className="ml-1 h-6 w-6 text-cream-text"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* Hover Overlay with Name/Caption */}
      {name && (
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="text-center font-display text-xs sm:text-sm text-cream-text line-clamp-2">
            {name}
          </p>
        </div>
      )}
    </div>
  );
}
