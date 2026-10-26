import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Digital Library — Personal & Public Knowledge Hub",
  description: "A calm, personal home for writing, preserving, discovering and reading knowledge.",
  applicationName: "My Digital Library",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" }
};
export const viewport: Viewport = {
  themeColor: "#E6F6FF",
  width: "device-width",
  initialScale: 1
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}