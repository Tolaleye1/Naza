"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    initMainSite?: () => void;
  }
}

export default function MainSiteInit() {
  useEffect(() => {
    if (window.initMainSite) {
      window.initMainSite();
      return;
    }

    const cards = document.querySelectorAll(".reveal-card");
    cards.forEach((card) => card.classList.add("visible"));
  }, []);

  return null;
}
