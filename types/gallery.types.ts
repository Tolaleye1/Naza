export interface GalleryItem {
  id: string;
  storage_path: string;
  url: string;
  media_type: "photo" | "video";
  caption: string | null;
  pin_type: "captured_in_time" | "featured" | null;
  created_at?: string | null;
}
