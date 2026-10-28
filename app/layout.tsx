import type { Metadata, Viewport } from "next";
import { Mali, Prompt } from "next/font/google";
import "./globals.css";

// Readable body font: Prompt (supports Thai + Latin)
const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-prompt",
  display: "swap",
});

// Cute display font for headings/logo: Mali, rounded handwriting, easy to read
const mali = Mali({
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-mali",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Photobooth — Cute photobooth on your phone",
  description:
    "A photobooth web app for phones and iPads: pick a template, count down and shoot, choose a filter tone, then download your strip. No signup, nothing stored on a server.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffdce9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${prompt.variable} ${mali.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
