import type { Metadata } from "next";
import PingClient from "./PingClient";

export const metadata: Metadata = {
  title: "Ping Test — Check Latency & Packet Loss Online",
  description:
    "Test your network ping, latency, and jitter to any server. Free online ping test with real-time results graph. No signup required.",
  alternates: { canonical: "https://net.toollo.org/ping" },
};

const faqData = [
  {
    question: "What is a good ping speed?",
    answer:
      "A good ping speed is under 50ms for general browsing and under 20ms for online gaming. Ping under 100ms is acceptable for most activities. Anything above 150ms may cause noticeable lag in real-time applications like video calls and competitive gaming.",
  },
  {
    question: "How do I reduce my ping?",
    answer:
      "To reduce ping: 1) Use a wired Ethernet connection instead of WiFi, 2) Close background applications using bandwidth, 3) Choose game/service servers closer to your location, 4) Restart your router, 5) Upgrade to a faster internet plan, 6) Use a gaming VPN or change DNS servers, 7) Disable VPN if not needed.",
  },
  {
    question: "What causes high ping?",
    answer:
      "High ping is caused by: network congestion, long physical distance to the server, WiFi interference, outdated router firmware, ISP throttling, background downloads, too many connected devices, faulty network hardware, or server-side issues. Peak usage hours can also temporarily increase ping.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqData.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function PingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Ping Test
        </h1>
        <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
          Test your network latency, jitter, and packet loss with a real-time
          ping graph. Monitor connection stability to any server.
        </p>

        <PingClient />

        {/* FAQ Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqData.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 p-5"
              >
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Tools */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-white mb-4">
            Related Tools
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { href: "/", label: "Speed Test", emoji: "⚡", desc: "Test download & upload speed" },
              { href: "/dns-lookup", label: "DNS Lookup", emoji: "🔍", desc: "Check DNS records for any domain" },
              { href: "/my-ip", label: "My IP Address", emoji: "🌐", desc: "Find your public IP" },
              { href: "/ip-lookup", label: "IP Lookup", emoji: "📍", desc: "Geolocate any IP address" },
              { href: "/port-checker", label: "Port Checker", emoji: "🔌", desc: "Check if ports are open" },
            ].map((t) => (
              <a
                key={t.href}
                href={t.href}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors"
              >
                <span className="text-xl">{t.emoji}</span>
                <div>
                  <p className="text-sm font-medium text-white">{t.label}</p>
                  <p className="text-xs text-gray-500">{t.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
