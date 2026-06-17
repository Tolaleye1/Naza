"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, X, Video, LogOut, Loader2, Lock, Unlock } from "lucide-react";
import type { Shoutout } from "@/types/shoutout.types";
import type { GalleryItem } from "@/types/gallery.types";



export default function AdminDashboard() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  // Section 1: Shoutouts
  const [shoutouts, setShoutouts] = useState<Shoutout[]>([]);
  const [shoutoutsLoading, setShoutoutsLoading] = useState(true);

  // Section 2: Visibility
  const [visibility, setVisibility] = useState(true);
  const [visibilityLoading, setVisibilityLoading] = useState(true);
  const [visibilityUpdating, setVisibilityUpdating] = useState(false);

  // Section 4: Gallery Page
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null);

  const capturedCount = galleryItems.filter(
    (item) => item.pin_type === "captured_in_time"
  ).length;

  // Fetch initial data
  useEffect(() => {
    fetchShoutouts();
    fetchVisibility();
    fetchGalleryItems();
  }, []);

  const fetchShoutouts = async () => {
    setShoutoutsLoading(true);
    try {
      const res = await fetch("/api/shoutouts?all=true");
      if (res.ok) {
        const data = await res.json();
        setShoutouts(data.shoutouts || []);
      }
    } catch (e) {
      console.error("Error fetching shoutouts:", e);
    } finally {
      setShoutoutsLoading(false);
    }
  };

  const fetchVisibility = async () => {
    setVisibilityLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setVisibility(data.visible);
      }
    } catch (e) {
      console.error("Error fetching visibility setting:", e);
    } finally {
      setVisibilityLoading(false);
    }
  };

  const fetchGalleryItems = async () => {
    setGalleryLoading(true);
    try {
      const res = await fetch("/api/gallery?all=true");
      if (res.ok) {
        const data = await res.json();
        setGalleryItems(data || []);
      }
    } catch (e) {
      console.error("Error fetching gallery items:", e);
    } finally {
      setGalleryLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.refresh();
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      setLoggingOut(false);
    }
  };

  // Section 1 Actions
  const handleDeleteShoutout = async (id: string) => {
    if (!confirm("Delete this shoutout? This cannot be undone.")) return;

    const previousShoutouts = [...shoutouts];
    // Optimistic UI update
    setShoutouts(shoutouts.filter((s) => s.id !== id));

    try {
      const res = await fetch(`/api/admin/shoutouts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete");
      }
    } catch {
      alert("Failed to delete shoutout. Restoring list.");
      setShoutouts(previousShoutouts);
    }
  };

  // Section 2 Actions
  const handleToggleVisibility = async () => {
    const nextVisibility = !visibility;
    setVisibilityUpdating(true);
    
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: nextVisibility }),
      });

      if (res.ok) {
        setVisibility(nextVisibility);
      } else {
        alert("Failed to update visibility setting.");
      }
    } catch (e) {
      console.error("Error toggling visibility:", e);
      alert("An error occurred. Please try again.");
    } finally {
      setVisibilityUpdating(false);
    }
  };

  // Section 4 Actions (Gallery Media)
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("File must be under 50MB.");
      return;
    }

    setGalleryUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to upload");
      }

      await fetchGalleryItems();
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to upload media.";
      alert(message);
    } finally {
      setGalleryUploading(false);
      if (galleryFileInputRef.current) {
        galleryFileInputRef.current.value = "";
      }
    }
  };

  const handleGalleryDelete = async (id: string) => {
    if (!confirm("Delete this gallery item?")) return;

    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setGalleryItems(galleryItems.filter((item) => item.id !== id));
      } else {
        alert("Failed to delete file.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred.");
    }
  };

  const handleTogglePin = async (
    id: string,
    currentPin: string | null,
    targetPin: "captured_in_time" | "featured"
  ) => {
    const newPinType = currentPin === targetPin ? null : targetPin;

    try {
      const res = await fetch(`/api/admin/gallery/${id}/pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin_type: newPinType }),
      });

      if (res.ok) {
        setGalleryItems(
          galleryItems.map((item) =>
            item.id === id ? { ...item, pin_type: newPinType } : item
          )
        );
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update pin.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred.");
    }
  };

  return (
    <main style={{ minHeight: "100vh", padding: "90px 20px 60px", color: "var(--cream)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <h1 className="section-title" style={{ margin: 0, fontFamily: "var(--ff-display)", fontSize: "2.5rem", fontWeight: 300 }}>
            Admin
          </h1>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "rgba(232, 105, 138, 0.15)",
              border: "1px solid rgba(232, 105, 138, 0.4)",
              borderRadius: "999px",
              padding: "8px 16px",
              fontFamily: "var(--ff-body)",
              fontSize: "0.85rem",
              color: "var(--rose-light)",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(232, 105, 138, 0.3)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(232, 105, 138, 0.15)"}
          >
            {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
            Sign Out
          </button>
        </div>

        {/* Dashboard Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          
          {/* Section 2 — Shoutout Visibility Toggle */}
          <div className="glass" style={{ borderTop: "2px solid var(--rose)", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: "28px 24px" }}>
            <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "1.4rem", fontWeight: 400, color: "var(--rose-light)", marginBottom: 16 }}>
              Shoutout Visibility
            </h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {visibility ? (
                  <Unlock size={20} style={{ color: "var(--rose)" }} />
                ) : (
                  <Lock size={20} style={{ color: "var(--text-muted)" }} />
                )}
                <span style={{ fontFamily: "var(--ff-body)", fontSize: "0.95rem", fontWeight: 300 }}>
                  {visibility ? "Shoutouts are visible to visitors" : "Shoutouts are hidden — visitors see a coming soon message"}
                </span>
              </div>
              <button
                onClick={handleToggleVisibility}
                disabled={visibilityLoading || visibilityUpdating}
                style={{
                  position: "relative",
                  width: "56px",
                  height: "28px",
                  borderRadius: "999px",
                  backgroundColor: visibility ? "var(--rose)" : "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 4px",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "var(--dark-wine)",
                    transform: visibility ? "translateX(28px)" : "translateX(0)",
                    transition: "transform 0.3s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {(visibilityUpdating || visibilityLoading) && <Loader2 size={12} className="animate-spin" style={{ color: "var(--rose)" }} />}
                </div>
              </button>
            </div>
          </div>

          {/* Section 1 — Shoutouts Management */}
          <div className="glass" style={{ borderTop: "2px solid var(--rose)", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: "28px 24px" }}>
            <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "1.4rem", fontWeight: 400, color: "var(--rose-light)", marginBottom: 4 }}>
              Shoutouts
            </h2>
            <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 20, fontWeight: 300 }}>
              Manage messages left by everyone who adores Naza
            </p>

            {shoutoutsLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                <Loader2 size={24} className="animate-spin" style={{ color: "var(--rose)" }} />
              </div>
            ) : shoutouts.length === 0 ? (
              <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.9rem", color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
                No shoutouts submitted yet.
              </p>
            ) : (
              <div style={{ maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, paddingRight: 8 }}>
                {shoutouts.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      padding: 16,
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      borderRadius: 12,
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, marginRight: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: "var(--ff-display)", color: "var(--rose-light)", fontSize: "1.1rem", fontWeight: 400 }}>
                          {s.sender_name}
                        </span>
                        <span
                          style={{
                            fontSize: "0.65rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            padding: "2px 8px",
                            borderRadius: "999px",
                            backgroundColor:
                              s.message_type === "photo"
                                ? "rgba(150, 100, 255, 0.15)"
                                : s.message_type === "video"
                                ? "rgba(247, 200, 115, 0.15)"
                                : "rgba(232, 105, 138, 0.15)",
                            color:
                              s.message_type === "photo"
                                ? "#b496ff"
                                : s.message_type === "video"
                                ? "#f7c873"
                                : "var(--rose-light)",
                            border: `1px solid ${
                              s.message_type === "photo"
                                ? "rgba(150, 100, 255, 0.3)"
                                : s.message_type === "video"
                                ? "rgba(247, 200, 115, 0.3)"
                                : "rgba(232, 105, 138, 0.3)"
                            }`,
                          }}
                        >
                          {s.message_type}
                        </span>
                      </div>
                      <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.65)", margin: 0, lineHeight: 1.4, wordBreak: "break-word" }}>
                        {s.text_content || (s.message_type === "photo" ? "📸 Image upload" : "🎥 Video upload")}
                      </p>
                      <span style={{ fontFamily: "var(--ff-body)", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {s.created_at ? new Date(s.created_at).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteShoutout(s.id)}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        padding: 6,
                        borderRadius: 8,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--destructive)";
                        e.currentTarget.style.backgroundColor = "rgba(192, 57, 43, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--text-muted)";
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4 — Gallery Page Media */}
          <div className="glass" style={{ borderTop: "2px solid var(--rose)", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: "28px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "1.4rem", fontWeight: 400, color: "var(--rose-light)", marginBottom: 4 }}>
                  Gallery
                </h2>
                <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, fontWeight: 300 }}>
                  All photos and videos shown on the Gallery page
                </p>
              </div>
              <button
                onClick={() => galleryFileInputRef.current?.click()}
                disabled={galleryUploading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: "var(--rose)",
                  color: "var(--dark-wine)",
                  border: "none",
                  borderRadius: "999px",
                  padding: "10px 20px",
                  fontFamily: "var(--ff-body)",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--rose-light)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--rose)"}
              >
                {galleryUploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                Upload Media
              </button>
              <input
                ref={galleryFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                onChange={handleGalleryUpload}
                style={{ display: "none" }}
              />
            </div>

            {galleryLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                <Loader2 size={24} className="animate-spin" style={{ color: "var(--rose)" }} />
              </div>
            ) : galleryItems.length === 0 ? (
              <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.9rem", color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
                Gallery is empty. Upload images or videos to display them on the Gallery page.
              </p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {galleryItems.map((item) => (
                  <div
                    key={item.id}
                    className="glass"
                    style={{
                      borderRadius: 16,
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      overflow: "hidden",
                      backgroundColor: "rgba(255, 255, 255, 0.02)",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Media Container */}
                    <div style={{ position: "relative", width: "100%", aspectRatio: "1.25", backgroundColor: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {item.media_type === "photo" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.url} alt={item.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ position: "relative", width: "100%", height: "100%" }}>
                          <video src={item.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
                          <div style={{ position: "absolute", bottom: 8, left: 8, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 4, padding: "2px 4px", display: "flex", alignItems: "center" }}>
                            <Video size={12} style={{ color: "white" }} />
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => handleGalleryDelete(item.id)}
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          backgroundColor: "rgba(0, 0, 0, 0.6)",
                          border: "none",
                          borderRadius: "50%",
                          width: 24,
                          height: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          backdropFilter: "blur(4px)",
                          zIndex: 5,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--destructive)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.6)"}
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Info & Pin Controls Footer */}
                    <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px", flex: 1, justifyContent: "space-between" }}>
                      <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.8rem", color: "var(--cream)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.caption || ""}>
                        {item.caption || "Untitled"}
                      </p>

                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {/* Pin Captured in Time */}
                        <button
                          onClick={() => handleTogglePin(item.id, item.pin_type, "captured_in_time")}
                          disabled={capturedCount >= 4 && item.pin_type !== "captured_in_time"}
                          style={{
                            width: "100%",
                            padding: "6px 8px",
                            borderRadius: "6px",
                            fontFamily: "var(--ff-body)",
                            fontSize: "0.75rem",
                            cursor: capturedCount >= 4 && item.pin_type !== "captured_in_time" ? "not-allowed" : "pointer",
                            transition: "all 0.2s",
                            backgroundColor: item.pin_type === "captured_in_time" ? "var(--rose)" : "transparent",
                            color: item.pin_type === "captured_in_time" ? "var(--dark-wine)" : "var(--rose-light)",
                            border: item.pin_type === "captured_in_time" ? "1px solid var(--rose)" : "1px solid rgba(232, 105, 138, 0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                          }}
                        >
                          <span>📌 Captured in Time</span>
                          {item.pin_type !== "captured_in_time" && capturedCount >= 4 && (
                            <span style={{ fontSize: "0.65rem", opacity: 0.8 }}>(4/4)</span>
                          )}
                          {item.pin_type === "captured_in_time" && (
                            <span style={{ fontSize: "0.65rem", fontWeight: "bold" }}>(Pinned)</span>
                          )}
                        </button>

                        {/* Pin Featured */}
                        <button
                          onClick={() => handleTogglePin(item.id, item.pin_type, "featured")}
                          style={{
                            width: "100%",
                            padding: "6px 8px",
                            borderRadius: "6px",
                            fontFamily: "var(--ff-body)",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            backgroundColor: item.pin_type === "featured" ? "var(--rose)" : "transparent",
                            color: item.pin_type === "featured" ? "var(--dark-wine)" : "var(--rose-light)",
                            border: item.pin_type === "featured" ? "1px solid var(--rose)" : "1px solid rgba(232, 105, 138, 0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                          }}
                        >
                          <span>⭐ Feature</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
