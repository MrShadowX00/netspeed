"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { initAnalytics, trackPageView } from "../firebase";

interface PingResult {
  seq: number;
  ms: number | null; // null = timeout/loss
  timestamp: number;
}

interface Stats {
  sent: number;
  received: number;
  min: number;
  avg: number;
  max: number;
  jitter: number;
  loss: number;
}

function computeStats(results: PingResult[]): Stats {
  const sent = results.length;
  const successful = results.filter((r) => r.ms !== null);
  const received = successful.length;
  const times = successful.map((r) => r.ms!);

  if (times.length === 0) {
    return { sent, received: 0, min: 0, avg: 0, max: 0, jitter: 0, loss: sent > 0 ? 100 : 0 };
  }

  const min = Math.min(...times);
  const max = Math.max(...times);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;

  let jitterSum = 0;
  for (let i = 1; i < times.length; i++) {
    jitterSum += Math.abs(times[i] - times[i - 1]);
  }
  const jitter = times.length > 1 ? jitterSum / (times.length - 1) : 0;
  const loss = sent > 0 ? ((sent - received) / sent) * 100 : 0;

  return { sent, received, min, avg, max, jitter, loss };
}

// ─── SVG Line Chart ────────────────────────────────────────────────────────

function PingChart({ data }: { data: PingResult[] }) {
  const last50 = data.slice(-50);
  if (last50.length === 0) return null;

  const W = 700;
  const H = 250;
  const PAD = { top: 20, right: 20, bottom: 30, left: 55 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const validTimes = last50.filter((r) => r.ms !== null).map((r) => r.ms!);
  if (validTimes.length === 0) return null;

  const yMin = 0;
  const rawMax = Math.max(...validTimes);
  const yMax = Math.max(rawMax * 1.2, 10);

  const highThreshold = Math.max(rawMax * 0.75, validTimes.reduce((a, b) => a + b, 0) / validTimes.length * 2);

  const xStep = last50.length > 1 ? chartW / (last50.length - 1) : chartW;

  // Grid lines (horizontal)
  const gridLines: number[] = [];
  const gridCount = 5;
  for (let i = 0; i <= gridCount; i++) {
    gridLines.push(yMin + ((yMax - yMin) * i) / gridCount);
  }

  // Build line path
  const points: { x: number; y: number; ms: number | null; seq: number }[] = [];
  last50.forEach((r, i) => {
    const x = PAD.left + (last50.length > 1 ? i * xStep : chartW / 2);
    const y =
      r.ms !== null
        ? PAD.top + chartH - ((r.ms - yMin) / (yMax - yMin)) * chartH
        : PAD.top + chartH;
    points.push({ x, y, ms: r.ms, seq: r.seq });
  });

  const validPoints = points.filter((p) => p.ms !== null);
  let linePath = "";
  validPoints.forEach((p, i) => {
    linePath += i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`;
  });

  // Area fill path
  let areaPath = "";
  if (validPoints.length > 0) {
    areaPath = linePath + ` L ${validPoints[validPoints.length - 1].x} ${PAD.top + chartH} L ${validPoints[0].x} ${PAD.top + chartH} Z`;
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: 400 }}
      >
        {/* Grid */}
        {gridLines.map((val, i) => {
          const y = PAD.top + chartH - ((val - yMin) / (yMax - yMin)) * chartH;
          return (
            <g key={i}>
              <line
                x1={PAD.left}
                y1={y}
                x2={W - PAD.right}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={y + 4}
                textAnchor="end"
                fill="rgba(148,163,184,0.5)"
                fontSize="11"
              >
                {Math.round(val)}ms
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {last50.length > 1 &&
          [0, Math.floor(last50.length / 4), Math.floor(last50.length / 2), Math.floor((3 * last50.length) / 4), last50.length - 1]
            .filter((v, i, a) => a.indexOf(v) === i)
            .map((idx) => (
              <text
                key={idx}
                x={PAD.left + idx * xStep}
                y={H - 8}
                textAnchor="middle"
                fill="rgba(148,163,184,0.5)"
                fontSize="11"
              >
                #{last50[idx].seq}
              </text>
            ))}

        {/* Area fill */}
        {areaPath && (
          <path
            d={areaPath}
            fill="url(#areaGrad)"
            opacity={0.3}
          />
        )}

        {/* Line */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#22d3ee"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Dots — red for high pings */}
        {points.map((p, i) =>
          p.ms !== null ? (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={p.ms > highThreshold ? 4 : 2.5}
              fill={p.ms > highThreshold ? "#ef4444" : "#22d3ee"}
              stroke={p.ms > highThreshold ? "#ef4444" : "none"}
              strokeWidth={p.ms > highThreshold ? 1 : 0}
              opacity={0.9}
            />
          ) : (
            <circle
              key={i}
              cx={p.x}
              cy={PAD.top + chartH}
              r={3}
              fill="#ef4444"
              opacity={0.6}
            />
          )
        )}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// ─── Stat Box ──────────────────────────────────────────────────────────────

function StatBox({ label, value, unit, accent }: { label: string; value: string; unit: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center">
      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${accent ? "text-cyan-400" : "text-white"}`}>
        {value}
      </p>
      <p className="text-xs text-gray-500">{unit}</p>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function PingClient() {
  const [target, setTarget] = useState("");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<PingResult[]>([]);
  const [stopped, setStopped] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const seqRef = useRef(0);

  useEffect(() => { initAnalytics(); trackPageView("/ping"); }, []);

  const doPing = useCallback(async (signal: AbortSignal): Promise<PingResult> => {
    seqRef.current += 1;
    const seq = seqRef.current;
    const start = performance.now();
    try {
      const url = target.trim()
        ? `/api/ping?target=${encodeURIComponent(target.trim())}&t=${Date.now()}`
        : `/api/ping?t=${Date.now()}`;
      await fetch(url, { method: "GET", cache: "no-store", signal });
      const ms = performance.now() - start;
      return { seq, ms: Math.round(ms * 100) / 100, timestamp: Date.now() };
    } catch {
      if (signal.aborted) throw new Error("aborted");
      return { seq, ms: null, timestamp: Date.now() };
    }
  }, [target]);

  const startPing = useCallback(async () => {
    setRunning(true);
    setStopped(false);
    setResults([]);
    seqRef.current = 0;

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      while (!controller.signal.aborted) {
        const result = await doPing(controller.signal);
        setResults((prev) => [...prev, result]);
        // Wait ~1s between pings
        await new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, 1000);
          controller.signal.addEventListener("abort", () => {
            clearTimeout(timer);
            resolve();
          }, { once: true });
        });
      }
    } catch {
      // aborted
    }

    setRunning(false);
    setStopped(true);
  }, [doPing]);

  const stopPing = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  const stats = computeStats(results);

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Target (leave empty for this server)"
          disabled={running}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors disabled:opacity-50"
        />
        {!running ? (
          <button
            onClick={startPing}
            className="px-6 py-3 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            Start Ping
          </button>
        ) : (
          <button
            onClick={stopPing}
            className="px-6 py-3 rounded-lg bg-red-500/80 text-white font-semibold hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            Stop
          </button>
        )}
      </div>

      {/* Live Stats */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatBox label="Pings Sent" value={String(stats.sent)} unit="packets" />
          <StatBox
            label="Current"
            value={results[results.length - 1].ms !== null ? results[results.length - 1].ms!.toFixed(1) : "---"}
            unit="ms"
            accent
          />
          <StatBox label="Min" value={stats.min.toFixed(1)} unit="ms" />
          <StatBox label="Avg" value={stats.avg.toFixed(1)} unit="ms" />
          <StatBox label="Max" value={stats.max.toFixed(1)} unit="ms" />
          <StatBox label="Jitter" value={stats.jitter.toFixed(1)} unit="ms" />
        </div>
      )}

      {/* Packet Loss Bar */}
      {results.length > 0 && (
        <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Packet Loss</span>
            <span className={`text-sm font-bold ${stats.loss > 5 ? "text-red-400" : stats.loss > 0 ? "text-yellow-400" : "text-green-400"}`}>
              {stats.loss.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${stats.loss > 5 ? "bg-red-500" : stats.loss > 0 ? "bg-yellow-500" : "bg-green-500"}`}
              style={{ width: `${Math.max(100 - stats.loss, 0)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>{stats.received} received</span>
            <span>{stats.sent - stats.received} lost</span>
          </div>
        </div>
      )}

      {/* Chart */}
      {results.length > 1 && <PingChart data={results} />}

      {/* Summary after stopping */}
      {stopped && results.length > 0 && (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-5">
          <h3 className="text-lg font-semibold text-cyan-400 mb-3">
            Ping Test Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Packets Sent</p>
              <p className="text-white font-bold text-lg">{stats.sent}</p>
            </div>
            <div>
              <p className="text-gray-500">Packets Received</p>
              <p className="text-white font-bold text-lg">{stats.received}</p>
            </div>
            <div>
              <p className="text-gray-500">Packet Loss</p>
              <p className={`font-bold text-lg ${stats.loss > 0 ? "text-red-400" : "text-green-400"}`}>
                {stats.loss.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-gray-500">Avg Latency</p>
              <p className="text-cyan-400 font-bold text-lg">{stats.avg.toFixed(1)} ms</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
            <div>
              <p className="text-gray-500">Min</p>
              <p className="text-white font-semibold">{stats.min.toFixed(1)} ms</p>
            </div>
            <div>
              <p className="text-gray-500">Max</p>
              <p className="text-white font-semibold">{stats.max.toFixed(1)} ms</p>
            </div>
            <div>
              <p className="text-gray-500">Jitter</p>
              <p className="text-white font-semibold">{stats.jitter.toFixed(1)} ms</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
