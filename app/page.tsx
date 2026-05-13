import HeroSection from "@/components/sections/hero-section";
import LetterSection from "@/components/sections/letter-section";
import GallerySection from "@/components/sections/gallery-section";
import ShoutoutsSection from "@/components/sections/shoutouts-section";
import ShoutoutFormSection from "@/components/sections/shoutout-form-section";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <LetterSection />
      <GallerySection />
      <ShoutoutsSection />
      <ShoutoutFormSection />
    </main>
  );
}
