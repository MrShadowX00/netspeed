import type { Metadata } from "next";
import SubnetCalculatorClient from "./SubnetCalculatorClient";

export const metadata: Metadata = {
  title: "Subnet Calculator — IP Subnet & CIDR Calculator",
  description:
    "Calculate IP subnets, network ranges, CIDR notation, broadcast addresses, and available hosts. Free online subnet calculator.",
  alternates: { canonical: "https://net.toollo.org/subnet-calculator" },
};

const faqData = [
  {
    question: "What is a subnet mask?",
    answer:
      "A subnet mask is a 32-bit number that divides an IP address into the network portion and the host portion. It uses consecutive 1-bits to mark the network part and 0-bits for the host part. For example, 255.255.255.0 (/24) means the first 24 bits are the network address and the last 8 bits identify individual hosts, allowing up to 254 usable host addresses.",
  },
  {
    question: "How do I calculate the number of hosts in a subnet?",
    answer:
      "The formula is 2^(32 - prefix length) - 2. You subtract 2 because the first address is reserved for the network address and the last for the broadcast address. For example, a /24 subnet has 2^8 - 2 = 254 usable hosts. A /30 subnet has 2^2 - 2 = 2 usable hosts, commonly used for point-to-point links.",
  },
  {
    question: "What is CIDR notation?",
    answer:
      "CIDR (Classless Inter-Domain Routing) notation represents an IP address and its subnet mask in a compact format: IP/prefix. The prefix number indicates how many leading bits of the address are the network part. For example, 192.168.1.0/24 means the first 24 bits define the network, equivalent to a subnet mask of 255.255.255.0. CIDR replaced the older classful addressing system.",
  },
];

export default function SubnetCalculatorPage() {
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
      <SubnetCalculatorClient faqData={faqData} />
    </>
  );
}
