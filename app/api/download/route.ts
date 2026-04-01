export const dynamic = "force-dynamic";

export async function GET() {
  const CHUNK_SIZE = 1024 * 1024; // 1MB
  const MAX_DURATION_MS = 15000;
  const startTime = Date.now();

  const chunk = Buffer.alloc(CHUNK_SIZE);
  // Fill with pseudo-random data (fast)
  for (let i = 0; i < CHUNK_SIZE; i += 4) {
    const val = (Math.random() * 0xffffffff) >>> 0;
    chunk[i] = val & 0xff;
    chunk[i + 1] = (val >> 8) & 0xff;
    chunk[i + 2] = (val >> 16) & 0xff;
    chunk[i + 3] = (val >> 24) & 0xff;
  }

  const stream = new ReadableStream({
    pull(controller) {
      if (Date.now() - startTime > MAX_DURATION_MS) {
        controller.close();
        return;
      }
      controller.enqueue(new Uint8Array(chunk));
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
