import type { Metadata } from "next";
import { Source_Sans_3, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sourceSans3 = Source_Sans_3({
  variable: "--font-source-sans-3",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ramkumar - Expert in UX Leadership & Design Strategy",
  description: "Discover the expertise of Ram Kumar, a seasoned UX leader with over a decade of experience in driving user-centric design and innovation.",
  openGraph: {
    title: "Ram Kumar - Expert in UX Leadership, Design Strategy, and Innovation | Portfolio",
    description: "Explore the strategic design work of Ram Kumar, a UX leader with extensive experience in transforming digital experiences.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sourceSans3.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://use.typekit.net/pwm3hft.css" />
      </head>
      <body className="antialiased min-h-screen">
        <div id="nebula-bg"></div>
        {children}
      </body>
    </html>
  );
}
