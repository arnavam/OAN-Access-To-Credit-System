import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { buildClientResponse, buildUpstreamHeaders } from '@/lib/proxyHeaders';
import { AUTH_TOKEN_COOKIE } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  const targetUrl = `${env.API_BASE_URL}/files/${path.join('/')}${request.nextUrl.search}`;

  const authToken = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const headers = buildUpstreamHeaders(request, authToken);

  try {
    // Redirects are followed here rather than relayed: `location` is not in the
    // response allowlist, so a relayed 302 would reach the browser with nothing
    // to follow. Following server-side also keeps the backend's URL out of the
    // browser entirely, which is the point of proxying files in the first place.
    const response = await fetch(targetUrl, { headers });

    // Same relay rules as /api/proxy: allowlisted response headers so a
    // backend Set-Cookie can never shadow the session cookies, and the file
    // body streamed through untouched (only JSON is buffered/sanitized, which
    // here means just the error responses).
    const { body, init } = await buildClientResponse(response, targetUrl);
    return new NextResponse(body, init);
  } catch (error) {
    logger.error(`Files proxy error for ${targetUrl}:`, error);
    return NextResponse.json({ message: 'Proxy request failed' }, { status: 502 });
  }
}
