import type { Metadata, Viewport } from "next";
import { Caveat, Roboto } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans-runtime",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-handwriting",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // REGENERATE-ON-CHANGE: this hex MUST mirror
  //   (a) packages/tokens/tokens.css --color-primary
  //   (b) apps/web/public/manifest.webmanifest theme_color
  // eslint-disable-next-line no-restricted-syntax
  themeColor: "#BA0B2F",
};

export const metadata: Metadata = {
  title: "Guide Foodie Journey",
  description: "Collectez vos souvenirs des restaurants Michelin.",
  applicationName: "Guide Foodie Journey",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Foodie Journey",
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  icons: {
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    icon: [
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${roboto.variable} ${caveat.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Aller au contenu
        </a>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
