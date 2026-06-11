"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

const TRACKS = [
  {
    title: "Still the One",
    artist: "Shania Twain",
    file: "/audio/landing-song.mp3",
  },
  {
    title: "Can't Help Falling in Love",
    artist: "Elvis Presley",
    file: "/audio/main-song.mp3",
  },
];

const CROSSFADE_MS = 1500;
const MAX_VOLUME = 0.75;

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export default function CinematicMusicPlayer() {
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  const [panelOpen, setPanelOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Refs for both audio elements
  const audioRefs = useRef<[HTMLAudioElement | null, HTMLAudioElement | null]>([null, null]);
  const rafRef = useRef<number | null>(null);
  const crossfadeRafRef = useRef<number | null>(null);

  const unlockedRef = useRef(unlocked);
  const isPlayingRef = useRef(isPlaying);
  const activeIndexRef = useRef(activeIndex);

  useEffect(() => {
    unlockedRef.current = unlocked;
    isPlayingRef.current = isPlaying;
    activeIndexRef.current = activeIndex;
  }, [unlocked, isPlaying, activeIndex]);

  // Create both audio elements on mount
  useEffect(() => {
    const audios = TRACKS.map((track) => {
      const audio = new Audio(track.file);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0;
      return audio;
    });

    audioRefs.current = [audios[0], audios[1]];

    const handleMeta0 = () => {
      if (activeIndex === 0) setDuration(audios[0].duration);
    };
    const handleMeta1 = () => {
      if (activeIndex === 1) setDuration(audios[1].duration);
    };

    audios[0].addEventListener("loadedmetadata", handleMeta0);
    audios[1].addEventListener("loadedmetadata", handleMeta1);

    return () => {
      audios[0].removeEventListener("loadedmetadata", handleMeta0);
      audios[1].removeEventListener("loadedmetadata", handleMeta1);
      audios.forEach((a) => {
        a.pause();
        a.src = "";
      });
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (crossfadeRafRef.current) cancelAnimationFrame(crossfadeRafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Crossfade function: smoothly ramp volumes over CROSSFADE_MS
  const crossfadeTo = useCallback(
    (targetIndex: number) => {
      const fadeOut = audioRefs.current[targetIndex === 0 ? 1 : 0];
      const fadeIn = audioRefs.current[targetIndex];
      if (!fadeOut || !fadeIn) return;

      // Cancel any ongoing crossfade
      if (crossfadeRafRef.current) {
        cancelAnimationFrame(crossfadeRafRef.current);
        crossfadeRafRef.current = null;
      }

      const startTime = performance.now();
      const startVolumeOut = fadeOut.volume;
      const startVolumeIn = fadeIn.volume;

      // Start the incoming song if it's paused and we're playing
      if (fadeIn.paused && isPlaying) {
        void fadeIn.play().catch(() => {});
      }

      function step(now: number) {
        if (!fadeOut || !fadeIn) return;
        const elapsed = now - startTime;
        const t = Math.max(0, Math.min(elapsed / CROSSFADE_MS, 1));
        // Ease-in-out cubic
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        fadeOut.volume = Math.max(0, Math.min(MAX_VOLUME, startVolumeOut * (1 - ease)));
        fadeIn.volume = Math.max(0, Math.min(MAX_VOLUME, startVolumeIn + (MAX_VOLUME - startVolumeIn) * ease));

        if (t < 1) {
          crossfadeRafRef.current = requestAnimationFrame(step);
        } else {
          // Crossfade complete — pause the faded-out song
          fadeOut.volume = 0;
          fadeIn.volume = MAX_VOLUME;
          if (!fadeOut.paused) fadeOut.pause();
          crossfadeRafRef.current = null;
        }
      }

      crossfadeRafRef.current = requestAnimationFrame(step);
    },
    [isPlaying]
  );

  const crossfadeToRef = useRef(crossfadeTo);
  useEffect(() => {
    crossfadeToRef.current = crossfadeTo;
  }, [crossfadeTo]);

  // React to route changes and scroll position (IntersectionObserver for hero on homepage)
  useEffect(() => {
    const performSwitch = (targetIndex: number) => {
      if (activeIndexRef.current === targetIndex) return;

      setActiveIndex(targetIndex);

      // Update duration from the new active song
      const newAudio = audioRefs.current[targetIndex];
      if (newAudio && newAudio.duration) {
        setDuration(newAudio.duration);
      }

      const isUnlocked = unlockedRef.current;
      const isPlay = isPlayingRef.current;

      if (isUnlocked && isPlay) {
        crossfadeToRef.current(targetIndex);
      } else {
        // Silent switch
        const oldIndex = targetIndex === 0 ? 1 : 0;
        const oldAudio = audioRefs.current[oldIndex];
        const activeAudio = audioRefs.current[targetIndex];

        if (oldAudio) {
          oldAudio.volume = 0;
          if (!oldAudio.paused) oldAudio.pause();
        }
        if (activeAudio) {
          activeAudio.volume = isPlay ? MAX_VOLUME : 0;
        }
      }
    };

    if (pathname !== "/") {
      // Force Song 2 (index 1) when on other pages
      performSwitch(1);
      return;
    }

    // On homepage: observe #hero
    let observer: IntersectionObserver | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const setupObserver = () => {
      const hero = document.getElementById("hero");
      if (!hero) {
        // Retry if hero is not mounted yet
        timeoutId = setTimeout(setupObserver, 100);
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          const targetIndex = entry.isIntersecting ? 0 : 1;
          performSwitch(targetIndex);
        },
        { threshold: 0.1 }
      );
      observer.observe(hero);
    };

    setupObserver();

    return () => {
      if (observer) observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [pathname]);

  // Progress update loop — tracks the active song
  useEffect(() => {
    function tick() {
      const audio = audioRefs.current[activeIndex];
      if (!audio || audio.paused) {
        rafRef.current = null;
        return;
      }

      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
      rafRef.current = requestAnimationFrame(tick);
    }

    if (isPlaying) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isPlaying, activeIndex]);

  // Unlock both audio elements on first user interaction
  const unlock = useCallback(async (): Promise<boolean> => {
    if (unlocked) return true;

    const targetIndex = isHomepage ? 0 : 1;
    const activeAudio = audioRefs.current[targetIndex];
    const otherAudio = audioRefs.current[targetIndex === 0 ? 1 : 0];
    if (!activeAudio) return false;

    try {
      // Set volume for the active song, mute the other
      activeAudio.volume = MAX_VOLUME;
      if (otherAudio) otherAudio.volume = 0;

      await activeAudio.play();

      // Also unlock the other audio (play then immediately pause)
      if (otherAudio) {
        try {
          await otherAudio.play();
          otherAudio.pause();
        } catch {
          // Non-critical — will unlock on next crossfade
        }
      }

      setActiveIndex(targetIndex);
      setIsPlaying(true);
      setUnlocked(true);

      if (activeAudio.duration) setDuration(activeAudio.duration);

      return true;
    } catch {
      return false;
    }
  }, [unlocked, isHomepage]);

  // First user interaction unlocks audio
  useEffect(() => {
    if (unlocked) return;

    async function handleFirstInteraction() {
      const success = await unlock();
      if (success) {
        document.removeEventListener("click", handleFirstInteraction);
        document.removeEventListener("touchstart", handleFirstInteraction);
        document.removeEventListener("touchend", handleFirstInteraction);
      }
    }

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("touchstart", handleFirstInteraction, { passive: true });
    document.addEventListener("touchend", handleFirstInteraction, { passive: true });

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
      document.removeEventListener("touchend", handleFirstInteraction);
    };
  }, [unlocked, unlock]);

  function togglePlayPause() {
    const audio = audioRefs.current[activeIndex];
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.volume = MAX_VOLUME;
      void audio.play().then(() => {
        setIsPlaying(true);
        setUnlocked(true);
      });
    }
  }

  function togglePanel() {
    setPanelOpen((prev) => !prev);
    if (!unlocked) void unlock();
  }

  const activeTrack = TRACKS[activeIndex];

  return (
    <>
      {/* Floating toggle button */}
      <button
        id="cp-toggle-btn"
        className={`${panelOpen ? "cp-panel-open" : ""} ${isPlaying ? "cp-is-playing" : ""}`}
        onClick={togglePanel}
        aria-label="Toggle music player"
        aria-expanded={panelOpen}
      >
        {/* Musical note icon */}
        <svg
          className="cp-toggle-icon cp-icon-note"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
        {/* Close X icon */}
        <svg
          className="cp-toggle-icon cp-icon-close"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>

      {/* Slide-up panel */}
      <div
        id="cp-root"
        className={panelOpen ? "cp-visible" : ""}
        role="region"
        aria-label="Music Player"
      >
        {/* Minimise button */}
        <button
          className="cp-mini-btn"
          onClick={(e) => {
            e.stopPropagation();
            setPanelOpen(false);
          }}
          aria-label="Close player"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13H5v-2h14v2z" />
          </svg>
        </button>

        <div className="cp-card">
          {/* Cover placeholder */}
          <div className="cp-cover-wrap">🌸</div>

          {/* Info + controls */}
          <div className="cp-body">
            <div className="cp-info">
              <p className="cp-title">{activeTrack.title}</p>
              <p className="cp-artist">{activeTrack.artist}</p>
            </div>

            {/* Progress bar */}
            <div className="cp-progress-wrap">
              <div className="cp-progress-track">
                <div
                  className="cp-progress-fill"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="cp-progress-dot"
                  style={{ left: `${progress}%` }}
                />
              </div>
              <div className="cp-times">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="cp-controls">
              <button
                className="cp-btn cp-play-btn"
                onClick={togglePlayPause}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7L8 5z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
