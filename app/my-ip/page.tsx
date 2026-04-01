import type { Metadata } from "next";
import MyIpClient from "./MyIpClient";

export const metadata: Metadata = {
  title: "What Is My IP Address — Free IP Checker",
  description:
    "Find your public IP address instantly. See your IPv4, IPv6, location, and connection details. Free, fast, no signup required.",
  alternates: { canonical: "https://net.toollo.org/my-ip" },
  openGraph: {
    title: "What Is My IP Address — Free IP Checker",
    description:
      "Find your public IP address instantly. See your IPv4, IPv6, ISP, location, and connection details.",
    url: "https://net.toollo.org/my-ip",
    siteName: "Net Toollo",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const faqItems = [
  {
    question: "What is my public IP address?",
    answer:
      "Your public IP address is the unique identifier assigned to your device by your Internet Service Provider (ISP). It is visible to every website and service you connect to online. Use the tool above to see yours instantly.",
  },
  {
    question: "What is the difference between IPv4 and IPv6?",
    answer:
      "IPv4 addresses use a 32-bit format (e.g. 192.168.1.1) and are the most common type. IPv6 uses a 128-bit format (e.g. 2001:0db8::1) to support the growing number of internet-connected devices. Many networks now support both.",
  },
  {
    question: "Can someone find my location from my IP?",
    answer:
      "An IP address reveals your approximate location — usually city or region level — but not your exact street address. Websites, advertisers, and law enforcement can use IP geolocation databases to estimate where you are.",
  },
  {
    question: "How do I hide my IP address?",
    answer:
      "You can hide your IP address by using a VPN (Virtual Private Network), the Tor browser, or a proxy server. A VPN is the most popular and user-friendly option, encrypting your traffic and masking your real IP.",
  },
  {
    question: "Why does my IP address change?",
    answer:
      "Most ISPs assign dynamic IP addresses that change periodically — when your router restarts or your DHCP lease expires. If you need a fixed IP, you can request a static IP from your provider, usually for an extra fee.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function MyIpPage() {
  return (
    <div className="relative z-10 flex flex-col items-center min-h-screen">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="w-full py-5 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-white">
              Net <span className="text-cyan-400">Toollo</span>
            </span>
          </a>
          <p className="text-xs text-slate-500 hidden sm:block">
            What Is My IP Address
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 pb-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            What Is My <span className="text-cyan-400">IP Address</span>?
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Instantly detect your public IP address, ISP, location, and
            connection details. No signup required.
          </p>
        </div>

        {/* Client interactive component */}
        <MyIpClient />

        {/* SEO Content */}
        <section className="mt-16 max-w-3xl mx-auto space-y-10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              How to Find Your IP Address
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Your IP address is automatically detected when you visit this
              page. We query a geolocation API to retrieve your public IPv4 (and
              IPv6 if available), your ISP, approximate location, timezone, and
              coordinates. Simply open this page — no downloads, plugins, or
              signups needed.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              What Is an IP Address?
            </h2>
            <p className="text-slate-400 leading-relaxed">
              An IP (Internet Protocol) address is a numerical label assigned to
              every device connected to a computer network that uses the
              Internet Protocol for communication. It serves two main purposes:
              identifying the host or network interface, and providing the
              location of the host in the network. There are two versions in
              use today — IPv4 (e.g. 203.0.113.1) and IPv6 (e.g.
              2001:db8::1).
            </p>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqItems.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-xl bg-white/5 border border-white/10 overflow-hidden"
                >
                  <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-white font-medium hover:bg-white/5 transition-colors">
                    {item.question}
                    <svg
                      className="w-5 h-5 text-slate-500 group-open:rotate-180 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="px-6 pb-4 text-slate-400 leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Related Tools */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Related Tools
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  href: "/",
                  title: "Speed Test",
                  desc: "Test your internet speed",
                },
                {
                  href: "/ip-lookup",
                  title: "IP Lookup",
                  desc: "Look up any IP address",
                },
                {
                  href: "#",
                  title: "DNS Lookup",
                  desc: "Query DNS records",
                },
              ].map((tool) => (
                <a
                  key={tool.title}
                  href={tool.href}
                  className="rounded-xl bg-white/5 border border-white/10 p-5 hover:bg-white/10 transition-colors block"
                >
                  <p className="text-cyan-400 font-semibold mb-1">
                    {tool.title}
                  </p>
                  <p className="text-slate-500 text-sm">{tool.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-6 border-t border-slate-800/50">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-slate-600">
          <p>&copy; {new Date().getFullYear()} Net Toollo. All rights reserved.</p>
          <p>Free IP Address Checker</p>
        </div>
      </footer>
    </div>
  );
}
