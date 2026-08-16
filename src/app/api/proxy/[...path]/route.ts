import { checkCsrf } from '@/lib/csrf';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { buildClientResponse, buildUpstreamHeaders } from '@/lib/proxyHeaders';
import { AUTH_TOKEN_COOKIE } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ path: string[] }> };

// One shared handler exported per HTTP verb so method semantics are explicit
// at the routing layer (and mutating verbs go through the CSRF guard below).
async function handler(request: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  return handleProxy(request, path);
}

export {
    handler as GET,
    handler as POST,
    handler as PUT,
    handler as PATCH,
    handler as DELETE,
};

async function handleProxy(request: NextRequest, pathArray: string[]) {
  const isMutating = !['GET', 'HEAD'].includes(request.method);

  // CSRF: reject cross-origin state-changing requests.
  if (isMutating) {
    const csrfError = checkCsrf(request);
    if (csrfError) return csrfError;
  }

  // Construct the target URL
  const targetPath = pathArray.join('/');
  const search = request.nextUrl.search;
  const targetUrl = `${env.API_BASE_URL}/${targetPath}${search}`;

  const authToken = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;

  // Allowlisted client headers plus a trustworthy X-Forwarded-For and the JWT
  // injected from the httpOnly cookie. See lib/proxyHeaders.ts for why both
  // directions are filtered rather than blocklisted.
  const headers = buildUpstreamHeaders(request, authToken);

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      redirect: 'manual',
    };

    // Only add body if it's not a GET/HEAD request
    if (isMutating) {
      fetchOptions.body = await request.blob();
    }

    // Forward the request to the external backend
    const response = await fetch(targetUrl, fetchOptions);

    // Relay it back with response headers allowlisted (no Set-Cookie, no stack
    // disclosure) and Frappe's debug fields stripped from JSON bodies.
    const { body, init } = await buildClientResponse(response, targetUrl);
    return new NextResponse(body, init);
  } catch (error) {
    logger.error(`Proxy error for ${targetUrl}:`, error);
    return NextResponse.json({ message: 'Proxy request failed' }, { status: 502 });
  }
}
