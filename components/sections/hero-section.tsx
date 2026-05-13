"use client";

import { useEffect, useState } from "react";

// Deterministic heart configs so we avoid random values on every render
// which would cause hydration mismatches between SSR and client
const HEART_CONFIGS = [
  { left: 12, duration: 8, delay: 0, size: "text-sm", colorVar: "--color-rose" },
  { left: 25, duration: 11, delay: 2, size: "text-lg", colorVar: "--color-rose-light" },
  { left: 38, duration: 7, delay: 5, size: "text-base", colorVar: "--color-rose" },
  { left: 50, duration: 13, delay: 1, size: "text-2xl", colorVar: "--color-rose-light" },
  { left: 62, duration: 9, delay: 4, size: "text-sm", colorVar: "--color-rose" },
  { left: 75, duration: 10, delay: 7, size: "text-xl", colorVar: "--color-rose-light" },
  { left: 88, duration: 6, delay: 3, size: "text-base", colorVar: "--color-rose" },
  { left: 18, duration: 14, delay: 6, size: "text-lg", colorVar: "--color-rose-light" },
  { left: 33, duration: 8, delay: 8, size: "text-sm", colorVar: "--color-rose" },
  { left: 45, duration: 12, delay: 2, size: "text-xl", colorVar: "--color-rose-light" },
  { left: 58, duration: 7, delay: 5, size: "text-2xl", colorVar: "--color-rose" },
  { left: 70, duration: 11, delay: 0, size: "text-base", colorVar: "--color-rose-light" },
  { left: 82, duration: 9, delay: 4, size: "text-lg", colorVar: "--color-rose" },
  { left: 15, duration: 13, delay: 7, size: "text-sm", colorVar: "--color-rose-light" },
  { left: 55, duration: 10, delay: 1, size: "text-xl", colorVar: "--color-rose" },
  { left: 90, duration: 8, delay: 6, size: "text-base", colorVar: "--color-rose-light" },
] as const;

interface HeroSectionProps {
  name?: string;
  subtitle?: string;
}

export default function HeroSection({
  name = "Naza",
  subtitle = "Happy Birthday, my heart ♥",
}: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);

  // Delay animation start until client mount to avoid SSR flash
  useEffect(() => {
    setMounted(true);
  }, []);

  const nameChars = name.split("");

  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ backgroundColor: "var(--color-burgundy)" }}
    >
      {/* Dark rose texture overlay at 8% opacity */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "url('/images/rose-bg.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
          opacity: 0.08,
        }}
        aria-hidden="true"
      />

      {/* Floating hearts layer */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {HEART_CONFIGS.map((heart, i) => (
          <span
            key={i}
            className={heart.size}
            style={{
              position: "absolute",
              left: `${heart.left}%`,
              bottom: "-20px",
              color: `var(${heart.colorVar})`,
              animation: `floatHeart ${heart.duration}s linear ${heart.delay}s infinite`,
            }}
          >
            ♥
          </span>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-4 text-center sm:px-8 lg:px-16">
        {/* Name — letter-by-letter animation */}
        <h1
          className="mb-4 font-script"
          style={{
            fontSize: "var(--text-hero)",
            color: "var(--color-cream-text)",
            lineHeight: 1.1,
          }}
        >
          {nameChars.map((char, i) => (
            <span
              key={i}
              className="inline-block"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(20px)",
                animation: mounted
                  ? `fadeInUp 0.5s ease-out ${i * 0.08}s both`
                  : "none",
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p
          className="font-body"
          style={{
            fontSize: "var(--text-lg)",
            color: "var(--color-cream-muted)",
            fontWeight: 300,
            opacity: mounted ? 1 : 0,
            animation: mounted
              ? `fadeInUp 0.6s ease-out ${nameChars.length * 0.08 + 0.2}s both`
              : "none",
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* Scroll indicator — bouncing chevron */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        style={{
          color: "var(--color-rose-light)",
          opacity: 0.7,
        }}
        aria-hidden="true"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}
