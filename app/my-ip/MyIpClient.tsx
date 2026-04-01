"use client";

import { useState, useEffect, useCallback } from "react";

interface IpData {
  ip: string;
  version: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_name: string;
  country_code: string;
  continent_code: string;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  currency: string;
  isp: string;
  org: string;
  asn: string;
  languages: string;
}

function getFlag(countryCode: string): string {
  if (!countryCode) return "";
  const code = countryCode.toUpperCase();
  return String.fromCodePoint(
    ...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

function CopyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function RefreshIcon() {
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
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function SkeletonLine({ width = "w-full" }: { width?: string }) {
  return (
    <div
      className={`h-4 ${width} rounded bg-white/10 animate-pulse`}
    />
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
        className={`text-white text-sm font-medium ${
          mono ? "font-mono" : ""
        }`}
      >
        {value || "N/A"}
      </span>
    </div>
  );
}

export default function MyIpClient() {
  const [data, setData] = useState<IpData | null>(null);
  const [ipv6, setIpv6] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchIp = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const res = await fetch("https://ipapi.co/json/", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch IP data");
      const json = await res.json();
      setData(json);

      // Try to detect IPv6 separately
      try {
        const v6res = await fetch("https://api64.ipify.org?format=json", {
          cache: "no-store",
        });
        const v6json = await v6res.json();
        if (v6json.ip && v6json.ip.includes(":")) {
          setIpv6(v6json.ip);
        } else {
          setIpv6(null);
        }
      } catch {
        setIpv6(null);
      }
    } catch {
      setError("Could not detect your IP address. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIp();
  }, [fetchIp]);

  const handleCopy = () => {
    if (data?.ip) {
      navigator.clipboard.writeText(data.ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main IP Card */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
        {loading ? (
          <div className="space-y-4 flex flex-col items-center">
            <div className="h-5 w-40 rounded bg-white/10 animate-pulse" />
            <div className="h-12 w-72 rounded bg-white/10 animate-pulse" />
            <div className="h-4 w-32 rounded bg-white/10 animate-pulse" />
          </div>
        ) : error ? (
          <div className="text-red-400">
            <p className="mb-4">{error}</p>
            <button
              onClick={fetchIp}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg px-6 py-3 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : data ? (
          <>
            <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider">
              Your Public IP Address
            </p>
            <div className="flex items-center justify-center gap-3 mb-3">
              <p className="text-4xl sm:text-5xl font-bold text-white font-mono tabular-nums">
                {data.ip}
              </p>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-cyan-400 transition-colors cursor-pointer"
                title="Copy IP Address"
              >
                {copied ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <CopyIcon />
                )}
              </button>
            </div>
            <p className="text-slate-500 text-sm">
              {data.version === "IPv6" ? "IPv6" : "IPv4"} &middot;{" "}
              {data.isp}
            </p>
          </>
        ) : null}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center">
        <button
          onClick={fetchIp}
          disabled={loading}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg px-6 py-3 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshIcon />
          Refresh
        </button>
      </div>

      {/* Details Cards */}
      {!loading && data && (
        <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up">
          {/* Connection Details */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-4">
              Connection Details
            </h3>
            <InfoRow label="IPv4" value={data.version !== "IPv6" ? data.ip : "N/A"} mono />
            <InfoRow
              label="IPv6"
              value={ipv6 || (data.version === "IPv6" ? data.ip : "Not detected")}
              mono
            />
            <InfoRow label="ISP" value={data.isp} />
            <InfoRow label="Organization" value={data.org} />
            <InfoRow label="ASN" value={data.asn} />
          </div>

          {/* Location Details */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-4">
              Location Details
            </h3>
            <InfoRow
              label="Country"
              value={`${getFlag(data.country_code)} ${data.country_name}`}
            />
            <InfoRow label="Region" value={data.region} />
            <InfoRow label="City" value={data.city} />
            <InfoRow label="Postal Code" value={data.postal} />
            <InfoRow label="Timezone" value={data.timezone} />
            <InfoRow
              label="Coordinates"
              value={
                data.latitude && data.longitude
                  ? `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`
                  : "N/A"
              }
              mono
            />
          </div>

          {/* Map Placeholder */}
          <div className="md:col-span-2 rounded-xl bg-white/5 border border-white/10 p-6">
            <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-4">
              Approximate Location
            </h3>
            <div className="relative w-full h-48 rounded-lg bg-white/5 border border-white/5 overflow-hidden flex items-center justify-center">
              {data.latitude && data.longitude ? (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}#map=10/${data.latitude}/${data.longitude}`}
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
                    {data.city}, {data.region}, {data.country_name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)} —
                    Click to open map
                  </span>
                </a>
              ) : (
                <p className="text-slate-500 text-sm">
                  Location data not available
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading skeleton for details */}
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
    </div>
  );
}
