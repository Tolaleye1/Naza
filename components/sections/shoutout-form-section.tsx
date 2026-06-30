"use client";

import { useRef, useState } from "react";

import type { MessageType } from "@/types/shoutout.types";

type FormStatus = "idle" | "loading" | "success" | "error";

const TYPE_OPTIONS: { value: MessageType; label: string; icon: string }[] = [
  { value: "text", label: "Text", icon: "✍️" },
  { value: "photo", label: "Photo", icon: "📷" },
  { value: "video", label: "Video", icon: "🎥" },
];

const MAX_TEXT_LENGTH = 500;

/** Upload a file with progress tracking using XMLHttpRequest */
function uploadWithProgress(
  url: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed with status ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ShoutoutFormSection() {
  const [messageType, setMessageType] = useState<MessageType>("text");
  const [senderName, setSenderName] = useState("");
  const [textContent, setTextContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const charsRemaining = MAX_TEXT_LENGTH - textContent.length;

  function handleTypeChange(type: MessageType) {
    setMessageType(type);
    // Clear content fields when switching type
    setTextContent("");
    setMediaFile(null);
    setYoutubeUrl("");
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setMediaFile(null);
      return;
    }

    // Client-side MIME type validation
    if (messageType === "photo") {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setErrorMsg("Only JPG, PNG, and WebP images are allowed.");
        setMediaFile(null);
        return;
      }
    }

    if (messageType === "video") {
      if (!["video/mp4", "video/quicktime", "video/webm"].includes(file.type)) {
        setErrorMsg("Only MP4, MOV, and WebM videos are allowed.");
        setMediaFile(null);
        return;
      }
    }

    setErrorMsg("");
    setMediaFile(file);
  }

  function resetForm() {
    setSenderName("");
    setTextContent("");
    setMediaFile(null);
    setYoutubeUrl("");
    setMessageType("text");
    setStatus("idle");
    setErrorMsg("");
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    // Client-side validation
    if (!senderName.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }

    if (messageType === "text" && !textContent.trim()) {
      setErrorMsg("Please write a message.");
      return;
    }

    if (messageType === "photo" && !mediaFile) {
      setErrorMsg("Please select a photo to upload.");
      return;
    }

    if (messageType === "video" && !mediaFile && !youtubeUrl.trim()) {
      setErrorMsg("Please select a video or paste a YouTube link.");
      return;
    }

    setStatus("loading");
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("sender_name", senderName.trim());
      formData.append("message_type", messageType);

      if (messageType === "text") {
        formData.append("text_content", textContent);
      }

      // Direct-to-Supabase upload for photo/video files
      if (mediaFile && (messageType === "photo" || messageType === "video")) {
        try {
          // Step 1: Get a signed upload URL from our API
          const urlRes = await fetch("/api/shoutouts/upload-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: mediaFile.name,
              fileType: mediaFile.type,
              bucket: "shoutouts-media",
            }),
          });

          if (!urlRes.ok) {
            const urlData = await urlRes.json();
            setErrorMsg(urlData.error || "Could not prepare upload. Please try again.");
            setStatus("error");
            return;
          }

          const { signedUrl, publicUrl } = await urlRes.json();

          // Step 2: Upload directly to Supabase with progress tracking
          await uploadWithProgress(signedUrl, mediaFile, (percent) => {
            setUploadProgress(percent);
          });

          // Step 3: Send the public URL (not the file) to our API
          formData.append("media_url", publicUrl);
        } catch {
          setErrorMsg(
            "Upload failed — the file may be too large or your connection was interrupted. Please try again."
          );
          setStatus("error");
          return;
        }
      }

      if (messageType === "video" && youtubeUrl.trim()) {
        formData.append("youtube_url", youtubeUrl.trim());
      }

      // Step 4: Submit the shoutout record
      const res = await fetch("/api/shoutouts", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Your media uploaded but the shoutout could not be saved. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMsg(
        "Upload failed — the file may be too large or your connection was interrupted. Please try again."
      );
      setStatus("error");
    }
  }

  // ── Success state ──
  if (status === "success") {
    return (
      <section
        id="shoutout-form"
        className="bg-parchment px-4 py-24 sm:px-8 lg:px-16"
      >
        <div className="mx-auto max-w-lg">
          <div className="relative rounded-xl bg-white p-8 text-center shadow-lg">
            {/* Floating hearts burst — reuses hero floatHeart animation */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <span
                  key={i}
                  className="absolute text-lg"
                  style={{
                    left: `${12 + i * 10}%`,
                    bottom: "20%",
                    color: i % 2 === 0 ? "var(--color-rose)" : "var(--color-rose-light)",
                    animation: `floatHeart ${3 + (i % 3)}s ease-out ${i * 0.2}s forwards`,
                    opacity: 0.9,
                  }}
                >
                  ♥
                </span>
              ))}
            </div>

            {/* Envelope animation */}
            <div className="mb-6 animate-bounce text-6xl">💌</div>

            <h3 className="font-display text-section font-bold text-crimson">
              Your shoutout has been sent!
            </h3>
            <p className="mt-2 font-body text-ink">
              It&apos;ll appear on the wall once it&apos;s approved. 💕
            </p>

            <button
              onClick={resetForm}
              className="mt-8 font-display text-base font-semibold text-crimson underline decoration-crimson/40 underline-offset-4 transition-colors hover:text-crimson-deep"
            >
              Send another shoutout?
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ── Form state ──
  return (
    <section
      id="shoutout-form"
      className="bg-parchment px-4 py-24 sm:px-8 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <h2 className="text-center font-display text-section font-bold text-crimson">
          Leave a Shoutout
        </h2>
        <p className="mt-3 text-center font-script text-lead text-ink">
          Write her a message she&apos;ll never forget
        </p>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-12 max-w-lg rounded-xl bg-white p-8 shadow-lg"
        >
          {/* ── Message Type Selector ── */}
          <div className="flex gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleTypeChange(opt.value)}
                className={`flex-1 rounded-full px-4 py-2.5 font-body text-sm font-semibold transition-all duration-300 ${
                  messageType === opt.value
                    ? "bg-crimson text-cream-text shadow-md"
                    : "bg-parchment-dark text-ink hover:bg-parchment"
                }`}
              >
                <span className="mr-1">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>

          {/* ── Sender Name ── */}
          <div className="mt-8">
            <label
              htmlFor="sender-name"
              className="font-body text-sm font-semibold text-ink"
            >
              Your Name
            </label>
            <input
              id="sender-name"
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              maxLength={60}
              placeholder="What should we call you?"
              className="mt-2 w-full border-b-2 border-crimson/20 bg-transparent px-0 py-2 font-body text-base text-ink outline-none transition-colors placeholder:text-cream-muted focus:border-crimson"
            />
          </div>

          {/* ── Text Content ── */}
          {messageType === "text" && (
            <div className="mt-6">
              <label
                htmlFor="text-content"
                className="font-body text-sm font-semibold text-ink"
              >
                Your Message
              </label>
              <textarea
                id="text-content"
                value={textContent}
                onChange={(e) =>
                  setTextContent(e.target.value.slice(0, MAX_TEXT_LENGTH))
                }
                maxLength={MAX_TEXT_LENGTH}
                rows={5}
                placeholder="Say something beautiful…"
                className="mt-2 w-full resize-none border-b-2 border-crimson/20 bg-transparent px-0 py-2 font-body text-base text-ink outline-none transition-colors placeholder:text-cream-muted focus:border-crimson"
              />
              <p
                className={`mt-1 text-right font-body text-stamp ${
                  charsRemaining < 50 ? "text-error" : "text-cream-muted"
                }`}
              >
                {charsRemaining} characters remaining
              </p>
            </div>
          )}

          {/* ── Photo Upload ── */}
          {messageType === "photo" && (
            <div className="mt-6">
              <label className="font-body text-sm font-semibold text-ink">
                Upload Photo
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-crimson/30 bg-parchment px-6 py-10 transition-colors hover:border-crimson/60"
              >
                {mediaFile ? (
                  <>
                    <span className="text-3xl">📷</span>
                    <p className="mt-2 font-body text-sm font-semibold text-crimson">
                      {mediaFile.name}
                    </p>
                    <p className="mt-0.5 font-body text-stamp text-cream-muted">
                      {formatFileSize(mediaFile.size)} • Click to change
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-3xl">📸</span>
                    <p className="mt-2 font-body text-sm font-semibold text-ink">
                      Click to upload photo
                    </p>
                    <p className="mt-0.5 font-body text-stamp text-cream-muted">
                      JPG, PNG, or WebP
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* ── Video Upload ── */}
          {messageType === "video" && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="font-body text-sm font-semibold text-ink">
                  Upload Video
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-crimson/30 bg-parchment px-6 py-10 transition-colors hover:border-crimson/60"
                >
                  {mediaFile ? (
                    <>
                      <span className="text-3xl">🎥</span>
                      <p className="mt-2 font-body text-sm font-semibold text-crimson">
                        {mediaFile.name}
                      </p>
                      <p className="mt-0.5 font-body text-stamp text-cream-muted">
                        {formatFileSize(mediaFile.size)} • Click to change
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl">🎬</span>
                      <p className="mt-2 font-body text-sm font-semibold text-ink">
                        Click to upload video
                      </p>
                      <p className="mt-0.5 font-body text-stamp text-cream-muted">
                        MP4, MOV, or WebM
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* YouTube URL alternative — only show if no file selected */}
              {!mediaFile && (
                <div>
                  <label
                    htmlFor="youtube-url"
                    className="font-body text-stamp text-cream-muted"
                  >
                    Or paste a YouTube link
                  </label>
                  <input
                    id="youtube-url"
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="mt-1 w-full border-b-2 border-crimson/20 bg-transparent px-0 py-2 font-body text-sm text-ink outline-none transition-colors placeholder:text-cream-muted focus:border-crimson"
                  />
                </div>
              )}
            </div>
          )}

          {/* ── Error Message ── */}
          {errorMsg && (
            <p className="mt-4 font-body text-sm text-error">{errorMsg}</p>
          )}

          {/* ── Submit Button ── */}
          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-8 w-full rounded-lg bg-crimson px-6 py-3.5 font-display text-base font-semibold text-cream-text transition-all duration-300 hover:bg-crimson-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-cream-text/30 border-t-cream-text" />
                {messageType !== "text" && uploadProgress > 0 && uploadProgress < 100
                  ? `Uploading… ${uploadProgress}%`
                  : "Sending…"}
              </span>
            ) : (
              "Send Your Love 💌"
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
