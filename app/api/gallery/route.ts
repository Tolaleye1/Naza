import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { GalleryItem } from "@/types/gallery.types";

const PHOTO_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm"];

function getMediaType(filename: string): "photo" | "video" | null {
  const lower = filename.toLowerCase();
  if (PHOTO_EXTENSIONS.some((ext) => lower.endsWith(ext))) return "photo";
  if (VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext))) return "video";
  return null;
}

/** Derive a human-readable caption: strip extension, replace underscores/hyphens with spaces */
function deriveCaption(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();

    const { data: files, error } = await supabase.storage
      .from("gallery")
      .list("gallery", {
        limit: 50,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      console.error("Gallery storage list error:", error.message);
      return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
    }

    // Filter out folders (metadata-only entries) and non-media files
    const items: GalleryItem[] = (files ?? [])
      .filter((file) => {
        const type = getMediaType(file.name);
        // Exclude placeholder files Supabase creates for empty folders
        return type !== null && file.name !== ".emptyFolderPlaceholder";
      })
      .map((file) => {
        const { data: urlData } = supabase.storage
          .from("gallery")
          .getPublicUrl(`gallery/${file.name}`);

        return {
          name: file.name,
          url: urlData.publicUrl,
          type: getMediaType(file.name)!,
          caption: deriveCaption(file.name),
        };
      });

    return NextResponse.json(items);
  } catch (err) {
    console.error("Gallery API unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
