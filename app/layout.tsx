import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Internet Speed Test — Check Your Connection Speed | Net Toollo",
  description:
    "Free online internet speed test. Accurately measure your download speed, upload speed, ping, and jitter. Test your broadband, fiber, or mobile connection in seconds.",
  keywords: [
    "internet speed test",
    "speed test",
    "bandwidth test",
    "download speed",
    "upload speed",
    "ping test",
    "jitter test",
    "broadband speed",
    "connection speed",
    "network test",
  ],
  openGraph: {
    title: "Internet Speed Test | Net Toollo",
    description:
      "Test your internet connection speed instantly. Measure download, upload, ping, and jitter with our free speed test tool.",
    url: "https://net.toollo.org",
    siteName: "Net Toollo",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://net.toollo.org"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7668896830420502"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
