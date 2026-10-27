import { Be_Vietnam_Pro, Playfair_Display, Roboto } from "next/font/google";
import { GaGuard } from "@/components/site/ga-guard";
import { GA_ID } from "@/lib/site";
import "./globals.css";
import { cn } from "@/lib/utils";

/* Self-hosted by next/font: no request to Google at runtime, no layout
 * shift. Each exposes a CSS variable the Tailwind theme reads (globals.css). */
const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--nf-be-vietnam",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--nf-playfair-display",
  display: "swap",
  preload: false,
});
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--nf-roboto",
  display: "swap",
  preload: false,
});

/* One root layout for the whole site — marketing pages, /news and News
 * Studio — so every move between them is an in-app navigation. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(beVietnam.variable, playfair.variable, roboto.variable)}>
      <body>
        {children}
        <GaGuard gaId={GA_ID} />
      </body>
    </html>
  );
}
