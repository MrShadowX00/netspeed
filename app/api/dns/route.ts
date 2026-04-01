import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  const type = req.nextUrl.searchParams.get("type") || "A";

  if (!name) {
    return NextResponse.json({ error: "Missing domain name" }, { status: 400 });
  }

  // Sanitize domain
  const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9\-.]+\.[a-zA-Z]{2,}$/;
  if (!domainPattern.test(name)) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`,
      { headers: { Accept: "application/dns-json" } }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "DNS lookup failed" }, { status: 502 });
  }
}
