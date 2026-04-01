import type { Metadata } from "next";
import DnsClient from "./DnsClient";

export const metadata: Metadata = {
  title: "DNS Lookup — Check DNS Records Online Free",
  description:
    "Look up DNS records for any domain. Check A, AAAA, CNAME, MX, NS, TXT, SOA records. Free online DNS lookup tool.",
  alternates: { canonical: "https://net.toollo.org/dns-lookup" },
};

const faqData = [
  {
    question: "What is DNS and how does it work?",
    answer:
      "DNS (Domain Name System) is the internet's phone book. It translates human-readable domain names like example.com into IP addresses like 93.184.216.34 that computers use to communicate. When you type a URL in your browser, your device sends a query to a DNS resolver, which looks up the corresponding IP address through a hierarchy of DNS servers (root, TLD, and authoritative nameservers) and returns the result so your browser can connect.",
  },
  {
    question: "How do I check DNS records for a domain?",
    answer:
      "Use this free DNS Lookup tool: enter a domain name, select the record type (A, AAAA, CNAME, MX, NS, TXT, SOA, or ALL), and click Lookup. The tool queries Google's public DNS-over-HTTPS API and displays all matching records with their TTL values. You can also use command-line tools like nslookup, dig, or host on your computer.",
  },
  {
    question: "What are the different DNS record types?",
    answer:
      "Common DNS record types include: A (maps domain to IPv4 address), AAAA (maps domain to IPv6 address), CNAME (alias pointing to another domain), MX (mail server records), NS (nameserver records), TXT (text records used for verification, SPF, DKIM), and SOA (Start of Authority with zone administration info). Each type serves a specific purpose in DNS resolution and domain configuration.",
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

export default function DnsLookupPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          DNS Lookup
        </h1>
        <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
          Look up DNS records for any domain. Check A, AAAA, CNAME, MX, NS,
          TXT, and SOA records using Google Public DNS.
        </p>

        <DnsClient />

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
              { href: "/ping", label: "Ping Test", emoji: "📡", desc: "Check latency & packet loss" },
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
