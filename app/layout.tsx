import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://net.toollo.org"),
  title: {
    default: "Net Toollo — Free Network & Internet Analysis Tools",
    template: "%s | Net Toollo",
  },
  description: "Free online network tools: Internet speed test, IP lookup, DNS checker, ping test, port scanner, subnet calculator and more. Fast, accurate, no signup required.",
  keywords: [
    "internet speed test", "speed test", "what is my ip", "my ip address",
    "ping test", "dns lookup", "ip lookup", "port checker", "subnet calculator",
    "bandwidth test", "network tools", "ip geolocation", "traceroute",
    "download speed test", "upload speed test", "wifi speed test",
    "broadband test", "fiber speed test", "connection speed",
    "net toollo", "network analyzer",
  ],
  openGraph: {
    title: "Net Toollo — Free Network & Internet Analysis Tools",
    description: "Speed test, IP lookup, DNS checker, ping test, port scanner — all free, fast, no signup.",
    url: "https://net.toollo.org",
    siteName: "Net Toollo",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Net Toollo — Free Network Tools",
    description: "Speed test, IP lookup, DNS checker & more",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" } },
  alternates: { canonical: "https://net.toollo.org" },
  verification: { google: "0LCEmavQtPu9bTfUcVgs4k4ZDKutv9tbz6Iav18HHMU" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#0a0e1a" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7668896830420502"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0a0e1a] text-gray-100 font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

// Header component inline
function Header() {
  const tools = [
    { href: "/", label: "Speed Test", emoji: "⚡" },
    { href: "/my-ip", label: "My IP", emoji: "🌐" },
    { href: "/ping", label: "Ping Test", emoji: "📡" },
    { href: "/dns-lookup", label: "DNS Lookup", emoji: "🔍" },
    { href: "/ip-lookup", label: "IP Lookup", emoji: "📍" },
    { href: "/port-checker", label: "Port Checker", emoji: "🔌" },
    { href: "/bandwidth-calculator", label: "Bandwidth Calc", emoji: "📊" },
    { href: "/subnet-calculator", label: "Subnet Calc", emoji: "🧮" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0e1a]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-cyan-400">Net</span>
          <span className="text-xl font-bold text-white">Toollo</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
          {tools.map((t) => (
            <Link key={t.href} href={t.href} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap">
              <span className="mr-1">{t.emoji}</span>{t.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

// Footer with SEO internal links
function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0e1a] mt-16">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Speed Tests</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-white transition-colors">Internet Speed Test</Link></li>
              <li><Link href="/bandwidth-calculator" className="hover:text-white transition-colors">Bandwidth Calculator</Link></li>
              <li><Link href="/ping" className="hover:text-white transition-colors">Ping Test</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">IP Tools</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/my-ip" className="hover:text-white transition-colors">What Is My IP</Link></li>
              <li><Link href="/ip-lookup" className="hover:text-white transition-colors">IP Geolocation</Link></li>
              <li><Link href="/subnet-calculator" className="hover:text-white transition-colors">Subnet Calculator</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Network Tools</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/dns-lookup" className="hover:text-white transition-colors">DNS Lookup</Link></li>
              <li><Link href="/port-checker" className="hover:text-white transition-colors">Port Checker</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">About</h3>
            <p className="text-sm text-gray-500">Net Toollo — Free network analysis tools. No signup, fast & accurate.</p>
            <p className="text-sm text-gray-500 mt-2">Part of <a href="https://toollo.org" className="text-cyan-400 hover:text-cyan-300">Toollo.org</a></p>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} Net Toollo. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-gray-600">
            <a href="https://toollo.org/privacy" className="hover:text-white">Privacy</a>
            <a href="https://toollo.org/terms" className="hover:text-white">Terms</a>
            <Link href="/sitemap.xml" className="hover:text-white">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
