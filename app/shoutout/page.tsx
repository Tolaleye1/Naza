"use client";

import { useRef, useState } from "react";
import type { MessageType } from "@/types/shoutout.types";


type FormStatus = "idle" | "loading" | "success" | "error";

const TYPE_OPTIONS: { value: MessageType; label: string; icon: string }[] = [
  { value: "text", label: "Text", icon: "✍️" },
  { value: "photo", label: "Photo", icon: "📷" },
  { value: "video", label: "Video", icon: "🎥" },
];

const MAX_PROFILE_SIZE = 5 * 1024 * 1024;
const MAX_TEXT_LENGTH = 500;
const ALLOWED_PROFILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
  const [profilePreview, setProfilePreview] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const charsRemaining = MAX_TEXT_LENGTH - textContent.length;
  function handleTypeChange(type: MessageType) {
    setMessageType(type);
    setTextContent("");
    setMediaFile(null);
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleProfileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setProfilePic(null);
      setProfilePreview(undefined);
      return;
    }

    if (!ALLOWED_PROFILE_TYPES.includes(file.type)) {
      setErrorMsg("Only JPG, PNG, and WebP images are allowed.");
      setProfilePic(null);
      setProfilePreview(undefined);
      return;
    }

    if (file.size > MAX_PROFILE_SIZE) {
      setErrorMsg("Profile picture must be under 5MB.");
      setProfilePic(null);
      setProfilePreview(undefined);
      return;
    }

    setErrorMsg("");
    setProfilePic(file);
    const reader = new FileReader();
    reader.onload = () => setProfilePreview(reader.result as string);
    reader.readAsDataURL(file);
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
    setProfilePic(null);
    setProfilePreview(undefined);
    setMessageType("text");
    setStatus("idle");
    setErrorMsg("");
    setUploadProgress(0);
    setUploadStage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (profileInputRef.current) profileInputRef.current.value = "";
  }

  /** Upload a file via XMLHttpRequest so we can track progress */
  function uploadWithProgress(
    url: string,
    file: File,
    onProgress: (percent: number) => void
  ): Promise<{ ok: boolean; status: number }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status });
      };

      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.onabort = () => reject(new Error("Upload aborted"));

      xhr.send(file);
    });
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
    if (messageType === "video" && !mediaFile) {
      setErrorMsg("Please select a video to upload.");
      return;
    }

    setStatus("loading");
    setUploadProgress(0);
    setUploadStage("");

    try {
      let mediaUrl: string | null = null;
      let profilePictureUrl: string | null = null;

      // ── Direct-to-Supabase upload for media files ──
      if (mediaFile && (messageType === "photo" || messageType === "video")) {
        // Step 1: Get a signed upload URL
        setUploadStage("Preparing...");
        setUploadProgress(0);
        let uploadUrlRes: Response;
        try {
          uploadUrlRes = await fetch("/api/shoutouts/upload-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: mediaFile.name,
              fileType: mediaFile.type,
              bucket: "shoutouts-media",
            }),
          });
        } catch {
          setErrorMsg("Could not prepare upload. Please try again.");
          setStatus("error");
          return;
        }

        const uploadUrlData = await uploadUrlRes.json();
        if (!uploadUrlRes.ok) {
          setErrorMsg(uploadUrlData.error || "Could not prepare upload. Please try again.");
          setStatus("error");
          return;
        }

        // Step 2: Upload directly to Supabase Storage with progress tracking
        setUploadStage(messageType === "video" ? "Uploading video..." : "Uploading photo...");
        try {
          const result = await uploadWithProgress(
            uploadUrlData.signedUrl,
            mediaFile,
            (percent) => setUploadProgress(percent)
          );

          if (!result.ok) {
            setErrorMsg("Upload failed — the file may be too large or your connection was interrupted. Please try again.");
            setStatus("error");
            return;
          }
        } catch {
          setErrorMsg("Upload failed — the file may be too large or your connection was interrupted. Please try again.");
          setStatus("error");
          return;
        }

        setUploadProgress(100);
        // Step 3: Use the public URL
        mediaUrl = uploadUrlData.publicUrl;
      }

      // ── Direct-to-Supabase upload for profile picture ──
      if (profilePic) {
        try {
          const pfpUrlRes = await fetch("/api/shoutouts/upload-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: profilePic.name,
              fileType: profilePic.type,
              bucket: "profile-pictures",
            }),
          });

          if (pfpUrlRes.ok) {
            const pfpUrlData = await pfpUrlRes.json();

            const pfpUploadRes = await fetch(pfpUrlData.signedUrl, {
              method: "PUT",
              headers: { "Content-Type": profilePic.type },
              body: profilePic,
            });

            if (pfpUploadRes.ok) {
              profilePictureUrl = pfpUrlData.publicUrl;
            }
          }
        } catch {
          // Profile picture upload failure is non-fatal — continue without it
        }
      }

      // ── Submit the shoutout (body is now tiny — just strings) ──
      setUploadStage("Saving...");
      const formData = new FormData();
      formData.append("sender_name", senderName.trim());
      formData.append("message_type", messageType);

      if (messageType === "text") {
        formData.append("text_content", textContent);
      }
      if (mediaUrl) {
        formData.append("media_url", mediaUrl);
      }
      if (profilePictureUrl) {
        formData.append("profile_picture_url", profilePictureUrl);
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
      setErrorMsg("Something went wrong. Please check your connection and try again.");
      setStatus("error");
    }
  }

  // ── Success state ──
  if (status === "success") {
    return (
      <main>
        <section
          id="shoutout-form"
          className="bg-transparent px-4 sm:px-8 lg:px-16"
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
      <section id="shoutout-form">
        <div className="section-inner" style={{ maxWidth: "600px" }}>
          <p className="section-eyebrow">leave your love</p>
          <h2 className="section-title">
            A Shoutout<br />
            <em>for Naza</em>
          </h2>

          <form
            onSubmit={handleSubmit}
            className="glass"
            style={{
              padding: "40px 30px",
              textAlign: "left",
              marginTop: "40px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* Type Selector */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                borderRadius: "999px",
                border: "1px solid var(--glass-border)",
                padding: "4px",
                background: "rgba(0,0,0,0.3)",
              }}
            >
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleTypeChange(opt.value)}
                  style={{
                    flex: 1,
                    borderRadius: "999px",
                    padding: "10px",
                    fontFamily: "var(--ff-body)",
                    fontSize: "0.85rem",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    background: messageType === opt.value ? "var(--rose)" : "transparent",
                    color: messageType === opt.value ? "var(--dark-wine)" : "var(--text-muted)",
                    fontWeight: messageType === opt.value ? 500 : 300,
                  }}
                >
                  <span style={{ marginRight: "4px" }}>{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Profile Picture Upload */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <label
                style={{
                  fontFamily: "var(--ff-body)",
                  fontSize: "0.85rem",
                  fontWeight: 300,
                  color: "var(--text-muted)",
                  marginBottom: "12px",
                }}
              >
                Profile Picture (optional)
              </label>
              <div
                onClick={() => profileInputRef.current?.click()}
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  border: "2px dashed var(--glass-border)",
                  background: "rgba(0,0,0,0.2)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  transition: "border-color 0.3s",
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
                    }}
                  />
                ) : (
                  <svg
                    style={{ width: "32px", height: "32px", color: "var(--text-muted)", opacity: 0.5 }}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>
              <p
                style={{
                  marginTop: "8px",
                  fontFamily: "var(--ff-body)",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  opacity: 0.6,
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
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label
                htmlFor="sender-name"
                style={{
                  fontFamily: "var(--ff-body)",
                  fontSize: "0.85rem",
                  fontWeight: 300,
                  color: "var(--text-muted)",
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
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--glass-border)",
                  padding: "10px 0",
                  fontFamily: "var(--ff-body)",
                  fontSize: "1rem",
                  color: "var(--text-light)",
                  outline: "none",
                  transition: "border-color 0.3s",
                }}
              />
            </div>

            {/* Text Content */}
            {messageType === "text" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label
                  htmlFor="text-content"
                  style={{
                    fontFamily: "var(--ff-body)",
                    fontSize: "0.85rem",
                    fontWeight: 300,
                    color: "var(--text-muted)",
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
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: "1px solid var(--glass-border)",
                    padding: "10px 0",
                    fontFamily: "var(--ff-body)",
                    fontSize: "1rem",
                    color: "var(--text-light)",
                    outline: "none",
                    resize: "none",
                    transition: "border-color 0.3s",
                  }}
                />
                <p
                  style={{
                    textAlign: "right",
                    fontFamily: "var(--ff-body)",
                    fontSize: "0.75rem",
                    color: charsRemaining < 50 ? "var(--color-error)" : "var(--text-muted)",
                    opacity: 0.6,
                  }}
                >
                  {charsRemaining} characters remaining
                </p>
              </div>
            )}

            {/* Photo Upload */}
            {messageType === "photo" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label
                  style={{
                    fontFamily: "var(--ff-body)",
                    fontSize: "0.85rem",
                    fontWeight: 300,
                    color: "var(--text-muted)",
                  }}
                >
                  Upload Photo
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: "2px dashed var(--glass-border)",
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: "12px",
                    padding: "40px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {mediaFile ? (
                    <>
                      <span style={{ fontSize: "2rem" }}>📷</span>
                      <p
                        style={{
                          fontFamily: "var(--ff-body)",
                          fontSize: "0.9rem",
                          color: "var(--rose-light)",
                          margin: 0,
                        }}
                      >
                        {mediaFile.name}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--ff-body)",
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          opacity: 0.6,
                          margin: 0,
                        }}
                      >
                        {formatFileSize(mediaFile.size)} • Click to change
                      </p>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: "2rem" }}>📸</span>
                      <p
                        style={{
                          fontFamily: "var(--ff-body)",
                          fontSize: "0.9rem",
                          color: "var(--text-light)",
                          margin: 0,
                        }}
                      >
                        Click to upload photo
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--ff-body)",
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          opacity: 0.6,
                          margin: 0,
                        }}
                      >
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

            {/* Video Upload */}
            {messageType === "video" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label
                    style={{
                      fontFamily: "var(--ff-body)",
                      fontSize: "0.85rem",
                      fontWeight: 300,
                      color: "var(--text-muted)",
                    }}
                  >
                    Upload Video
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: "2px dashed var(--glass-border)",
                      background: "rgba(0,0,0,0.2)",
                      borderRadius: "12px",
                      padding: "40px 20px",
                      textAlign: "center",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    {mediaFile ? (
                      <>
                        <span style={{ fontSize: "2rem" }}>🎥</span>
                        <p
                          style={{
                            fontFamily: "var(--ff-body)",
                            fontSize: "0.9rem",
                            color: "var(--rose-light)",
                            margin: 0,
                          }}
                        >
                          {mediaFile.name}
                        </p>
                        <p
                          style={{
                            fontFamily: "var(--ff-body)",
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            opacity: 0.6,
                            margin: 0,
                          }}
                        >
                          {formatFileSize(mediaFile.size)} • Click to change
                        </p>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: "2rem" }}>🎬</span>
                        <p
                          style={{
                            fontFamily: "var(--ff-body)",
                            fontSize: "0.9rem",
                            color: "var(--text-light)",
                            margin: 0,
                          }}
                        >
                          Click to upload video
                        </p>
                        <p
                          style={{
                            fontFamily: "var(--ff-body)",
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            opacity: 0.6,
                            margin: 0,
                          }}
                        >
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

              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <p
                style={{
                  fontFamily: "var(--ff-body)",
                  fontSize: "0.9rem",
                  color: "var(--color-error)",
                  margin: 0,
                }}
              >
                {errorMsg}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                width: "100%",
                borderRadius: "999px",
                padding: "14px",
                fontFamily: "var(--ff-body)",
                fontSize: "1rem",
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s",
                background: "var(--rose)",
                color: "var(--dark-wine)",
                marginTop: "12px",
              }}
            >
              {status === "loading" ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      height: "18px",
                      width: "18px",
                      animation: "spin-slow 1s linear infinite",
                      borderRadius: "50%",
                      border: "2px solid rgba(14,2,8,0.3)",
                      borderTopColor: "#0e0208",
                    }}
                  />
                  {uploadStage || "Sending…"}
                </span>
              ) : (
                "Send Your Love 💌"
              )}
            </button>

            {/* Upload Progress Bar */}
            {status === "loading" && (messageType === "photo" || messageType === "video") && mediaFile && (
              <div
                style={{
                  width: "100%",
                  marginTop: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "6px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${uploadProgress}%`,
                      borderRadius: "999px",
                      background: "linear-gradient(90deg, var(--rose), var(--rose-light))",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
                <p
                  style={{
                    fontFamily: "var(--ff-body)",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    textAlign: "center",
                    margin: 0,
                    opacity: 0.7,
                  }}
                >
                  {uploadProgress}%{uploadStage ? ` — ${uploadStage}` : ""}
                </p>
              </div>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
