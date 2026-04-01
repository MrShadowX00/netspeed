"use client";

import { useState, useEffect, useCallback } from "react";
import { initAnalytics, trackPageView } from "../firebase";

interface LookupResult {
  ip: string;
  version: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_name: string;
  country_code: string;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  isp: string;
  org: string;
  asn: string;
  network: string;
  error?: boolean;
  reason?: string;
}

interface HistoryEntry {
  ip: string;
  country: string;
  country_code: string;
  city: string;
  isp: string;
  timestamp: number;
}

function getFlag(countryCode: string): string {
  if (!countryCode) return "";
  const code = countryCode.toUpperCase();
  return String.fromCodePoint(
    ...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span
        className={`text-white text-sm font-medium text-right max-w-[60%] break-all ${
          mono ? "font-mono" : ""
        }`}
      >
        {value || "N/A"}
      </span>
    </div>
  );
}

function SkeletonLine({ width = "w-full" }: { width?: string }) {
  return (
    <div
      className={`h-4 ${width} rounded bg-white/10 animate-pulse`}
    />
  );
}

export default function IpLookupClient() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => { initAnalytics(); trackPageView("/ip-lookup"); }, []);

  // Fetch user's own IP on load to pre-fill
  useEffect(() => {
    async function fetchOwnIp() {
      try {
        const res = await fetch("https://api.ipify.org?format=json", {
          cache: "no-store",
        });
        const json = await res.json();
        if (json.ip) {
          setInput(json.ip);
        }
      } catch {
        // silently fail
      } finally {
        setInitialLoading(false);
      }
    }
    fetchOwnIp();
  }, []);

  const isValidIp = (ip: string): boolean => {
    // Basic IPv4 check
    const v4 =
      /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(ip.trim());
    // Basic IPv6 check
    const v6 = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/.test(ip.trim());
    return v4 || v6;
  };

  const lookupIp = useCallback(
    async (ip?: string) => {
      const target = (ip || input).trim();
      if (!target) {
        setError("Please enter an IP address.");
        return;
      }
      if (!isValidIp(target)) {
        setError("Please enter a valid IPv4 or IPv6 address.");
        return;
      }

      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const res = await fetch(`https://ipapi.co/${target}/json/`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Lookup failed");
        const json: LookupResult = await res.json();

        if (json.error) {
          setError(json.reason || "Invalid IP address or lookup failed.");
          setLoading(false);
          return;
        }

        setResult(json);

        // Add to history (max 10, no duplicates)
        setHistory((prev) => {
          const filtered = prev.filter((h) => h.ip !== json.ip);
          return [
            {
              ip: json.ip,
              country: json.country_name,
              country_code: json.country_code,
              city: json.city,
              isp: json.isp,
              timestamp: Date.now(),
            },
            ...filtered,
          ].slice(0, 10);
        });
      } catch {
        setError("Failed to look up this IP address. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [input]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupIp();
  };

  const handleHistoryClick = (ip: string) => {
    setInput(ip);
    lookupIp(ip);
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={initialLoading ? "Detecting your IP..." : "Enter an IP address (e.g. 8.8.8.8)"}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors font-mono"
            disabled={initialLoading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || initialLoading}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg px-6 py-3 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <SearchIcon />
          Lookup
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid md:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4"
            >
              <SkeletonLine width="w-32" />
              <SkeletonLine />
              <SkeletonLine />
              <SkeletonLine width="w-3/4" />
              <SkeletonLine />
              <SkeletonLine width="w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && result && (
        <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up">
          {/* Network Info */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-4">
              Network Information
            </h3>
            <InfoRow label="IP Address" value={result.ip} mono />
            <InfoRow label="Version" value={result.version || (result.ip.includes(":") ? "IPv6" : "IPv4")} />
            <InfoRow label="ISP" value={result.isp} />
            <InfoRow label="Organization" value={result.org} />
            <InfoRow label="ASN" value={result.asn} />
            <InfoRow label="Network" value={result.network} mono />
          </div>

          {/* Location Info */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-4">
              Geolocation
            </h3>
            <InfoRow
              label="Country"
              value={`${getFlag(result.country_code)} ${result.country_name}`}
            />
            <InfoRow label="Region" value={result.region} />
            <InfoRow label="City" value={result.city} />
            <InfoRow label="Postal Code" value={result.postal} />
            <InfoRow label="Timezone" value={result.timezone} />
            <InfoRow
              label="Coordinates"
              value={
                result.latitude && result.longitude
                  ? `${result.latitude.toFixed(4)}, ${result.longitude.toFixed(4)}`
                  : "N/A"
              }
              mono
            />
          </div>

          {/* Map placeholder */}
          <div className="md:col-span-2 rounded-xl bg-white/5 border border-white/10 p-6">
            <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-4">
              Location on Map
            </h3>
            <div className="relative w-full h-48 rounded-lg bg-white/5 border border-white/5 overflow-hidden flex items-center justify-center">
              {result.latitude && result.longitude ? (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${result.latitude}&mlon=${result.longitude}#map=10/${result.latitude}/${result.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-sm font-medium">
                    {result.city}
                    {result.region ? `, ${result.region}` : ""}
                    {result.country_name ? `, ${result.country_name}` : ""}
                  </span>
                  <span className="text-xs text-slate-500">
                    {result.latitude.toFixed(4)}, {result.longitude.toFixed(4)}{" "}
                    — Click to open map
                  </span>
                </a>
              ) : (
                <p className="text-slate-500 text-sm">
                  Location data not available for this IP
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lookup History */}
      {history.length > 0 && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-4">
            Recent Lookups
          </h3>
          <div className="space-y-2">
            {history.map((entry) => (
              <button
                key={entry.ip + entry.timestamp}
                onClick={() => handleHistoryClick(entry.ip)}
                className="w-full flex items-center justify-between py-2.5 px-4 rounded-lg hover:bg-white/5 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-white font-mono text-sm">
                    {entry.ip}
                  </span>
                  <span className="text-slate-500 text-xs hidden sm:inline">
                    {entry.isp}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">
                    {getFlag(entry.country_code)} {entry.city || entry.country}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-slate-600"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
