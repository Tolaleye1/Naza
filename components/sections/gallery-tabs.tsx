"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PolaroidFrame from "@/components/shared/polaroid-frame";
import VideoCard from "@/components/shared/video-card";
import type { GalleryItem } from "@/types/gallery.types";

interface GalleryTabsProps {
  initialPinned: GalleryItem[];
  initialUnpinned: GalleryItem[];
  initialHasMore: boolean;
}

export default function GalleryTabs({
  initialPinned,
  initialUnpinned,
  initialHasMore,
}: GalleryTabsProps) {
  const [page, setPage] = useState(1);
  const [unpinned, setUnpinned] = useState<GalleryItem[]>(initialUnpinned);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  // Group pinned items
  const pinnedPhotos = initialPinned.filter((item) => item.media_type === "photo");
  const pinnedVideos = initialPinned.filter((item) => item.media_type === "video");

  // Group current unpinned items
  const unpinnedPhotos = unpinned.filter((item) => item.media_type === "photo");
  const unpinnedVideos = unpinned.filter((item) => item.media_type === "video");

  // Combine for render
  const allPhotos = [...pinnedPhotos, ...unpinnedPhotos];
  const allVideos = [...pinnedVideos, ...unpinnedVideos];

  async function loadMore() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/gallery?page=${page + 1}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setUnpinned((prev) => [...prev, ...data.unpinned]);
        setHasMore(data.hasMore);
        setPage((p) => p + 1);
      }
    } catch (e) {
      console.error("Error loading more gallery items:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Tabs defaultValue="photos" className="mx-auto max-w-6xl">
      <TabsList className="mx-auto mb-10 w-fit gap-2 rounded-lg bg-burgundy-card/60 p-1">
        <TabsTrigger
          value="photos"
          className="rounded-md px-6 py-2 font-display text-sm text-cream-muted transition-all data-[active]:bg-crimson/80 data-[active]:text-cream-text"
        >
          Photos 📷
        </TabsTrigger>
        <TabsTrigger
          value="videos"
          className="rounded-md px-6 py-2 font-display text-sm text-cream-muted transition-all data-[active]:bg-crimson/80 data-[active]:text-cream-text"
        >
          Videos 🎥
        </TabsTrigger>
      </TabsList>

      {/* Photos grid — CSS columns for masonry-like layout */}
      <TabsContent value="photos">
        {allPhotos.length === 0 ? (
          <p className="py-12 text-center font-body text-cream-muted/60">
            No photos yet
          </p>
        ) : (
          <>
            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
              {allPhotos.map((photo, index) => (
                <PolaroidFrame
                  key={photo.id}
                  src={photo.url}
                  alt={photo.caption ?? photo.storage_path}
                  caption={photo.caption ?? undefined}
                  rotation={((index % 7) - 3) * 1.2}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-full border border-crimson/30 bg-burgundy-card/40 px-8 py-3 font-display text-sm text-cream-text transition-all hover:scale-105 hover:bg-crimson/60 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Moments"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </TabsContent>

      {/* Videos grid — standard grid */}
      <TabsContent value="videos">
        {allVideos.length === 0 ? (
          <p className="py-12 text-center font-body text-cream-muted/60">
            No videos yet
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {allVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  src={video.url}
                  name={video.caption ?? video.storage_path}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-full border border-crimson/30 bg-burgundy-card/40 px-8 py-3 font-display text-sm text-cream-text transition-all hover:scale-105 hover:bg-crimson/60 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Moments"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </TabsContent>
    </Tabs>
  );
}
