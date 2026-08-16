import { getClientIp } from '@/lib/clientIp';
import { logger } from '@/lib/logger';

// Header and body sanitization for the two routes that relay traffic between
// the browser and the Frappe bench (`/api/proxy/*` and `/api/files/*`).
//
// Both directions are allowlisted rather than blocklisted. A blocklist has to
// enumerate every header that must not cross, and silently starts leaking the
// moment either side adds a new one; an allowlist fails closed instead.

// --- Request: browser -> backend ------------------------------------------

/**
 * Client headers that may reach the bench.
 *
 * Everything else is dropped, which notably includes the whole `x-forwarded-*`
 * / `forwarded` / `x-real-ip` family: Frappe reads the *leftmost*
 * `X-Forwarded-For` entry into `frappe.local.request_ip`, so relaying the
 * client's own value hands it control of the IP its rate limits, login-attempt
 * tracker and audit log all key on. We re-derive and set those headers below.
 *
 * `cookie` is absent deliberately — the browser's cookies are ours, not the
 * bench's, and the JWT is attached as an `Authorization` header instead.
 */
const FORWARDED_REQUEST_HEADERS: ReadonlySet<string> = new Set([
  'accept',
  'accept-language',
  'content-type',
  'user-agent',
  'x-request-id',
]);

/**
 * Builds the header set for the upstream request.
 *
 * `authToken` is injected server-side from the httpOnly cookie; the browser
 * never holds it and cannot influence it.
 */
export function buildUpstreamHeaders(request: Request, authToken?: string): Headers {
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    if (FORWARDED_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  // Set — never append — so whatever the caller sent is replaced rather than
  // prepended to. `getClientIp` reads from the trusted end of the chain.
  headers.set('X-Forwarded-For', getClientIp(request));

  const url = new URL(request.url);
  headers.set('X-Forwarded-Proto', url.protocol.replace(':', ''));
  headers.set('X-Forwarded-Host', url.host);

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  return headers;
}

// --- Response: backend -> browser -----------------------------------------

/**
 * Backend headers the browser is allowed to see.
 *
 * Two categories matter most among the ones this excludes:
 *
 *  - `set-cookie`. Frappe issues its own `sid`/`system_user` cookies on some
 *    paths. Relayed verbatim they land on our origin, where a backend-issued
 *    cookie could shadow or evict the httpOnly session cookies this app
 *    depends on. The bench session is irrelevant to a JWT client anyway.
 *  - Tech disclosure (`server`, `x-powered-by`, `x-frappe-*`), which advertises
 *    the stack and version to anyone reading a response.
 *
 * `content-encoding` and `content-length` are also excluded: the body is
 * decoded (and sometimes rewritten) on the way through, so relaying the
 * original values would describe a payload the browser is not receiving.
 */
const FORWARDED_RESPONSE_HEADERS: ReadonlySet<string> = new Set([
  'content-type',
  'content-disposition',
  'content-language',
  'content-range',
  'accept-ranges',
  'cache-control',
  'expires',
  'last-modified',
  'etag',
  'vary',
  'retry-after',
]);

export function sanitizeResponseHeaders(source: Headers): Headers {
  const headers = new Headers();
  source.forEach((value, key) => {
    if (FORWARDED_RESPONSE_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  return headers;
}

// --- Response body ---------------------------------------------------------

/**
 * Frappe debug fields that must not reach the browser.
 *
 * `_server_messages` and `exc` are the loud ones: on any unhandled exception
 * they carry the traceback — exception class, absolute file paths, line
 * numbers and, for a failed query, the SQL itself. That is a map of the
 * backend handed to whoever triggered the error.
 *
 * `exc_type` is kept on purpose. It is a bare class name with no path, query or
 * line number in it, and the app branches on it for legitimate UX (a
 * `DoesNotExistError` from farmer lookup renders "not found" rather than a
 * generic failure).
 */
const FRAPPE_DEBUG_FIELDS = ['_server_messages', '_debug_messages', 'exc', 'exception', 'traceback'] as const;

function isJsonContentType(contentType: string | null): boolean {
  return !!contentType && /\bapplication\/(json|.*\+json)\b/i.test(contentType);
}

/**
 * Strips Frappe's debug fields from a JSON payload, logging what was removed so
 * the detail stays available to operators without being shipped to the browser.
 *
 * Returns the payload unchanged when there was nothing to strip, so the common
 * (successful) case re-serializes identically.
 */
function stripDebugFields(payload: unknown, targetUrl: string): { changed: boolean; payload: unknown } {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { changed: false, payload };
  }

  const record = payload as Record<string, unknown>;
  const removed: string[] = [];

  for (const field of FRAPPE_DEBUG_FIELDS) {
    if (field in record) {
      removed.push(field);
      delete record[field];
    }
  }

  if (removed.length === 0) return { changed: false, payload };

  logger.security(
    `Stripped Frappe debug field(s) [${removed.join(', ')}] from the response for ${targetUrl}`
  );
  return { changed: true, payload: record };
}

/**
 * Relays the upstream response to the browser with headers allowlisted and, for
 * JSON, debug fields removed.
 *
 * Only JSON is buffered. Anything else — file downloads above all — is streamed
 * straight through, so a large document never has to fit in memory.
 */
export async function buildClientResponse(
  response: Response,
  targetUrl: string
): Promise<{ body: BodyInit | null; init: ResponseInit }> {
  const headers = sanitizeResponseHeaders(response.headers);
  const init: ResponseInit = {
    status: response.status,
    statusText: response.statusText,
    headers,
  };

  if (!isJsonContentType(response.headers.get('content-type'))) {
    return { body: response.body, init };
  }

  const raw = await response.text();
  if (!raw) return { body: raw, init };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Content-Type claimed JSON but the body is not parseable. Rather than
    // guess at its contents, replace it — an unparseable "JSON" response from
    // the bench is an error page, and error pages are what leak stack traces.
    logger.security(
      `Non-JSON body on a JSON response from ${targetUrl}; replaced with a generic error`
    );
    return {
      body: JSON.stringify({ message: 'The server returned an unexpected response.' }),
      init,
    };
  }

  const { changed, payload } = stripDebugFields(parsed, targetUrl);
  return { body: changed ? JSON.stringify(payload) : raw, init };
}
