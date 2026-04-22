import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-sans-runtime",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // REGENERATE-ON-CHANGE: this hex MUST mirror
  //   (a) packages/tokens/tokens.css --color-primary
  //   (b) apps/web/public/manifest.webmanifest theme_color (Plan 5)
  // eslint-disable-next-line no-restricted-syntax
  themeColor: "#B71C1C",
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
    <html lang="fr" className={inter.variable}>
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
