"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PolaroidFrame from "@/components/shared/polaroid-frame";
import VideoCard from "@/components/shared/video-card";
import type { GalleryItem } from "@/types/gallery.types";

interface GalleryTabsProps {
  photos: GalleryItem[];
  videos: GalleryItem[];
}

export default function GalleryTabs({ photos, videos }: GalleryTabsProps) {
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
        {photos.length === 0 ? (
          <p className="py-12 text-center font-body text-cream-muted/60">
            No photos yet
          </p>
        ) : (
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            {photos.map((photo, index) => (
              <PolaroidFrame
                key={photo.name}
                src={photo.url}
                alt={photo.caption ?? photo.name}
                caption={photo.caption}
                rotation={((index % 7) - 3) * 1.2}
              />
            ))}
          </div>
        )}
      </TabsContent>

      {/* Videos grid — standard grid */}
      <TabsContent value="videos">
        {videos.length === 0 ? (
          <p className="py-12 text-center font-body text-cream-muted/60">
            No videos yet
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <VideoCard
                key={video.name}
                src={video.url}
                name={video.caption ?? video.name}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
