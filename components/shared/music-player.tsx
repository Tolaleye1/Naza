"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Invisible background music controller.
 * - Attempts muted autoplay on mount
 * - Unmutes on first user interaction (click/tap)
 * - Pauses when any <video> on the page starts playing
 * - Resumes when that video pauses or ends
 */
export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Attempt muted autoplay on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = true;
    audio.play().catch(() => {
      // Autoplay blocked — will start on first interaction
    });
  }, []);

  // On first interaction anywhere: unmute and play
  useEffect(() => {
    if (hasInteracted) return;

    const handleFirstInteraction = () => {
      setHasInteracted(true);
      const audio = audioRef.current;
      if (audio) {
        audio.muted = false;
        audio.play().catch(() => {
          // Playback failed even after interaction
        });
      }
    };

    document.addEventListener("click", handleFirstInteraction, { once: true });
    document.addEventListener("touchstart", handleFirstInteraction, {
      once: true,
    });

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, [hasInteracted]);

  // Pause background music when any <video> plays, resume when it stops
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleVideoPlay = (e: Event) => {
      // Only pause for actual <video> elements, not our own <audio>
      if (e.target instanceof HTMLVideoElement) {
        audio.pause();
      }
    };

    const handleVideoStop = (e: Event) => {
      // Only resume for actual <video> elements
      if (e.target instanceof HTMLVideoElement && hasInteracted) {
        audio.play().catch(() => {
          // Resume failed — not critical
        });
      }
    };

    // Use event delegation on document for all current and future <video> elements
    document.addEventListener("play", handleVideoPlay, true);
    document.addEventListener("pause", handleVideoStop, true);
    document.addEventListener("ended", handleVideoStop, true);

    return () => {
      document.removeEventListener("play", handleVideoPlay, true);
      document.removeEventListener("pause", handleVideoStop, true);
      document.removeEventListener("ended", handleVideoStop, true);
    };
  }, [hasInteracted]);

  // Render only a hidden <audio> element — no visible UI
  return (
    <audio
      ref={audioRef}
      src="/audio/song.mp3"
      loop
      preload="auto"
      onError={() => {
        // Gracefully handle missing song.mp3 — no crash
      }}
      style={{ display: "none" }}
    />
  );
}
