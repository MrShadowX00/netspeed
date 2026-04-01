"use client";

import { useState, useEffect } from "react";
import { initAnalytics, trackPageView } from "../firebase";
import Link from "next/link";

// ─── Helpers ────────────────────────────────────────────────────────────────

const FILE_UNITS: Record<string, number> = {
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
};

const SPEED_UNITS: Record<string, number> = {
  Kbps: 1_000,
  Mbps: 1_000_000,
  Gbps: 1_000_000_000,
};

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "--";
  if (seconds < 1) return `${Math.round(seconds * 1000)} ms`;
  if (seconds < 60) return `${seconds.toFixed(1)} seconds`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m} min ${s} sec`;
  }
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    return `${h} hr ${m} min`;
  }
  const d = Math.floor(seconds / 86400);
  const h = Math.round((seconds % 86400) / 3600);
  return `${d} day${d > 1 ? "s" : ""} ${h} hr`;
}

// ─── Streaming data ────────────────────────────────────────────────────────

const STREAMING = [
  { label: "Music streaming (high quality)", mbps: 0.32 },
  { label: "SD video (480p)", mbps: 3 },
  { label: "HD video (720p)", mbps: 5 },
  { label: "Full HD video (1080p)", mbps: 8 },
  { label: "4K video (2160p)", mbps: 25 },
  { label: "8K video (4320p)", mbps: 50 },
  { label: "Video call (standard)", mbps: 2 },
  { label: "HD video call", mbps: 4 },
  { label: "Online gaming", mbps: 6 },
];

const COMPARISON_SPEEDS = [
  { label: "10 Mbps", bps: 10_000_000 },
  { label: "50 Mbps", bps: 50_000_000 },
  { label: "100 Mbps", bps: 100_000_000 },
  { label: "500 Mbps", bps: 500_000_000 },
  { label: "1 Gbps", bps: 1_000_000_000 },
];

// ─── Component ──────────────────────────────────────────────────────────────

interface FaqItem {
  question: string;
  answer: string;
}

export default function BandwidthCalculatorClient({
  faqData,
}: {
  faqData: FaqItem[];
}) {
  const [mode, setMode] = useState<"download" | "converter" | "streaming">(
    "download"
  );

  // Download time state
  const [fileSize, setFileSize] = useState("1");
  const [fileUnit, setFileUnit] = useState("GB");
  const [speed, setSpeed] = useState("100");
  const [speedUnit, setSpeedUnit] = useState("Mbps");

  useEffect(() => { initAnalytics(); trackPageView("/bandwidth-calculator"); }, []);

  // Converter state
  const [convValue, setConvValue] = useState("100");
  const [convUnit, setConvUnit] = useState("Mbps");

  // Streaming state
  const [userSpeed, setUserSpeed] = useState("100");

  // ── Download calculations ──
  const fileSizeBytes =
    parseFloat(fileSize) * (FILE_UNITS[fileUnit] || 1);
  const speedBps =
    parseFloat(speed) * (SPEED_UNITS[speedUnit] || 1);
  const downloadSeconds =
    speedBps > 0 ? (fileSizeBytes * 8) / speedBps : Infinity;

  // ── Converter calculations ──
  const convBps =
    parseFloat(convValue) *
    (SPEED_UNITS[convUnit] ||
      (convUnit === "Bytes/s"
        ? 8
        : convUnit === "KB/s"
        ? 8 * 1024
        : convUnit === "MB/s"
        ? 8 * 1024 * 1024
        : convUnit === "GB/s"
        ? 8 * 1024 * 1024 * 1024
        : convUnit === "bits/s"
        ? 1
        : 1));

  const conversions = [
    { label: "bits/s", value: convBps },
    { label: "Kbps", value: convBps / 1_000 },
    { label: "Mbps", value: convBps / 1_000_000 },
    { label: "Gbps", value: convBps / 1_000_000_000 },
    { label: "Bytes/s", value: convBps / 8 },
    { label: "KB/s", value: convBps / 8 / 1024 },
    { label: "MB/s", value: convBps / 8 / (1024 * 1024) },
    { label: "GB/s", value: convBps / 8 / (1024 * 1024 * 1024) },
  ];

  // ── Streaming calculations ──
  const userSpeedMbps = parseFloat(userSpeed) || 0;

  const tabs = [
    { id: "download" as const, label: "Download Time" },
    { id: "converter" as const, label: "Bandwidth Converter" },
    { id: "streaming" as const, label: "Streaming Needs" },
  ];

  function formatNum(n: number): string {
    if (!isFinite(n) || isNaN(n)) return "--";
    if (n >= 1_000_000) return n.toExponential(2);
    if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
    if (n >= 1) return n.toFixed(2);
    if (n >= 0.001) return n.toFixed(4);
    return n.toExponential(2);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Bandwidth <span className="text-cyan-400">Calculator</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Calculate download time, convert bandwidth units, and check streaming
          requirements.
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 mb-6 rounded-lg bg-white/5 p-1 border border-white/10">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setMode(t.id)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              mode === t.id
                ? "bg-cyan-500 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Mode 1: Download Time */}
      {mode === "download" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  File Size
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    min="0"
                    step="any"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                  <select
                    value={fileUnit}
                    onChange={(e) => setFileUnit(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    {Object.keys(FILE_UNITS).map((u) => (
                      <option key={u} value={u} className="bg-[#0a0e1a]">
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Connection Speed
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={speed}
                    onChange={(e) => setSpeed(e.target.value)}
                    min="0"
                    step="any"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                  <select
                    value={speedUnit}
                    onChange={(e) => setSpeedUnit(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    {Object.keys(SPEED_UNITS).map((u) => (
                      <option key={u} value={u} className="bg-[#0a0e1a]">
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="mt-6 text-center rounded-xl bg-white/5 border border-white/10 p-6">
              <p className="text-gray-400 text-sm mb-1">Estimated Download Time</p>
              <p className="text-3xl font-bold text-cyan-400">
                {formatTime(downloadSeconds)}
              </p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Download Time at Different Speeds
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-3 text-gray-400 font-medium">
                      Speed
                    </th>
                    <th className="text-left py-3 px-3 text-gray-400 font-medium">
                      Download Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_SPEEDS.map((s, i) => {
                    const time =
                      s.bps > 0 ? (fileSizeBytes * 8) / s.bps : Infinity;
                    return (
                      <tr
                        key={s.label}
                        className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}
                      >
                        <td className="py-2.5 px-3 text-white">{s.label}</td>
                        <td className="py-2.5 px-3 text-cyan-400 font-mono">
                          {formatTime(time)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Bandwidth Converter */}
      {mode === "converter" && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex gap-2 mb-6">
            <input
              type="number"
              value={convValue}
              onChange={(e) => setConvValue(e.target.value)}
              min="0"
              step="any"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            <select
              value={convUnit}
              onChange={(e) => setConvUnit(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              {[
                "bits/s",
                "Kbps",
                "Mbps",
                "Gbps",
                "Bytes/s",
                "KB/s",
                "MB/s",
                "GB/s",
              ].map((u) => (
                <option key={u} value={u} className="bg-[#0a0e1a]">
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {conversions.map((c) => (
              <div
                key={c.label}
                className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                  c.label === convUnit
                    ? "border-cyan-500/40 bg-cyan-500/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <span className="text-gray-400 text-sm">{c.label}</span>
                <span className="text-white font-mono font-semibold">
                  {formatNum(c.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode 3: Streaming Requirements */}
      {mode === "streaming" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <label className="block text-sm text-gray-400 mb-1">
              Your Connection Speed (Mbps)
            </label>
            <input
              type="number"
              value={userSpeed}
              onChange={(e) => setUserSpeed(e.target.value)}
              min="0"
              step="any"
              className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Streaming Requirements
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-3 text-gray-400 font-medium">
                      Activity
                    </th>
                    <th className="text-left py-3 px-3 text-gray-400 font-medium">
                      Required
                    </th>
                    <th className="text-left py-3 px-3 text-gray-400 font-medium">
                      Simultaneous Streams
                    </th>
                    <th className="text-left py-3 px-3 text-gray-400 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {STREAMING.map((s, i) => {
                    const streams =
                      userSpeedMbps > 0
                        ? Math.floor(userSpeedMbps / s.mbps)
                        : 0;
                    const ok = userSpeedMbps >= s.mbps;
                    return (
                      <tr
                        key={s.label}
                        className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}
                      >
                        <td className="py-2.5 px-3 text-white">{s.label}</td>
                        <td className="py-2.5 px-3 text-cyan-400 font-mono">
                          {s.mbps} Mbps
                        </td>
                        <td className="py-2.5 px-3 text-white font-mono">
                          {streams}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              ok
                                ? "text-emerald-400 bg-emerald-400/10"
                                : "text-red-400 bg-red-400/10"
                            }`}
                          >
                            {ok ? "Supported" : "Insufficient"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mt-10 mb-10">
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
            { href: "/port-checker", label: "Port Checker", emoji: "🔌" },
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
