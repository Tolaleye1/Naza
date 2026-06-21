"use client";

import { useState } from "react";

function isConfigurationPlaceholder(value: string): boolean {
  const trimmed = value.trim();
  return !trimmed || (trimmed.startsWith("[") && trimmed.endsWith("]"));
}

const GIFT_DETAILS = [
  { label: "Bank", value: "Kuda" },
  { label: "Account", value: "2059553438" },
  { label: "Name", value: "Chinaza Modupe Ojukwu" },
];

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");

  function clearCopyStatus() {
    window.setTimeout(() => {
      setCopyStatus("idle");
    }, 2000);
  }

  async function handleCopy() {
    if (isConfigurationPlaceholder(value)) {
      console.error("gift page config incomplete", { label, value });
      setCopyStatus("error");
      setCopied(false);
      clearCopyStatus();
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setCopyStatus("success");
      setTimeout(() => setCopied(false), 2000);
      clearCopyStatus();
    } catch (err) {
      console.error("gift copy failed", err);

      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "0";
      document.body.appendChild(textarea);
      textarea.select();

      const copiedWithFallback = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (copiedWithFallback) {
        setCopied(true);
        setCopyStatus("success");
        setTimeout(() => setCopied(false), 2000);
      } else {
        setCopied(false);
        setCopyStatus("error");
      }

      clearCopyStatus();
    }
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12,
          padding: "14px 20px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--ff-body)",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            flexShrink: 0,
            minWidth: 56,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "var(--ff-body)",
            fontSize: "0.95rem",
            fontWeight: 300,
            color: "var(--gold)",
            flex: 1,
            textAlign: "center",
          }}
        >
          {isConfigurationPlaceholder(value) ? "Configuration incomplete" : value}
        </span>
        <button
          type="button"
          aria-label={`Copy ${label}`}
          onClick={handleCopy}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            flexShrink: 0,
            color: copied ? "var(--rose-light)" : "var(--text-muted)",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!copied) (e.currentTarget as HTMLButtonElement).style.color = "var(--rose-light)";
          }}
          onMouseLeave={(e) => {
            if (!copied) (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
          }}
        >
          {copied ? (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>
      {copyStatus === "error" && (
        <p
          aria-live="polite"
          style={{
            marginTop: 8,
            fontSize: "0.8rem",
            color: "var(--rose-light)",
          }}
        >
          {isConfigurationPlaceholder(value) ? "Configuration incomplete" : "Copy failed"}
        </p>
      )}
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
              maxWidth: 480,
              margin: "0 auto",
              padding: "48px 36px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: 20 }}>🎀</div>
            <h3
              style={{
                fontFamily: "var(--ff-display)",
                fontSize: "1.3rem",
                fontWeight: 300,
                color: "var(--text-light)",
                marginBottom: 28,
              }}
            >
              Send Her Some Love
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
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
                fontSize: "0.85rem",
                color: "var(--rose-light)",
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
