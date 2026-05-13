export interface GalleryItem {
  name: string;
  url: string;
  type: "photo" | "video";
  caption?: string;
}
