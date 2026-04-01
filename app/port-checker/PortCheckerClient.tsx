"use client";

import { useState, useEffect } from "react";
import { initAnalytics, trackPageView } from "../firebase";
import Link from "next/link";

interface PortResult {
  port: number;
  status: "open" | "closed" | "filtered" | "checking";
}

const COMMON_PORTS = [
  { label: "HTTP", port: 80 },
  { label: "HTTPS", port: 443 },
  { label: "FTP", port: 21 },
  { label: "SSH", port: 22 },
  { label: "SMTP", port: 25 },
  { label: "SMTP-TLS", port: 587 },
  { label: "POP3", port: 110 },
  { label: "IMAP", port: 143 },
  { label: "MySQL", port: 3306 },
  { label: "PostgreSQL", port: 5432 },
  { label: "Redis", port: 6379 },
  { label: "MongoDB", port: 27017 },
  { label: "DNS", port: 53 },
  { label: "RDP", port: 3389 },
];

const PORT_REFERENCE = [
  { port: 20, service: "FTP Data", description: "File Transfer Protocol data transfer" },
  { port: 21, service: "FTP Control", description: "File Transfer Protocol command control" },
  { port: 22, service: "SSH", description: "Secure Shell remote access" },
  { port: 23, service: "Telnet", description: "Unencrypted remote access (deprecated)" },
  { port: 25, service: "SMTP", description: "Simple Mail Transfer Protocol" },
  { port: 53, service: "DNS", description: "Domain Name System queries" },
  { port: 80, service: "HTTP", description: "Hypertext Transfer Protocol (web)" },
  { port: 110, service: "POP3", description: "Post Office Protocol v3 (email)" },
  { port: 143, service: "IMAP", description: "Internet Message Access Protocol (email)" },
  { port: 443, service: "HTTPS", description: "HTTP Secure (encrypted web)" },
  { port: 465, service: "SMTPS", description: "SMTP over SSL" },
  { port: 587, service: "SMTP-TLS", description: "SMTP with STARTTLS" },
  { port: 993, service: "IMAPS", description: "IMAP over SSL" },
  { port: 995, service: "POP3S", description: "POP3 over SSL" },
  { port: 3306, service: "MySQL", description: "MySQL database server" },
  { port: 3389, service: "RDP", description: "Remote Desktop Protocol" },
  { port: 5432, service: "PostgreSQL", description: "PostgreSQL database server" },
  { port: 6379, service: "Redis", description: "Redis in-memory data store" },
  { port: 8080, service: "HTTP Alt", description: "Alternative HTTP port" },
  { port: 27017, service: "MongoDB", description: "MongoDB database server" },
];

async function checkPort(host: string, port: number): Promise<"open" | "closed" | "filtered"> {
  try {
    const res = await fetch(`/api/check-port?host=${encodeURIComponent(host)}&port=${port}`, {
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    return data.status || "closed";
  } catch {
    return "filtered";
  }
}

interface FaqItem {
  question: string;
  answer: string;
}

export default function PortCheckerClient({ faqData }: { faqData: FaqItem[] }) {
  const [host, setHost] = useState("");
  const [portInput, setPortInput] = useState("");
  const [results, setResults] = useState<PortResult[]>([]);
  const [checking, setChecking] = useState(false);

  useEffect(() => { initAnalytics(); trackPageView("/port-checker"); }, []);

  const handleCheck = async () => {
    const h = host.trim();
    if (!h) return;

    const ports = portInput
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n >= 1 && n <= 65535);

    if (ports.length === 0) return;

    setChecking(true);
    setResults(ports.map((p) => ({ port: p, status: "checking" })));

    const newResults: PortResult[] = [];
    await Promise.all(
      ports.map(async (port) => {
        const status = await checkPort(h, port);
        newResults.push({ port, status });
        setResults((prev) =>
          prev.map((r) => (r.port === port ? { ...r, status } : r))
        );
      })
    );

    setChecking(false);
  };

  const handlePreset = (port: number) => {
    setPortInput((prev) => {
      const existing = prev
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (existing.includes(String(port))) return prev;
      return existing.length > 0 ? `${prev}, ${port}` : String(port);
    });
  };

  const statusColor = (s: PortResult["status"]) => {
    switch (s) {
      case "open":
        return "text-emerald-400 bg-emerald-400/10";
      case "closed":
        return "text-red-400 bg-red-400/10";
      case "filtered":
        return "text-yellow-400 bg-yellow-400/10";
      case "checking":
        return "text-cyan-400 bg-cyan-400/10";
    }
  };

  const statusLabel = (s: PortResult["status"]) => {
    switch (s) {
      case "open":
        return "Open";
      case "closed":
        return "Closed";
      case "filtered":
        return "Filtered / Timeout";
      case "checking":
        return "Checking...";
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Port <span className="text-cyan-400">Checker</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Check if a specific port is open or closed on any server. Use preset
          buttons for common ports or enter custom port numbers.
        </p>
      </div>

      {/* Input Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Hostname / IP Address
            </label>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="e.g. google.com or 8.8.8.8"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Port(s) — comma separated
            </label>
            <input
              type="text"
              value={portInput}
              onChange={(e) => setPortInput(e.target.value)}
              placeholder="e.g. 80, 443, 22"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleCheck}
              disabled={checking}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold transition-colors cursor-pointer"
            >
              {checking ? "Checking..." : "Check Port"}
            </button>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">Quick presets:</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_PORTS.map((p) => (
              <button
                key={p.port}
                onClick={() => handlePreset(p.port)}
                className="px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors cursor-pointer"
              >
                {p.label} ({p.port})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">Results</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r) => (
              <div
                key={r.port}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
              >
                <div>
                  <span className="text-white font-mono font-semibold">
                    :{r.port}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">
                    {COMMON_PORTS.find((p) => p.port === r.port)?.label ||
                      PORT_REFERENCE.find((p) => p.port === r.port)?.service ||
                      ""}
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(r.status)}`}
                >
                  {r.status === "checking" ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      Checking
                    </span>
                  ) : (
                    statusLabel(r.status)
                  )}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Note: Browser-based port checking has limitations. Firewalls and
            CORS policies may affect results. For the most accurate results, use
            a server-side tool like <code>nmap</code> or <code>telnet</code>.
          </p>
        </div>
      )}

      {/* Common Ports Reference Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">
          Common Ports Reference
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-3 text-gray-400 font-medium">
                  Port
                </th>
                <th className="text-left py-3 px-3 text-gray-400 font-medium">
                  Service
                </th>
                <th className="text-left py-3 px-3 text-gray-400 font-medium">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {PORT_REFERENCE.map((p, i) => (
                <tr
                  key={p.port}
                  className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}
                >
                  <td className="py-2.5 px-3 font-mono text-cyan-400">
                    {p.port}
                  </td>
                  <td className="py-2.5 px-3 text-white">{p.service}</td>
                  <td className="py-2.5 px-3 text-gray-400">
                    {p.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqData.map((f, i) => (
            <div key={i}>
              <h3 className="text-white font-medium mb-2">{f.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {f.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Related Tools
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/", label: "Speed Test", emoji: "⚡" },
            { href: "/ping", label: "Ping Test", emoji: "📡" },
            { href: "/dns-lookup", label: "DNS Lookup", emoji: "🔍" },
            { href: "/subnet-calculator", label: "Subnet Calculator", emoji: "🧮" },
          ].map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
            >
              <span>{t.emoji}</span>
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
