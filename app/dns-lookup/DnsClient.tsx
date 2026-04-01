"use client";

import { useState, useCallback } from "react";

const RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "NS", "TXT", "SOA", "ALL"] as const;
type RecordType = (typeof RECORD_TYPES)[number];

// Map DNS type numbers to names
const TYPE_MAP: Record<number, string> = {
  1: "A",
  2: "NS",
  5: "CNAME",
  6: "SOA",
  15: "MX",
  16: "TXT",
  28: "AAAA",
};

// Colors for record types
const TYPE_COLORS: Record<string, string> = {
  A: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  AAAA: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  CNAME: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  MX: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  NS: "text-green-400 bg-green-400/10 border-green-400/20",
  TXT: "text-pink-400 bg-pink-400/10 border-pink-400/20",
  SOA: "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

interface DnsRecord {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface LookupResult {
  domain: string;
  type: string;
  records: DnsRecord[];
  time: number;
  timestamp: number;
}

interface HistoryEntry {
  domain: string;
  type: string;
  recordCount: number;
  timestamp: number;
}

export default function DnsClient() {
  const [domain, setDomain] = useState("");
  const [recordType, setRecordType] = useState<RecordType>("A");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const lookup = useCallback(
    async (queryDomain?: string, queryType?: RecordType) => {
      const d = (queryDomain ?? domain).trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      const t = queryType ?? recordType;

      if (!d) {
        setError("Please enter a domain name.");
        return;
      }

      setLoading(true);
      setError(null);
      setResult(null);

      const startTime = performance.now();

      try {
        let allRecords: DnsRecord[] = [];

        if (t === "ALL") {
          // Query multiple types
          const types = ["A", "AAAA", "CNAME", "MX", "NS", "TXT", "SOA"];
          const responses = await Promise.allSettled(
            types.map((rt) =>
              fetch(
                `https://dns.google/resolve?name=${encodeURIComponent(d)}&type=${rt}`
              ).then((r) => r.json())
            )
          );
          for (const resp of responses) {
            if (resp.status === "fulfilled" && resp.value.Answer) {
              allRecords = allRecords.concat(resp.value.Answer);
            }
          }
        } else {
          const resp = await fetch(
            `https://dns.google/resolve?name=${encodeURIComponent(d)}&type=${t}`
          );
          const data = await resp.json();
          if (data.Answer) {
            allRecords = data.Answer;
          } else if (data.Status !== 0) {
            setError(
              `DNS query returned status ${data.Status}. The domain may not exist or have no ${t} records.`
            );
            setLoading(false);
            return;
          }
        }

        const elapsed = Math.round(performance.now() - startTime);

        // Deduplicate
        const seen = new Set<string>();
        const unique = allRecords.filter((r) => {
          const key = `${r.name}-${r.type}-${r.data}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        const lookupResult: LookupResult = {
          domain: d,
          type: t,
          records: unique,
          time: elapsed,
          timestamp: Date.now(),
        };

        setResult(lookupResult);
        setHistory((prev) => [
          { domain: d, type: t, recordCount: unique.length, timestamp: Date.now() },
          ...prev.slice(0, 9),
        ]);
      } catch {
        setError("Failed to perform DNS lookup. Please check the domain and try again.");
      }

      setLoading(false);
    },
    [domain, recordType]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookup();
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Enter domain name (e.g. example.com)"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors"
        />
        <select
          value={recordType}
          onChange={(e) => setRecordType(e.target.value as RecordType)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors cursor-pointer"
        >
          {RECORD_TYPES.map((t) => (
            <option key={t} value={t} className="bg-[#0a0e1a] text-white">
              {t}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Looking up..." : "Lookup"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-white">
                DNS Records for{" "}
                <span className="text-cyan-400">{result.domain}</span>
              </h2>
              <p className="text-sm text-gray-500">
                {result.records.length} record{result.records.length !== 1 ? "s" : ""} found
                {" "}&middot; resolved in {result.time}ms
              </p>
            </div>
            <span className="text-xs text-gray-600">
              Type: {result.type}
            </span>
          </div>

          {/* Records Table */}
          {result.records.length > 0 ? (
            <div className="rounded-xl border border-white/10 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[100px_80px_80px_1fr] sm:grid-cols-[minmax(120px,1fr)_90px_80px_2fr] gap-2 px-4 py-3 bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-gray-500 font-medium">
                <span>Name</span>
                <span>Type</span>
                <span>TTL</span>
                <span>Value</span>
              </div>

              {/* Table Rows */}
              {result.records.map((record, i) => {
                const typeName = TYPE_MAP[record.type] || String(record.type);
                const color = TYPE_COLORS[typeName] || "text-gray-400 bg-gray-400/10 border-gray-400/20";
                return (
                  <div
                    key={i}
                    className="grid grid-cols-[100px_80px_80px_1fr] sm:grid-cols-[minmax(120px,1fr)_90px_80px_2fr] gap-2 px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors items-start"
                  >
                    <span className="text-sm text-gray-300 truncate" title={record.name}>
                      {record.name}
                    </span>
                    <span>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${color}`}>
                        {typeName}
                      </span>
                    </span>
                    <span className="text-sm text-gray-400 tabular-nums">
                      {record.TTL}s
                    </span>
                    <span className="text-sm text-white break-all font-mono">
                      {record.data}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-gray-500">
              No records found for this query.
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            Recent Lookups
          </h3>
          <div className="flex flex-wrap gap-2">
            {history.map((entry, i) => (
              <button
                key={i}
                onClick={() => {
                  setDomain(entry.domain);
                  setRecordType(entry.type as RecordType);
                  lookup(entry.domain, entry.type as RecordType);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-sm"
              >
                <span className="text-cyan-400">{entry.domain}</span>
                <span className="text-gray-600">{entry.type}</span>
                <span className="text-gray-700 text-xs">
                  ({entry.recordCount})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
