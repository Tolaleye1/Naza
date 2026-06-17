import type { GalleryItem } from "@/types/gallery.types";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import GalleryTabs from "./gallery-tabs";

/** Query Supabase directly instead of self-referencing API fetch */
async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("gallery_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gallery fetch error:", error.message);
      return [];
    }

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function GallerySection() {
  const items = await getGalleryItems();
  const photos = items.filter((i) => i.media_type === "photo");
  const videos = items.filter((i) => i.media_type === "video");

  return (
    <section id="gallery" style={{ padding: "100px 20px 80px" }}>
      <div className="section-inner">
        <p className="section-eyebrow">through the years</p>
        <h2 className="section-title">
          Us, Forever<br />
          <em>Captured</em>
        </h2>

        {items.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", padding: "60px 20px", gap: 16
          }}>
            <span style={{ fontSize: "3.5rem" }}>💕</span>
            <p style={{
              fontFamily: "var(--ff-display)",
              color: "var(--text-muted)",
              fontSize: "1.1rem"
            }}>
              Our gallery is being prepared with love...
            </p>
          </div>
        ) : (
          <GalleryTabs photos={photos} videos={videos} />
        )}
      </div>
    </section>
  );
}
