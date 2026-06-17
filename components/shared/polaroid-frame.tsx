"use client";

import { useState } from "react";

interface PolaroidFrameProps {
  src: string;
  alt: string;
  caption?: string;
  rotation?: number;
}

export default function PolaroidFrame({
  src,
  alt,
  caption,
}: PolaroidFrameProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-burgundy-card/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      {/* Skeleton placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 h-full w-full animate-pulse bg-burgundy-card/40" />
      )}
      
      {/* Image */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0"
        }`}
      />

      {/* Hover Overlay with Caption */}
      {caption && isLoaded && (
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="text-center font-display text-xs sm:text-sm text-cream-text line-clamp-2">
            {caption}
          </p>
        </div>
      )}
    </div>
  );
}
