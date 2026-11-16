import type { Metadata, Viewport } from 'next';
import { Bodoni_Moda, Jost, Allura } from 'next/font/google';
import { wedding } from '@/content/wedding';
import './globals.css';

// Only weight 400 (normal + italic) of Bodoni Moda is used anywhere in the
// codebase — `font-medium`/`font-semibold`/`font-bold` never appear next to
// `font-serif`/`font-display` (grep confirmed) — so weight 500 is dropped.
// This is the hero's critical display face, so it keeps the default preload.
const display = Bodoni_Moda({ subsets: ['latin'], weight: ['400'], style: ['normal', 'italic'], variable: '--font-display', display: 'swap' });
// Body copy face: not needed for first paint, so it relies on `swap` instead
// of an eager preload.
const jost = Jost({ subsets: ['latin'], weight: ['300', '400'], variable: '--font-jost', display: 'swap', preload: false });
// Names-only decorative face: likewise deferred. Allura reads as a bolder,
// more legible calligraphic script than Pinyon Script at display sizes.
const script = Allura({ subsets: ['latin'], weight: '400', variable: '--font-script', display: 'swap', preload: false });

const { site } = wedding;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  robots: { index: false, follow: false, nocache: true },
  openGraph: {
    title: site.title,
    description: site.description,
    url: site.url,
    siteName: 'Naveen & Jayashree',
    type: 'website',
    images: [{ url: site.ogImage, width: 1200, height: 630, alt: 'Naveen & Jayashree wedding invitation' }],
  },
  twitter: { card: 'summary_large_image', title: site.title, description: site.description, images: [site.ogImage] },
  icons: { icon: '/icon.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F4E8' },
    { media: '(prefers-color-scheme: dark)', color: '#2A1F14' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${jost.variable} ${script.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
