import type { GalleryItem } from "@/types/gallery.types";
import GalleryTabs from "./gallery-tabs";

/** Fetch gallery items from internal API route at request time */
async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/gallery`, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data: GalleryItem[] = await res.json();
    return data;
  } catch {
    // Graceful fallback — bucket may be empty or env vars missing
    return [];
  }
}

export default async function GallerySection() {
  const items = await getGalleryItems();
  const photos = items.filter((item) => item.type === "photo");
  const videos = items.filter((item) => item.type === "video");

  return (
    <section
      id="gallery"
      className="min-h-screen bg-burgundy-mid px-4 py-24 sm:px-8 lg:px-16"
    >
      {/* Heading */}
      <h2 className="mb-4 text-center font-display text-section text-cream-text">
        Us, Through the Years
      </h2>
      <p className="mb-12 text-center font-script text-lead text-rose-light">
        Every moment, forever ours
      </p>

      {/* Content */}
      {items.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20">
          <span className="mb-4 text-5xl" role="img" aria-label="heart">
            💕
          </span>
          <p className="font-display text-lg text-cream-muted">
            Coming soon...
          </p>
          <p className="mt-2 font-body text-sm text-cream-muted/60">
            Our gallery is being prepared with love
          </p>
        </div>
      ) : (
        <GalleryTabs photos={photos} videos={videos} />
      )}
    </section>
  );
}
