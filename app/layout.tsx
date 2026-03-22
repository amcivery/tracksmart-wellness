import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.title,
    template: "%s | TrackSmart Wellness",
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
  },
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/"),
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  verification: {
    google: "tQ0yRB5RbusdLpNt9IvmfroV26VGt8XKNgFu_BG5B-E",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rootSchema = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      url: absoluteUrl("/"),
      description: siteConfig.description,
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.organization.name,
      url: absoluteUrl("/"),
      description: siteConfig.organization.description,
      logo: absoluteUrl(siteConfig.organization.logo),
      sameAs: siteConfig.organization.sameAs,
    },
  ];

  return (
    <html lang="en" className="dark">
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-04TGL3EVR8"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-04TGL3EVR8');
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Script
          id="tracksmart-root-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
