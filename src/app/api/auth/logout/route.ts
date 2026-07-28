import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  // Clear the auth cookies by setting them to expire in the past. Both are
  // cleared so a lingering refresh_token can't re-mint a session.
  const expired = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };
  response.cookies.set('auth_token', '', expired);
  response.cookies.set('refresh_token', '', expired);

  return response;
}
