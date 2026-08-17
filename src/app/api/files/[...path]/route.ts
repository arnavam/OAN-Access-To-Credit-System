import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { path } = await params;

  // Prevent path traversal attacks by rejecting relative path indicators
  if (path.some(segment => segment === '..' || segment === '.')) {
    return NextResponse.json({ message: 'Invalid file path' }, { status: 400 });
  }
  
  // Safely construct the full URL
  const targetUrlObj = new URL(`/files/${path.join('/')}`, env.API_BASE_URL);
  targetUrlObj.search = request.nextUrl.search;
  const targetUrl = targetUrlObj.toString();

  const authToken = request.cookies.get('auth_token')?.value;
  const headers = new Headers();
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  try {
    const response = await fetch(targetUrl, { headers });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    logger.error(`Files proxy error for ${targetUrl}:`, error);
    return NextResponse.json({ message: 'Proxy request failed' }, { status: 502 });
  }
}
