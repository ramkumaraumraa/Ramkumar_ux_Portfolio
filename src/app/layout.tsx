import type { Metadata } from "next";
import { Source_Sans_3, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
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
  title: "Ramkumar Ganesh — Senior Product Designer & UX Lead",
  description: "Senior Product Designer & UX Lead based in Chennai, India. 12+ years in SaaS. Open to global remote (USD) and relocation to UK, Netherlands, Ireland, Switzerland, New Zealand, & Australia.",
  keywords: [
    "Senior Product Designer", "UX Design Lead", "Lead UX Designer",
    "UX Design Manager", "Design Director", "UX Architect", "VP of UX",
    "UX Designer Chennai", "Product Designer Chennai", "Global Remote UX Designer",
    "B2B SaaS UX Designer", "Design Systems Expert", "Product Designer India",
    "Toyota Connected UX", "UX Leadership", "Figma", "WCAG Accessibility",
    "Relocate to UK", "Relocate to Europe", "Relocate to Australia", "Relocate to New Zealand",
  ],
  authors: [{ name: "Ramkumar Ganesh", url: "https://www.ramkumarux.com" }],
  creator: "Ramkumar Ganesh",
  metadataBase: new URL("https://www.ramkumarux.com"),
  alternates: { canonical: "https://www.ramkumarux.com" },
  openGraph: {
    title: "Ramkumar Ganesh — Senior Product Designer & UX Lead",
    description: "Senior Product Designer based in Chennai. 12+ years SaaS UX. Open to global remote roles & relocation to UK, EU, and ANZ.",
    url: "https://www.ramkumarux.com",
    siteName: "Ramkumar Ganesh — UX Portfolio",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Ramkumar Ganesh — Senior Product Designer & UX Lead" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ramkumar Ganesh — Senior Product Designer & UX Lead",
    description: "Senior Product Designer based in Chennai. 12+ years SaaS UX. Open to global remote roles & relocation to UK, EU, and ANZ.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

const personSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Ramkumar Ganesh",
  jobTitle: "Senior Product Designer & UX Design Lead",
  description: "Senior Product Designer and Design Lead based in Chennai, India with 12+ years experience. Open to global remote opportunities (USD) and willing to relocate to the UK, Netherlands, Ireland, Switzerland, New Zealand, and Australia.",
  url: "https://www.ramkumarux.com",
  email: "ramkumargd01@gmail.com",
  sameAs: [
    "https://www.linkedin.com/in/ramkumarux/",
    "https://www.instagram.com/ramkumargd01/",
    "https://adplist.org/mentors/ramkumar-g"
  ],
  image: "https://www.ramkumarux.com/assets/imgs/About/My%20Pic%201.png",
  address: { "@type": "PostalAddress", addressLocality: "Chennai", addressCountry: "IN" },
  worksFor: { "@type": "Organization", name: "Toyota Connected India" },
  knowsAbout: [
    "Product Design", "UX Design", "Design Systems", "User Research",
    "B2B SaaS", "B2C SaaS", "Information Architecture", "Interaction Design",
    "Design Leadership", "Figma", "WCAG Accessibility", "Design Thinking",
    "Stakeholder Management", "Design Strategy", "UX Architecture",
    "Cross-functional Collaboration", "OKRs", "Service Design",
  ],
  hasOccupation: {
    "@type": "Occupation",
    name: "Senior Product Designer",
    occupationLocation: { "@type": "Country", name: "India" },
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sourceSans3.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link href="https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://use.typekit.net/pwm3hft.css" />
        {/* JSON-LD structured data — rendered as raw text in SSR, safe static content */}
        <script type="application/ld+json" suppressHydrationWarning>
          {personSchema}
        </script>
      </head>
      <body className="antialiased min-h-screen">
        <div id="nebula-bg"></div>
        {children}
        <Script strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-534725075" />
        <Script strategy="afterInteractive" src="/gtag.js" />
      </body>
    </html>
  );
}
