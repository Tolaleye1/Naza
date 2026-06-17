import type { Metadata } from "next";
import GallerySection from "@/components/sections/gallery-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery — Naza's Special Day",
  description: "Our moments together, forever captured",
};

export default function GalleryPage() {
  return (
    <main>
      <section style={{ paddingTop: 40 }}>
        <GallerySection />
      </section>
    </main>
  );
}
