import type { Metadata, Viewport } from "next";
import { StudioShell } from "@/components/studio/shell";
import "@/styles/studio.css";

/* News Studio's own icons and theme colour. SVG for modern browsers; .ico
 * for Safari/legacy; PNG for the iOS home screen. No analytics here — News
 * Studio never had any. */
export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/news-studio/favicon.svg", type: "image/svg+xml" }],
    other: [{ rel: "alternate icon", url: "/news-studio/favicon.ico", type: "image/x-icon", sizes: "16x16 32x32 48x48" }],
    apple: [{ url: "/news-studio/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#141417",
};

/* `data-studio` scopes the studio's base styles (styles/studio.css) so they
 * never reach the marketing pages sharing the document; the studio was
 * built on preflight's 1.5 line-height and antialiased text. */
export default function NewsStudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-studio="" className="leading-normal antialiased">
      <StudioShell>{children}</StudioShell>
    </div>
  );
}
