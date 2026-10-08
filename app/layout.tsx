import type { Metadata } from "next";
import "./globals.css";

// Intentionally using the system font stack (defined in globals.css) instead
// of next/font/google: this avoids a build-time network fetch to Google
// Fonts, which fails in offline/restricted CI and deploy environments.

export const metadata: Metadata = {
  title: "Garden Cafe",
  description: "QR-based ordering for Garden Cafe",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
