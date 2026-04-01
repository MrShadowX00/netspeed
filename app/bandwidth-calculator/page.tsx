import type { Metadata } from "next";
import BandwidthCalculatorClient from "./BandwidthCalculatorClient";

export const metadata: Metadata = {
  title: "Bandwidth Calculator — Calculate Download & Transfer Time",
  description:
    "Calculate download time, file transfer duration, and bandwidth needs. Convert between Mbps, Gbps, MB/s. Free bandwidth calculator.",
  alternates: { canonical: "https://net.toollo.org/bandwidth-calculator" },
};

const faqData = [
  {
    question: "How do I calculate download time?",
    answer:
      "To calculate download time, divide the file size (in bits) by your connection speed (in bits per second). For example, a 1 GB file on a 100 Mbps connection: 1 GB = 8,000 Mb, so 8,000 / 100 = 80 seconds. Our calculator handles all the unit conversions automatically — just enter the file size and your speed.",
  },
  {
    question: "What is the difference between Mbps and MB/s?",
    answer:
      "Mbps (megabits per second) measures network speed in bits, while MB/s (megabytes per second) measures data transfer in bytes. Since 1 byte = 8 bits, divide Mbps by 8 to get MB/s. For example, 100 Mbps = 12.5 MB/s. ISPs advertise in Mbps, while file downloads often show MB/s.",
  },
  {
    question: "How much bandwidth do I need for streaming?",
    answer:
      "Bandwidth needs depend on quality: SD video requires about 3 Mbps, HD (720p) needs 5 Mbps, Full HD (1080p) needs 8 Mbps, 4K needs 25 Mbps, and 8K needs 50 Mbps. For a household with multiple simultaneous streams, add the requirements together. A 100 Mbps connection can support about 4 simultaneous 4K streams.",
  },
];

export default function BandwidthCalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqData.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }),
        }}
      />
      <BandwidthCalculatorClient faqData={faqData} />
    </>
  );
}
