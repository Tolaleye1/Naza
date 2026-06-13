import { Cormorant_Garamond, Jost } from 'next/font/google';
import Script from 'next/script';
import CinematicMusicPlayer from '@/components/shared/cinematic-music-player';
import Navbar from '@/components/shared/navbar';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
});
const jost = Jost({
  subsets: ['latin'],
  weight: ['200', '300', '400'],
  variable: '--font-jost',
});

// Petit Formal Script loaded via @import in globals.css

export const metadata = {
  title: "Naza's Special Day",
  description: "A birthday website made with love — for Naza",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} h-full scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-full antialiased" suppressHydrationWarning>
        <div id="global-bg-layer" aria-hidden="true" />
        <div className="cinematic-vignette" aria-hidden="true" />
        <div id="falling-petals" aria-hidden="true" />
        <Navbar />
        {children}
        <CinematicMusicPlayer />
        <Script src="/js/device-tier-system.js" strategy="beforeInteractive" />
        <Script src="/js/main-site.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
