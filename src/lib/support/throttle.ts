/* Best-effort per-instance throttle for the support form: at most five
 * accepted requests per IP in ten minutes. Each server instance keeps its
 * own memory, so this only slows a single client down; the honeypot field
 * catches most bots. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map<string, number[]>();

export function supportThrottle(ip: string) {
  const since = Date.now() - WINDOW_MS;
  const hits = (recent.get(ip) ?? []).filter((t) => t > since);
  return {
    limited: hits.length >= MAX_PER_WINDOW,
    /* counted only once the request is stored */
    record: () => void recent.set(ip, [...hits, Date.now()]),
  };
}

/* first hop of x-forwarded-for, as the platform reports it */
export const clientIp = (headers: Headers) =>
  String(headers.get("x-forwarded-for") || headers.get("x-real-ip") || "unknown").split(",")[0].trim();
