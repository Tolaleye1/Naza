import type { Metadata } from "next";
import { Dancing_Script, Lato, Playfair_Display } from "next/font/google";
import "./globals.css";
import MusicPlayer from "@/components/shared/music-player";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dancing = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Naza's Special Day",
  description: "A birthday website made with love",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dancing.variable} ${lato.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full bg-parchment font-body text-ink antialiased" suppressHydrationWarning>
        {children}
        <MusicPlayer />
      </body>
    </html>
  );
}
