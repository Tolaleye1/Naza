"use client";

import dynamic from "next/dynamic";

const GalaxyShoutoutsSection = dynamic(
  () => import("@/components/sections/galaxy-shoutouts-section"),
  {
    ssr: false,
    loading: () => (
      <div className="galaxy-canvas-wrap">
        <div className="galaxy-loading">
          <div className="galaxy-loading-spinner" />
          <p>Loading the galaxy...</p>
        </div>
      </div>
    ),
  }
);

export default function GalaxyShoutoutsLazy({ visible }: { visible: boolean }) {
  return <GalaxyShoutoutsSection visible={visible} />;
}
