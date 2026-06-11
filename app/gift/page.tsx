"use client";

import { useState } from "react";

const GIFT_DETAILS = [
  { label: "Bank", value: "[BANK_NAME]" },
  { label: "Account", value: "[ACCOUNT_NUMBER]" },
  { label: "Name", value: "[ACCOUNT_NAME]" },
];

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-black/40 border border-white/5 px-4 py-3">
      <span
        className="shrink-0"
        style={{
          fontFamily: "var(--ff-body)",
          fontSize: "0.75rem",
          color: "rgba(200,150,170,0.8)",
        }}
      >
        {label}
      </span>
      <span
        className="truncate"
        style={{
          fontFamily: "monospace",
          fontSize: "0.875rem",
          color: "#ffe87a",
        }}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={`Copy ${label}`}
        onClick={handleCopy}
        className="shrink-0 rounded p-1.5 transition-colors hover:bg-white/5 cursor-pointer"
        style={{ color: copied ? "var(--rose-light)" : "rgba(200,150,170,0.7)" }}
      >
        {copied ? (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default function GiftPage() {
  return (
    <main>
      <section id="gift" style={{ background: "transparent" }}>
        <div className="section-inner">
          <p className="section-eyebrow">send some love</p>
          <h2 className="section-title">
            Gift Naza
            <br />
            <em>She Deserves It All</em>
          </h2>
          <div
            className="glass"
            style={{
              maxWidth: 400,
              margin: "0 auto",
              padding: "48px 36px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: 24 }}>🎀</div>
            <h3
              style={{
                fontFamily: "var(--ff-display)",
                fontSize: "1.5rem",
                fontWeight: 300,
                color: "var(--text-light)",
                marginBottom: 24,
              }}
            >
              Send Her Some Love
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                textAlign: "left",
              }}
            >
              {GIFT_DETAILS.map((d) => (
                <CopyRow key={d.label} label={d.label} value={d.value} />
              ))}
            </div>
            <p
              style={{
                marginTop: 24,
                fontFamily: "var(--ff-script)",
                fontSize: "0.9rem",
                color: "var(--text-muted)",
              }}
            >
              every little gesture means the world 🌸
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
