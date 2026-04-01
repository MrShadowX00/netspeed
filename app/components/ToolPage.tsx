import Link from "next/link";

interface ToolPageProps {
  title: string;
  description: string;
  children: React.ReactNode;
  faq?: { q: string; a: string }[];
  relatedTools?: { href: string; label: string; description: string }[];
}

export default function ToolPage({
  title,
  description,
  children,
  faq,
  relatedTools,
}: ToolPageProps) {
  // JSON-LD: WebApplication structured data
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    description,
    url: `https://net.toollo.org`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@type": "Organization",
      name: "Net Toollo",
      url: "https://net.toollo.org",
    },
  };

  // JSON-LD: FAQPage structured data
  const faqSchema = faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      }
    : null;

  return (
    <>
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Tool content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {children}
      </div>

      {/* FAQ Section */}
      {faq && faq.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faq.map((item, i) => (
              <details
                key={i}
                className="group rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <summary className="cursor-pointer text-sm font-medium text-white group-open:mb-3 list-none flex items-center justify-between">
                  {item.q}
                  <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Related Tools */}
      {relatedTools && relatedTools.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Related Tools
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-colors"
              >
                <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                  {tool.label}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
