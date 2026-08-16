import { afterEach, describe, expect, it } from 'vitest';
import { getClientIp, UNKNOWN_CLIENT_IP } from './clientIp';

const requestWith = (headers: Record<string, string>) =>
  new Request('https://a2c.example.com/api/auth/login', { headers });

afterEach(() => {
  delete process.env.TRUSTED_PROXY_HOPS;
});

describe('getClientIp', () => {
  it('ignores caller-supplied entries and takes the one our proxy appended', () => {
    // The attack: prepend a chosen address so the rate limiter buckets by it.
    // Only the rightmost entry was written by infrastructure we control.
    const request = requestWith({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2, 203.0.113.9' });

    expect(getClientIp(request)).toBe('203.0.113.9');
  });

  it('reads a single-entry chain', () => {
    expect(getClientIp(requestWith({ 'x-forwarded-for': '203.0.113.9' }))).toBe('203.0.113.9');
  });

  it('tolerates whitespace and empty segments', () => {
    const request = requestWith({ 'x-forwarded-for': ' 1.1.1.1 , , 203.0.113.9 ' });

    expect(getClientIp(request)).toBe('203.0.113.9');
  });

  it('counts in further when more trusted hops are declared', () => {
    process.env.TRUSTED_PROXY_HOPS = '2';
    const request = requestWith({ 'x-forwarded-for': '1.1.1.1, 203.0.113.9, 10.0.0.5' });

    expect(getClientIp(request)).toBe('203.0.113.9');
  });

  it('never runs off the front of a chain shorter than the hop count', () => {
    process.env.TRUSTED_PROXY_HOPS = '5';
    const request = requestWith({ 'x-forwarded-for': '203.0.113.9' });

    expect(getClientIp(request)).toBe('203.0.113.9');
  });

  it('falls back to x-real-ip when there is no forwarded chain', () => {
    expect(getClientIp(requestWith({ 'x-real-ip': '203.0.113.9' }))).toBe('203.0.113.9');
  });

  it('returns the sentinel rather than throwing when nothing is available', () => {
    expect(getClientIp(requestWith({}))).toBe(UNKNOWN_CLIENT_IP);
  });
});
