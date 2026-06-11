import type { Metadata } from "next";
import GalaxyShoutoutsSection from "@/components/sections/galaxy-shoutouts-section";

export const metadata: Metadata = {
  title: "Shoutouts — Naza's Special Day",
  description: "Love from everyone who adores Naza",
};

export default function ShoutoutsPage() {
  return (
    <main>
      <GalaxyShoutoutsSection />
    </main>
  );
}
