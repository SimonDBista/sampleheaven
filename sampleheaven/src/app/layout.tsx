import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "../context/ToastContext";
import { AuthProvider } from "../context/AuthContext";
import { AudioProvider } from "../context/AudioContext";
import Navbar from "../components/Navbar";
import GlobalPlayer from "../components/GlobalPlayer";
import Footer from "../components/Footer";

// Load Google Fonts using Next.js font loader
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SampleGoldmine — Discover, Share and Download Free Audio Samples",
    template: "%s | SampleGoldmine"
  },
  description: "Join the community-driven sound sharing marketplace for music producers. Download royalty-free drum loops, one-shots, synth pads, and MIDI patterns.",
  keywords: ["free samples", "drum loops", "royalty-free audio", "trap 808s", "lo-fi loops", "music production"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "SampleGoldmine",
              "url": "http://localhost:3000",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "http://localhost:3000/browse?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <ToastProvider>
          <AuthProvider>
            <AudioProvider>
              {/* Global Glassmorphism Navigation */}
              <Navbar />
              
              {/* Main view container */}
              <main
                style={{
                  flexGrow: 1,
                  paddingBottom: '90px' // offset for persistent bottom audio player
                }}
              >
                {children}
              </main>
              
              {/* Persistent bottom audio player */}
              <GlobalPlayer />
              
              {/* Global footer site-links */}
              <Footer />
            </AudioProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
