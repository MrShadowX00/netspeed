import type { Metadata } from "next";
import IpLookupClient from "./IpLookupClient";

export const metadata: Metadata = {
  title: "IP Lookup — IP Geolocation & ISP Checker",
  description:
    "Look up any IP address to find its geolocation, ISP, organization, and network details. Free IP lookup tool — no signup required.",
  alternates: { canonical: "https://net.toollo.org/ip-lookup" },
  openGraph: {
    title: "IP Lookup — IP Geolocation & ISP Checker",
    description:
      "Look up any IP address to find its geolocation, ISP, organization, and network details.",
    url: "https://net.toollo.org/ip-lookup",
    siteName: "Net Toollo",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const faqItems = [
  {
    question: "How do I look up an IP address?",
    answer:
      "Simply enter any IPv4 or IPv6 address into the search field above and click Lookup. Our tool queries a geolocation database and returns the IP's approximate location, ISP, organization, ASN, and more — all for free.",
  },
  {
    question: "Is IP lookup legal?",
    answer:
      "Yes, looking up publicly available IP geolocation data is legal in most jurisdictions. IP addresses are not considered personal data on their own in many countries, and geolocation databases use publicly available routing information. However, using IP data for harassment or stalking is illegal.",
  },
  {
    question: "How accurate is IP geolocation?",
    answer:
      "IP geolocation is typically accurate to the city level (about 50-80% of the time) and very accurate at the country level (95-99%). It cannot pinpoint an exact street address. Accuracy varies by region and ISP — urban areas tend to have better accuracy than rural ones.",
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

export default function IpLookupPage() {
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
            IP Geolocation Lookup
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 pb-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            IP <span className="text-cyan-400">Geolocation</span> Lookup
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Enter any IP address to find its location, ISP, organization, and
            network details. Supports both IPv4 and IPv6.
          </p>
        </div>

        {/* Client interactive component */}
        <IpLookupClient />

        {/* SEO Content */}
        <section className="mt-16 max-w-3xl mx-auto space-y-10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              What Is IP Geolocation Lookup?
            </h2>
            <p className="text-slate-400 leading-relaxed">
              IP geolocation lookup is the process of determining the
              geographic location of an internet-connected device using its IP
              address. This technique maps an IP to a physical location —
              typically a city, region, and country — along with network
              information like the ISP, organization, and Autonomous System
              Number (ASN). It is widely used for content localization, fraud
              detection, analytics, and cybersecurity.
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
                  href: "/my-ip",
                  title: "My IP",
                  desc: "Find your own IP address",
                },
                {
                  href: "#",
                  title: "DNS Lookup",
                  desc: "Query DNS records",
                },
                {
                  href: "#",
                  title: "Port Checker",
                  desc: "Check open ports",
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
          <p>Free IP Geolocation Lookup</p>
        </div>
      </footer>
    </div>
  );
}
