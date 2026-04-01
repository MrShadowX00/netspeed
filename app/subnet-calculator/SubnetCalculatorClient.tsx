"use client";

import { useState, useMemo, useEffect } from "react";
import { initAnalytics, trackPageView } from "../firebase";
import Link from "next/link";

// ─── Binary math helpers ────────────────────────────────────────────────────

function ipToInt(ip: string): number {
  const parts = ip.split(".").map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function intToIp(n: number): string {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ].join(".");
}

function prefixToMask(prefix: number): number {
  if (prefix === 0) return 0;
  return (0xffffffff << (32 - prefix)) >>> 0;
}

function intToBinary(n: number): string {
  return [
    ((n >>> 24) & 0xff).toString(2).padStart(8, "0"),
    ((n >>> 16) & 0xff).toString(2).padStart(8, "0"),
    ((n >>> 8) & 0xff).toString(2).padStart(8, "0"),
    (n & 0xff).toString(2).padStart(8, "0"),
  ].join(".");
}

function isValidIp(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    const n = parseInt(p, 10);
    return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p;
  });
}

function getIpClass(firstOctet: number): string {
  if (firstOctet < 128) return "A";
  if (firstOctet < 192) return "B";
  if (firstOctet < 224) return "C";
  if (firstOctet < 240) return "D";
  return "E";
}

function isPrivateIp(ip: number): boolean {
  const first = (ip >>> 24) & 0xff;
  const second = (ip >>> 16) & 0xff;
  // 10.0.0.0/8
  if (first === 10) return true;
  // 172.16.0.0/12
  if (first === 172 && second >= 16 && second <= 31) return true;
  // 192.168.0.0/16
  if (first === 192 && second === 168) return true;
  return false;
}

// ─── CIDR reference data ────────────────────────────────────────────────────

const CIDR_TABLE = Array.from({ length: 25 }, (_, i) => {
  const prefix = i + 8;
  const mask = prefixToMask(prefix);
  const totalHosts = Math.pow(2, 32 - prefix);
  const usableHosts = prefix <= 30 ? totalHosts - 2 : prefix === 31 ? 2 : 1;
  return {
    prefix,
    mask: intToIp(mask),
    totalHosts,
    usableHosts: Math.max(usableHosts, 0),
  };
});

// ─── Component ──────────────────────────────────────────────────────────────

interface FaqItem {
  question: string;
  answer: string;
}

export default function SubnetCalculatorClient({
  faqData,
}: {
  faqData: FaqItem[];
}) {
  const [ipInput, setIpInput] = useState("192.168.1.0");
  const [prefix, setPrefix] = useState(24);
  const [calculated, setCalculated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { initAnalytics(); trackPageView("/subnet-calculator"); }, []);

  // Converter state
  const [convPrefix, setConvPrefix] = useState(24);

  const result = useMemo(() => {
    if (!calculated || !isValidIp(ipInput)) return null;

    const ipInt = ipToInt(ipInput);
    const mask = prefixToMask(prefix);
    const wildcard = (~mask) >>> 0;
    const network = (ipInt & mask) >>> 0;
    const broadcast = (network | wildcard) >>> 0;
    const totalHosts = Math.pow(2, 32 - prefix);
    const usableHosts = prefix <= 30 ? totalHosts - 2 : prefix === 31 ? 2 : 1;
    const firstHost = prefix <= 30 ? (network + 1) >>> 0 : network;
    const lastHost = prefix <= 30 ? (broadcast - 1) >>> 0 : prefix === 31 ? (network + 1) >>> 0 : network;
    const firstOctet = (ipInt >>> 24) & 0xff;

    return {
      network: intToIp(network),
      broadcast: intToIp(broadcast),
      firstHost: intToIp(firstHost),
      lastHost: intToIp(lastHost),
      totalHosts,
      usableHosts: Math.max(usableHosts, 0),
      mask: intToIp(mask),
      wildcard: intToIp(wildcard),
      binaryMask: intToBinary(mask),
      ipClass: getIpClass(firstOctet),
      isPrivate: isPrivateIp(ipInt),
      cidr: `${intToIp(network)}/${prefix}`,
    };
  }, [ipInput, prefix, calculated]);

  const handleCalculate = () => {
    if (!isValidIp(ipInput)) {
      setError("Please enter a valid IPv4 address (e.g. 192.168.1.0)");
      setCalculated(false);
      return;
    }
    setError("");
    setCalculated(true);
  };

  const convMask = intToIp(prefixToMask(convPrefix));
  const convWildcard = intToIp((~prefixToMask(convPrefix)) >>> 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Subnet <span className="text-cyan-400">Calculator</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Calculate IP subnets, network ranges, CIDR notation, broadcast
          addresses, and available hosts.
        </p>
      </div>

      {/* Input Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              IP Address
            </label>
            <input
              type="text"
              value={ipInput}
              onChange={(e) => {
                setIpInput(e.target.value);
                setCalculated(false);
              }}
              placeholder="e.g. 192.168.1.0"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono"
              onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              CIDR Prefix
            </label>
            <select
              value={prefix}
              onChange={(e) => {
                setPrefix(Number(e.target.value));
                setCalculated(false);
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              {Array.from({ length: 25 }, (_, i) => i + 8).map((p) => (
                <option key={p} value={p} className="bg-[#0a0e1a]">
                  /{p} ({intToIp(prefixToMask(p))})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleCalculate}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white font-semibold transition-colors cursor-pointer"
            >
              Calculate
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-10 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-white mb-4">
            Results for {result.cidr}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Network Address", value: result.network },
              { label: "Broadcast Address", value: result.broadcast },
              { label: "First Usable Host", value: result.firstHost },
              { label: "Last Usable Host", value: result.lastHost },
              {
                label: "Total Hosts",
                value: result.totalHosts.toLocaleString(),
              },
              {
                label: "Usable Hosts",
                value: result.usableHosts.toLocaleString(),
              },
              { label: "Subnet Mask", value: result.mask },
              { label: "Wildcard Mask", value: result.wildcard },
              { label: "Binary Subnet Mask", value: result.binaryMask },
              { label: "IP Class", value: `Class ${result.ipClass}` },
              {
                label: "Address Type",
                value: result.isPrivate ? "Private" : "Public",
              },
              { label: "CIDR Notation", value: result.cidr },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
              >
                <span className="text-gray-400 text-sm">{item.label}</span>
                <span className="text-white font-mono text-sm font-semibold">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subnet Mask <-> CIDR Converter */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">
          Subnet Mask / CIDR Converter
        </h2>
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">
            Select CIDR prefix:
          </label>
          <input
            type="range"
            min={8}
            max={32}
            value={convPrefix}
            onChange={(e) => setConvPrefix(Number(e.target.value))}
            className="w-full accent-cyan-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>/8</span>
            <span>/16</span>
            <span>/24</span>
            <span>/32</span>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center">
            <p className="text-gray-400 text-xs mb-1">CIDR</p>
            <p className="text-white font-mono font-semibold text-lg">
              /{convPrefix}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center">
            <p className="text-gray-400 text-xs mb-1">Subnet Mask</p>
            <p className="text-white font-mono font-semibold text-lg">
              {convMask}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center">
            <p className="text-gray-400 text-xs mb-1">Wildcard</p>
            <p className="text-white font-mono font-semibold text-lg">
              {convWildcard}
            </p>
          </div>
        </div>
      </div>

      {/* CIDR Reference Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">
          CIDR Reference Table
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-3 text-gray-400 font-medium">
                  Prefix
                </th>
                <th className="text-left py-3 px-3 text-gray-400 font-medium">
                  Subnet Mask
                </th>
                <th className="text-right py-3 px-3 text-gray-400 font-medium">
                  Total IPs
                </th>
                <th className="text-right py-3 px-3 text-gray-400 font-medium">
                  Usable Hosts
                </th>
              </tr>
            </thead>
            <tbody>
              {CIDR_TABLE.map((row, i) => (
                <tr
                  key={row.prefix}
                  className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""} ${row.prefix === prefix && calculated ? "bg-cyan-500/10" : ""}`}
                >
                  <td className="py-2.5 px-3 font-mono text-cyan-400">
                    /{row.prefix}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-white">
                    {row.mask}
                  </td>
                  <td className="py-2.5 px-3 text-right text-gray-300 font-mono">
                    {row.totalHosts.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-gray-300 font-mono">
                    {row.usableHosts.toLocaleString()}
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
            { href: "/my-ip", label: "What Is My IP", emoji: "🌐" },
            { href: "/ip-lookup", label: "IP Lookup", emoji: "📍" },
            { href: "/port-checker", label: "Port Checker", emoji: "🔌" },
            { href: "/bandwidth-calculator", label: "Bandwidth Calculator", emoji: "📊" },
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
