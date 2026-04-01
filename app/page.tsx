"use client";

import { useState, useCallback, useRef, useEffect } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

type Phase =
  | "idle"
  | "ping"
  | "download"
  | "upload"
  | "complete";

interface Results {
  download: number;
  upload: number;
  ping: number;
  jitter: number;
}

// ─── Gauge Component ────────────────────────────────────────────────────────

function SpeedGauge({
  speed,
  maxSpeed,
  phase,
  label,
}: {
  speed: number;
  maxSpeed: number;
  phase: Phase;
  label: string;
}) {
  const radius = 140;
  const strokeWidth = 14;
  const center = 170;
  const startAngle = 135;
  const endAngle = 405;
  const totalAngle = endAngle - startAngle; // 270 degrees

  const circumference = 2 * Math.PI * radius;
  const arcLength = (totalAngle / 360) * circumference;

  const clampedSpeed = Math.min(speed, maxSpeed);
  const progress = maxSpeed > 0 ? clampedSpeed / maxSpeed : 0;
  const filledLength = arcLength * progress;
  const dashOffset = arcLength - filledLength;

  // Scale ticks
  const ticks = [];
  const tickCount = 10;
  for (let i = 0; i <= tickCount; i++) {
    const angle = startAngle + (totalAngle * i) / tickCount;
    const rad = (angle * Math.PI) / 180;
    const innerR = radius - 24;
    const outerR = radius - 12;
    const x1 = center + innerR * Math.cos(rad);
    const y1 = center + innerR * Math.sin(rad);
    const x2 = center + outerR * Math.cos(rad);
    const y2 = center + outerR * Math.sin(rad);

    const labelR = radius - 36;
    const lx = center + labelR * Math.cos(rad);
    const ly = center + labelR * Math.sin(rad);

    const tickValue = Math.round((maxSpeed * i) / tickCount);

    ticks.push(
      <g key={i}>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="rgba(148,163,184,0.3)"
          strokeWidth={i % 5 === 0 ? 2 : 1}
        />
        {i % 2 === 0 && (
          <text
            x={lx}
            y={ly}
            fill="rgba(148,163,184,0.5)"
            fontSize="11"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {tickValue}
          </text>
        )}
      </g>
    );
  }

  const isActive = phase !== "idle" && phase !== "complete";

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width="340"
        height="310"
        viewBox="0 0 340 310"
        className="drop-shadow-lg"
        style={{ maxWidth: "100%", height: "auto" }}
      >
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="30%" stopColor="#f59e0b" />
            <stop offset="60%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glowStrong">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Tick marks */}
        {ticks}

        {/* Background arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(30,41,59,0.8)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(${startAngle} ${center} ${center})`}
        />

        {/* Filled arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${filledLength} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(${startAngle} ${center} ${center})`}
          filter={isActive ? "url(#glow)" : undefined}
          style={{
            transition: "stroke-dasharray 0.15s ease-out",
          }}
        />

        {/* Center text */}
        <text
          x={center}
          y={center - 10}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#e2e8f0"
          fontSize="56"
          fontWeight="700"
          fontFamily="var(--font-inter), system-ui, sans-serif"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {speed < 10 ? speed.toFixed(2) : speed < 100 ? speed.toFixed(1) : Math.round(speed)}
        </text>
        <text
          x={center}
          y={center + 28}
          textAnchor="middle"
          fill="rgba(148,163,184,0.7)"
          fontSize="16"
          fontWeight="500"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}

// ─── Result Card ────────────────────────────────────────────────────────────

function ResultCard({
  icon,
  label,
  value,
  unit,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  delay: number;
}) {
  return (
    <div
      className="card-glow rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-5 text-center animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-2 text-[var(--color-accent)]">{icon}</div>
      <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">{label}</p>
      <p className="text-3xl font-bold tabular-nums text-white">{value}</p>
      <p className="text-sm text-slate-500">{unit}</p>
    </div>
  );
}

// ─── Icons (inline SVG) ────────────────────────────────────────────────────

function DownloadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function PingIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function JitterIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function Home() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [maxScale, setMaxScale] = useState(100);
  const [gaugeLabel, setGaugeLabel] = useState("Mbps");
  const [results, setResults] = useState<Results | null>(null);
  const [phaseText, setPhaseText] = useState("Ready to test");
  const abortRef = useRef<AbortController | null>(null);
  const runningRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // ── Ping Test ──
  const runPingTest = useCallback(async (signal: AbortSignal): Promise<{ ping: number; jitter: number }> => {
    const pings: number[] = [];
    const count = 20;

    for (let i = 0; i < count; i++) {
      if (signal.aborted) break;
      const start = performance.now();
      try {
        await fetch(`/api/ping?t=${Date.now()}`, {
          method: "GET",
          cache: "no-store",
          signal,
        });
        const rtt = performance.now() - start;
        pings.push(rtt);
        setCurrentSpeed(Math.round(rtt));
      } catch {
        // skip failed pings
      }
    }

    if (pings.length === 0) return { ping: 0, jitter: 0 };

    const avg = pings.reduce((a, b) => a + b, 0) / pings.length;
    let jitterSum = 0;
    for (let i = 1; i < pings.length; i++) {
      jitterSum += Math.abs(pings[i] - pings[i - 1]);
    }
    const jitter = pings.length > 1 ? jitterSum / (pings.length - 1) : 0;

    return { ping: Math.round(avg * 100) / 100, jitter: Math.round(jitter * 100) / 100 };
  }, []);

  // ── Download Test ──
  const runDownloadTest = useCallback(async (signal: AbortSignal): Promise<number> => {
    const STREAMS = 4;
    const DURATION = 10000;
    let totalBytes = 0;
    const startTime = performance.now();

    const updateInterval = setInterval(() => {
      const elapsed = (performance.now() - startTime) / 1000;
      if (elapsed > 0) {
        const mbps = (totalBytes * 8) / elapsed / 1_000_000;
        setCurrentSpeed(mbps);
        if (mbps > maxScale * 0.9) {
          setMaxScale((prev) => Math.max(prev, Math.ceil(mbps * 1.5 / 50) * 50));
        }
      }
    }, 100);

    const streamPromises = Array.from({ length: STREAMS }, async () => {
      try {
        const response = await fetch(`/api/download?t=${Date.now()}`, {
          cache: "no-store",
          signal,
        });
        if (!response.body) return;
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done || signal.aborted) break;
          totalBytes += value.byteLength;
          if (performance.now() - startTime > DURATION) {
            reader.cancel();
            break;
          }
        }
      } catch {
        // stream ended or aborted
      }
    });

    // Set a timeout to stop after DURATION
    const timer = setTimeout(() => {
      // streams will stop on their own via the DURATION check
    }, DURATION + 500);

    await Promise.all(streamPromises);
    clearTimeout(timer);
    clearInterval(updateInterval);

    const elapsed = (performance.now() - startTime) / 1000;
    return elapsed > 0 ? (totalBytes * 8) / elapsed / 1_000_000 : 0;
  }, [maxScale]);

  // ── Upload Test ──
  const runUploadTest = useCallback(async (signal: AbortSignal): Promise<number> => {
    const STREAMS = 4;
    const DURATION = 10000;
    let totalBytesSent = 0;
    const startTime = performance.now();

    const updateInterval = setInterval(() => {
      const elapsed = (performance.now() - startTime) / 1000;
      if (elapsed > 0) {
        const mbps = (totalBytesSent * 8) / elapsed / 1_000_000;
        setCurrentSpeed(mbps);
        if (mbps > maxScale * 0.9) {
          setMaxScale((prev) => Math.max(prev, Math.ceil(mbps * 1.5 / 50) * 50));
        }
      }
    }, 100);

    const chunkSize = 2 * 1024 * 1024; // 2MB per upload

    const streamPromises = Array.from({ length: STREAMS }, async () => {
      const loopStart = performance.now();
      while (performance.now() - loopStart < DURATION && !signal.aborted) {
        try {
          const blob = new Blob([new ArrayBuffer(chunkSize)]);
          const xhr = new XMLHttpRequest();
          const uploadPromise = new Promise<void>((resolve) => {
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                totalBytesSent = totalBytesSent; // no-op, we count on load
              }
            };
            xhr.onload = () => resolve();
            xhr.onerror = () => resolve();
            xhr.onabort = () => resolve();
          });

          xhr.open("POST", `/api/upload?t=${Date.now()}`, true);
          xhr.send(blob);

          if (signal.aborted) {
            xhr.abort();
            break;
          }

          // Listen for abort
          const abortHandler = () => xhr.abort();
          signal.addEventListener("abort", abortHandler, { once: true });

          await uploadPromise;
          signal.removeEventListener("abort", abortHandler);
          totalBytesSent += chunkSize;
        } catch {
          break;
        }
      }
    });

    await Promise.all(streamPromises);
    clearInterval(updateInterval);

    const elapsed = (performance.now() - startTime) / 1000;
    return elapsed > 0 ? (totalBytesSent * 8) / elapsed / 1_000_000 : 0;
  }, [maxScale]);

  // ── Run Full Test ──
  const startTest = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;

    const controller = new AbortController();
    abortRef.current = controller;

    setResults(null);
    setCurrentSpeed(0);
    setMaxScale(100);

    // Phase 1: Ping
    setPhase("ping");
    setPhaseText("Testing Ping...");
    setGaugeLabel("ms");
    const { ping, jitter } = await runPingTest(controller.signal);

    if (controller.signal.aborted) { runningRef.current = false; return; }

    // Phase 2: Download
    setPhase("download");
    setPhaseText("Testing Download...");
    setGaugeLabel("Mbps");
    setCurrentSpeed(0);
    const download = await runDownloadTest(controller.signal);

    if (controller.signal.aborted) { runningRef.current = false; return; }

    // Phase 3: Upload
    setPhase("upload");
    setPhaseText("Testing Upload...");
    setCurrentSpeed(0);
    const upload = await runUploadTest(controller.signal);

    // Done
    setPhase("complete");
    setPhaseText("Test Complete");
    setCurrentSpeed(0);
    setResults({
      download: Math.round(download * 100) / 100,
      upload: Math.round(upload * 100) / 100,
      ping,
      jitter,
    });
    runningRef.current = false;
  }, [runPingTest, runDownloadTest, runUploadTest]);

  const handleStart = () => {
    if (phase === "idle" || phase === "complete") {
      startTest();
    }
  };

  const handleCopyResults = () => {
    if (!results) return;
    const text = `Internet Speed Test Results (net.toollo.org)\nDownload: ${results.download} Mbps\nUpload: ${results.upload} Mbps\nPing: ${results.ping} ms\nJitter: ${results.jitter} ms`;
    navigator.clipboard.writeText(text);
  };

  const isIdle = phase === "idle";
  const isComplete = phase === "complete";
  const isTesting = !isIdle && !isComplete;

  return (
    <div className="relative z-10 flex flex-col items-center min-h-screen">
      {/* Header */}
      <header className="w-full py-5 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-white">
              Net <span className="text-cyan-400">Toollo</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">Internet Speed Test</p>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 pb-12">
        {/* Phase indicator */}
        <div className="mb-6">
          <div className="flex items-center gap-3 text-sm">
            {(["ping", "download", "upload"] as Phase[]).map((p, i) => {
              const isActive = phase === p;
              const isDone =
                (p === "ping" && (phase === "download" || phase === "upload" || phase === "complete")) ||
                (p === "download" && (phase === "upload" || phase === "complete")) ||
                (p === "upload" && phase === "complete");
              return (
                <div key={p} className="flex items-center gap-2">
                  {i > 0 && (
                    <div
                      className={`w-8 h-px ${isDone ? "bg-cyan-500" : "bg-slate-700"}`}
                    />
                  )}
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? "bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30"
                        : isDone
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-slate-800/50 text-slate-500"
                    }`}
                  >
                    {isDone && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {isActive && (
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                      </span>
                    )}
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gauge */}
        <div className="relative mb-2">
          {isTesting && (
            <SpeedGauge
              speed={currentSpeed}
              maxSpeed={phase === "ping" ? 200 : maxScale}
              phase={phase}
              label={gaugeLabel}
            />
          )}

          {(isIdle || isComplete) && !results && (
            <div className="flex flex-col items-center">
              {/* GO Button */}
              <button
                onClick={handleStart}
                className="relative group w-44 h-44 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
                aria-label="Start speed test"
              >
                {/* Pulse rings */}
                <span className="absolute inset-0 rounded-full bg-cyan-500/20 animate-pulse-ring" />
                <span className="absolute inset-2 rounded-full bg-cyan-500/10 animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
                {/* Button face */}
                <span className="relative z-10 w-36 h-36 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-shadow">
                  <span className="text-2xl font-bold text-white tracking-wider">GO</span>
                </span>
              </button>
              <p className="mt-6 text-slate-400 text-sm">{phaseText}</p>
            </div>
          )}

          {isComplete && results && (
            <div className="flex flex-col items-center">
              {/* Summary speed in center */}
              <div className="text-center mb-8">
                <p className="text-slate-400 text-sm mb-1">Download Speed</p>
                <p className="text-6xl font-bold tabular-nums text-white">
                  {results.download < 10
                    ? results.download.toFixed(2)
                    : results.download < 100
                    ? results.download.toFixed(1)
                    : Math.round(results.download)}
                </p>
                <p className="text-slate-500 text-lg">Mbps</p>
              </div>
            </div>
          )}
        </div>

        {/* Phase text during testing */}
        {isTesting && (
          <p className="text-cyan-400 text-sm font-medium mb-6">{phaseText}</p>
        )}

        {/* Results */}
        {isComplete && results && (
          <div className="w-full max-w-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <ResultCard
                icon={<DownloadIcon />}
                label="Download"
                value={
                  results.download < 10
                    ? results.download.toFixed(2)
                    : results.download < 100
                    ? results.download.toFixed(1)
                    : String(Math.round(results.download))
                }
                unit="Mbps"
                delay={0}
              />
              <ResultCard
                icon={<UploadIcon />}
                label="Upload"
                value={
                  results.upload < 10
                    ? results.upload.toFixed(2)
                    : results.upload < 100
                    ? results.upload.toFixed(1)
                    : String(Math.round(results.upload))
                }
                unit="Mbps"
                delay={100}
              />
              <ResultCard
                icon={<PingIcon />}
                label="Ping"
                value={String(results.ping)}
                unit="ms"
                delay={200}
              />
              <ResultCard
                icon={<JitterIcon />}
                label="Jitter"
                value={String(results.jitter)}
                unit="ms"
                delay={300}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  setPhase("idle");
                  setResults(null);
                  setCurrentSpeed(0);
                  setPhaseText("Ready to test");
                }}
                className="px-6 py-2.5 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 transition-colors cursor-pointer"
              >
                Test Again
              </button>
              <button
                onClick={handleCopyResults}
                className="px-6 py-2.5 rounded-full bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Share Results
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-6 border-t border-slate-800/50">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-slate-600">
          <p>&copy; {new Date().getFullYear()} Net Toollo. All rights reserved.</p>
          <p>Accurate speed measurement tool</p>
        </div>
      </footer>
    </div>
  );
}
