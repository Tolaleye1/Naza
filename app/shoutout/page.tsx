"use client";

import { useRef, useState } from "react";
import type { MessageType } from "@/types/shoutout.types";

type FormStatus = "idle" | "loading" | "success" | "error";

const TYPE_OPTIONS: { value: MessageType; label: string; icon: string }[] = [
  { value: "text", label: "Text", icon: "✍️" },
  { value: "photo", label: "Photo", icon: "📷" },
  { value: "video", label: "Video", icon: "🎥" },
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_TEXT_LENGTH = 500;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ShoutoutPage() {
  const [messageType, setMessageType] = useState<MessageType>("text");
  const [senderName, setSenderName] = useState("");
  const [textContent, setTextContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const charsRemaining = MAX_TEXT_LENGTH - textContent.length;

  function handleTypeChange(type: MessageType) {
    setMessageType(type);
    setTextContent("");
    setMediaFile(null);
    setYoutubeUrl("");
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleProfileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onload = () => setProfilePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setMediaFile(null);
      return;
    }

    if (messageType === "photo") {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setErrorMsg("Only JPG, PNG, and WebP images are allowed.");
        setMediaFile(null);
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setErrorMsg("Photo must be under 5MB.");
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
      if (file.size > MAX_VIDEO_SIZE) {
        setErrorMsg("Video must be under 50MB.");
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
    setProfilePic(null);
    setProfilePreview(null);
    setYoutubeUrl("");
    setMessageType("text");
    setStatus("idle");
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (profileInputRef.current) profileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

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

    try {
      const formData = new FormData();
      formData.append("sender_name", senderName.trim());
      formData.append("message_type", messageType);

      if (messageType === "text") {
        formData.append("text_content", textContent);
      }
      if (mediaFile) {
        formData.append("media_file", mediaFile);
      }
      if (profilePic) {
        formData.append("profile_picture", profilePic);
      }
      if (messageType === "video" && youtubeUrl.trim()) {
        formData.append("youtube_url", youtubeUrl.trim());
      }

      const res = await fetch("/api/shoutouts", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  // ── Success state ──
  if (status === "success") {
    return (
      <main>
        <section
          id="shoutout-form"
          className="bg-transparent px-4 py-32 sm:px-8 lg:px-16"
        >
          <div className="mx-auto max-w-lg">
            <div className="glass" style={{ padding: "48px 36px", textAlign: "center" }}>
              <div style={{ fontSize: "4rem", marginBottom: 16 }} className="animate-bounce">💌</div>
              <h3
                style={{
                  fontFamily: "var(--ff-display)",
                  fontSize: "1.5rem",
                  fontWeight: 300,
                  color: "var(--text-light)",
                  marginBottom: 8,
                }}
              >
                Your shoutout has been sent!
              </h3>
              <p
                style={{
                  fontFamily: "var(--ff-body)",
                  fontSize: "0.95rem",
                  color: "var(--text-muted)",
                }}
              >
                It&apos;ll appear on the wall once it&apos;s approved. 💕
              </p>
              <button
                onClick={resetForm}
                style={{
                  marginTop: 24,
                  fontFamily: "var(--ff-body)",
                  fontSize: "0.9rem",
                  color: "var(--rose-light)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Send another shoutout?
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ── Form state ──
  return (
    <main>
      <section
        id="shoutout-form"
        className="bg-transparent px-4 py-32 sm:px-8 lg:px-16"
      >
        <div className="mx-auto max-w-6xl">
          <p className="section-eyebrow">leave your love</p>
          <h2 className="section-title">
            A Shoutout
            <br />
            <em>for Naza</em>
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-12 max-w-lg glass p-8 shadow-2xl"
          >
            {/* Type Selector */}
            <div
              className="flex gap-2 rounded-full border px-1 py-1"
              style={{
                borderColor: "rgba(255,150,180,0.15)",
                background: "rgba(0,0,0,0.4)",
              }}
            >
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleTypeChange(opt.value)}
                  className="flex-1 rounded-full py-2 font-body text-sm transition-all duration-300 cursor-pointer"
                  style={
                    messageType === opt.value
                      ? {
                          background: "#e8698a",
                          color: "#0e0208",
                          fontWeight: 500,
                        }
                      : {
                          color: "rgba(200,150,170,0.75)",
                          background: "transparent",
                        }
                  }
                >
                  <span className="mr-1">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Profile Picture Upload */}
            <div className="mt-6 flex flex-col items-center">
              <label
                style={{
                  fontFamily: "var(--ff-body)",
                  fontSize: "0.85rem",
                  fontWeight: 300,
                  color: "rgba(200,150,170,0.85)",
                  marginBottom: 12,
                }}
              >
                Profile Picture (optional)
              </label>
              <div
                onClick={() => profileInputRef.current?.click()}
                className="relative cursor-pointer transition-colors flex items-center justify-center overflow-hidden"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  border: "2px dashed rgba(255,150,180,0.25)",
                  background: "rgba(0,0,0,0.2)",
                }}
              >
                {profilePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profilePreview}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  <svg
                    style={{ width: 32, height: 32, color: "rgba(200,150,170,0.5)" }}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>
              <p
                style={{
                  marginTop: 8,
                  fontFamily: "var(--ff-body)",
                  fontSize: "0.75rem",
                  color: "rgba(200,150,170,0.5)",
                }}
              >
                JPG, PNG, or WebP
              </p>
              <input
                ref={profileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleProfileChange}
                className="hidden"
              />
            </div>

            {/* Sender Name */}
            <div className="mt-6 text-left">
              <label
                htmlFor="sender-name"
                style={{
                  fontFamily: "var(--ff-body)",
                  fontSize: "0.85rem",
                  fontWeight: 300,
                  color: "rgba(200,150,170,0.85)",
                }}
              >
                Your Name
              </label>
              <input
                id="sender-name"
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                maxLength={60}
                placeholder="What's your name?"
                className="mt-2 w-full bg-transparent px-0 py-2 font-body text-base outline-none transition-colors"
                style={{
                  borderBottom: "1px solid rgba(255,150,180,0.2)",
                  color: "var(--text-light)",
                }}
              />
            </div>

            {/* Text Content */}
            {messageType === "text" && (
              <div className="mt-6 text-left">
                <label
                  htmlFor="text-content"
                  style={{
                    fontFamily: "var(--ff-body)",
                    fontSize: "0.85rem",
                    fontWeight: 300,
                    color: "rgba(200,150,170,0.85)",
                  }}
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
                  placeholder="Say something beautiful..."
                  className="mt-2 w-full resize-none bg-transparent px-0 py-2 font-body text-base outline-none transition-colors"
                  style={{
                    borderBottom: "1px solid rgba(255,150,180,0.2)",
                    color: "var(--text-light)",
                  }}
                />
                <p
                  className="mt-1 text-right font-body"
                  style={{
                    fontSize: "0.75rem",
                    color: charsRemaining < 50 ? "var(--color-error)" : "rgba(200,150,170,0.5)",
                  }}
                >
                  {charsRemaining} characters remaining
                </p>
              </div>
            )}

            {/* Photo Upload */}
            {messageType === "photo" && (
              <div className="mt-6 text-left">
                <label
                  style={{
                    fontFamily: "var(--ff-body)",
                    fontSize: "0.85rem",
                    fontWeight: 300,
                    color: "rgba(200,150,170,0.85)",
                  }}
                >
                  Upload Photo
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg px-6 py-10 transition-colors"
                  style={{
                    border: "2px dashed rgba(255,150,180,0.25)",
                    background: "rgba(0,0,0,0.2)",
                  }}
                >
                  {mediaFile ? (
                    <>
                      <span style={{ fontSize: "2rem" }}>📷</span>
                      <p
                        className="mt-2 font-body text-sm"
                        style={{ color: "var(--rose)" }}
                      >
                        {mediaFile.name}
                      </p>
                      <p
                        className="mt-0.5 font-body"
                        style={{ fontSize: "0.75rem", color: "rgba(200,150,170,0.5)" }}
                      >
                        {formatFileSize(mediaFile.size)} • Click to change
                      </p>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: "2rem" }}>📸</span>
                      <p
                        className="mt-2 font-body text-sm"
                        style={{ color: "var(--text-light)" }}
                      >
                        Click to upload photo
                      </p>
                      <p
                        className="mt-0.5 font-body"
                        style={{ fontSize: "0.75rem", color: "rgba(200,150,170,0.5)" }}
                      >
                        JPG, PNG, or WebP • Max 5MB
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

            {/* Video Upload */}
            {messageType === "video" && (
              <div className="mt-6 space-y-4 text-left">
                <div>
                  <label
                    style={{
                      fontFamily: "var(--ff-body)",
                      fontSize: "0.85rem",
                      fontWeight: 300,
                      color: "rgba(200,150,170,0.85)",
                    }}
                  >
                    Upload Video
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg px-6 py-10 transition-colors"
                    style={{
                      border: "2px dashed rgba(255,150,180,0.25)",
                      background: "rgba(0,0,0,0.2)",
                    }}
                  >
                    {mediaFile ? (
                      <>
                        <span style={{ fontSize: "2rem" }}>🎥</span>
                        <p
                          className="mt-2 font-body text-sm"
                          style={{ color: "var(--rose)" }}
                        >
                          {mediaFile.name}
                        </p>
                        <p
                          className="mt-0.5 font-body"
                          style={{ fontSize: "0.75rem", color: "rgba(200,150,170,0.5)" }}
                        >
                          {formatFileSize(mediaFile.size)} • Click to change
                        </p>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: "2rem" }}>🎬</span>
                        <p
                          className="mt-2 font-body text-sm"
                          style={{ color: "var(--text-light)" }}
                        >
                          Click to upload video
                        </p>
                        <p
                          className="mt-0.5 font-body"
                          style={{ fontSize: "0.75rem", color: "rgba(200,150,170,0.5)" }}
                        >
                          MP4, MOV, or WebM • Max 50MB
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

                {!mediaFile && (
                  <div>
                    <label
                      htmlFor="youtube-url"
                      style={{
                        fontFamily: "var(--ff-body)",
                        fontSize: "0.75rem",
                        color: "rgba(200,150,170,0.5)",
                      }}
                    >
                      Or paste a YouTube link
                    </label>
                    <input
                      id="youtube-url"
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="mt-1 w-full bg-transparent px-0 py-2 font-body text-sm outline-none transition-colors"
                      style={{
                        borderBottom: "1px solid rgba(255,150,180,0.2)",
                        color: "var(--text-light)",
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <p
                className="mt-4 font-body text-sm"
                style={{ color: "var(--color-error)" }}
              >
                {errorMsg}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-8 w-full rounded-full px-6 py-3.5 font-body text-base transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              style={{
                background: "#e8698a",
                color: "#0e0208",
                fontWeight: 400,
              }}
            >
              {status === "loading" ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="inline-block h-5 w-5 animate-spin rounded-full"
                    style={{
                      border: "2px solid rgba(14,2,8,0.3)",
                      borderTopColor: "#0e0208",
                    }}
                  />
                  Sending…
                </span>
              ) : (
                "Send Your Love 💌"
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
