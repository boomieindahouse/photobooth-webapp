import type { Metadata, Viewport } from "next";
import {
  Caveat,
  Dancing_Script,
  Indie_Flower,
  Itim,
  Kalam,
  Mali,
  Patrick_Hand,
  Prompt,
  Shadows_Into_Light,
} from "next/font/google";
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

// ฟอนต์สำหรับข้อความโพลารอยด์ (Google Fonts, 8 แบบ)
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-caveat",
  display: "swap",
});
const kalam = Kalam({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-kalam",
  display: "swap",
});
const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-patrick-hand",
  display: "swap",
});
const shadowsIntoLight = Shadows_Into_Light({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-shadows",
  display: "swap",
});
const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-dancing",
  display: "swap",
});
const indieFlower = Indie_Flower({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-indie",
  display: "swap",
});
const itim = Itim({
  subsets: ["thai", "latin"],
  weight: ["400"],
  variable: "--font-itim",
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
    <html
      lang="en"
      className={`${prompt.variable} ${mali.variable} ${caveat.variable} ${kalam.variable} ${patrickHand.variable} ${shadowsIntoLight.variable} ${dancingScript.variable} ${indieFlower.variable} ${itim.variable}`}
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
