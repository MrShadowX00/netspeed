import type { Metadata } from "next";
import PortCheckerClient from "./PortCheckerClient";

export const metadata: Metadata = {
  title: "Port Checker — Check If a Port Is Open Online",
  description:
    "Check if a specific port is open or closed on any server. Free online port checker with common port presets. No signup required.",
  alternates: { canonical: "https://net.toollo.org/port-checker" },
};

const faqData = [
  {
    question: "How do I check if a port is open?",
    answer:
      "Enter the hostname or IP address and the port number you want to check, then click 'Check Port'. Our tool will attempt to connect to the specified port and report whether it is Open, Closed, or Filtered/Timeout. You can also check multiple ports at once by entering comma-separated port numbers.",
  },
  {
    question: "What are the most common ports?",
    answer:
      "The most common ports include: HTTP (80), HTTPS (443), FTP (21), SSH (22), SMTP (25/587), DNS (53), POP3 (110), IMAP (143), MySQL (3306), PostgreSQL (5432), Redis (6379), MongoDB (27017), and RDP (3389). Each port is associated with a specific service or protocol.",
  },
  {
    question: "Why is my port closed?",
    answer:
      "A port may appear closed for several reasons: the service is not running on that port, a firewall is blocking the connection, the server is configured to reject connections on that port, or network address translation (NAT) is preventing external access. Check your firewall rules, ensure the service is running, and verify port forwarding settings if applicable.",
  },
];

export default function PortCheckerPage() {
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
      <PortCheckerClient faqData={faqData} />
    </>
  );
}
