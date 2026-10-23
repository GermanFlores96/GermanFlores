// Anonymous tour measurements (see src/components/tour/metrics.ts): how long trips take to arrive, how often a trip had
// to be a crossfade, how often playback stalled, on what kind of connection. One JSON line per event in the Vercel
// logs; nothing is stored and nothing identifies the visitor (no cookie, no id, no IP in the line).
// Everything is whitelisted and clamped, so the endpoint cannot be used to write arbitrary text into the logs.

const TEXT = /^[a-z0-9._-]{1,16}$/;
const MAX_BODY = 4096;
const MAX_EVENTS = 12;

const text = (v: unknown) => (typeof v === "string" && TEXT.test(v) ? v : "?");
const num = (v: unknown, max: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.round(v))) : null;

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY) return new Response(null, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response(null, { status: 400 });
  }
  const { device, net, events } = (body ?? {}) as { device?: unknown; net?: Record<string, unknown>; events?: unknown };
  if (!Array.isArray(events)) return new Response(null, { status: 400 });

  for (const e of events.slice(0, MAX_EVENTS) as Record<string, unknown>[]) {
    console.log(
      "tour-metric " +
        JSON.stringify({
          device: text(device),
          kind: text(e?.kind),
          codec: text(e?.codec),
          tier: text(e?.tier),
          out: text(e?.out),
          waitMs: num(e?.waitMs, 120_000),
          kb: num(e?.kb, 100_000),
          stalls: num(e?.stalls, 1000),
          mbps: num(e?.mbps, 10_000),
          net: text(net?.type),
          downlink: num(net?.downlink, 10_000),
          save: net?.save === true,
        }),
    );
  }
  return new Response(null, { status: 204 });
}
