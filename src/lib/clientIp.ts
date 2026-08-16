// Derives the caller's IP address from a request that reached us through a
// reverse proxy.
//
// `X-Forwarded-For` is a client-writable header: anything a client sends
// arrives at our proxy verbatim, and each hop *appends* its own view of the
// peer. So the chain looks like
//
//     <spoofed by client>, <spoofed by client>, <real IP seen by our edge>
//
// The trustworthy entries are therefore the rightmost ones — one per proxy we
// actually control. Reading the leftmost entry (the common mistake, and what
// Frappe does with whatever we forward it) lets the caller pick its own
// identity, defeating any per-IP rate limit or audit trail built on it.
//
// TRUSTED_PROXY_HOPS is the number of proxies between the internet and this
// process. The default of 1 matches the deployed topology (a single load
// balancer in front of the Next container). Raise it if another trusted hop is
// added; erring high yields our own infrastructure's IP rather than an
// attacker-chosen one, which is the safe direction to be wrong in.
const DEFAULT_TRUSTED_PROXY_HOPS = 1;

/** Sentinel used when no address can be established — still a usable bucket key. */
export const UNKNOWN_CLIENT_IP = 'unknown';

function trustedProxyHops(): number {
  const raw = Number.parseInt(process.env.TRUSTED_PROXY_HOPS ?? '', 10);
  return Number.isInteger(raw) && raw > 0 ? raw : DEFAULT_TRUSTED_PROXY_HOPS;
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (forwardedFor) {
    const chain = forwardedFor
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (chain.length > 0) {
      // Count in from the right: the last entry was appended by the hop nearest
      // to us, so it is the only one no caller could have written.
      const index = Math.max(0, chain.length - trustedProxyHops());
      const ip = chain[index];
      if (ip) return ip;
    }
  }

  // Single-valued and overwritten (not appended) by nginx/ALB, so it carries the
  // same guarantee when present.
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  return UNKNOWN_CLIENT_IP;
}
