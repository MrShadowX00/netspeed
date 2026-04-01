import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "net";

export async function GET(req: NextRequest) {
  const host = req.nextUrl.searchParams.get("host");
  const port = req.nextUrl.searchParams.get("port");

  if (!host || !port) {
    return NextResponse.json({ error: "Missing host or port" }, { status: 400 });
  }

  const portNum = parseInt(port, 10);
  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    return NextResponse.json({ error: "Invalid port" }, { status: 400 });
  }

  // Sanitize host — only allow valid hostnames/IPs
  const hostPattern = /^[a-zA-Z0-9][a-zA-Z0-9\-.]+[a-zA-Z0-9]$/;
  const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  if (!hostPattern.test(host) && !ipPattern.test(host)) {
    return NextResponse.json({ error: "Invalid host" }, { status: 400 });
  }

  try {
    const status = await new Promise<"open" | "closed">((resolve) => {
      const socket = createConnection({ host, port: portNum, timeout: 5000 });

      socket.on("connect", () => {
        socket.destroy();
        resolve("open");
      });

      socket.on("timeout", () => {
        socket.destroy();
        resolve("closed");
      });

      socket.on("error", () => {
        socket.destroy();
        resolve("closed");
      });
    });

    return NextResponse.json({ host, port: portNum, status });
  } catch {
    return NextResponse.json({ host, port: portNum, status: "closed" });
  }
}
