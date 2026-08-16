import { describe, expect, it } from 'vitest';
import { buildClientResponse, buildUpstreamHeaders, sanitizeResponseHeaders } from './proxyHeaders';

const jsonResponse = (body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status: 500,
    headers: { 'content-type': 'application/json', ...headers },
  });

describe('buildUpstreamHeaders', () => {
  it('overwrites a caller-supplied X-Forwarded-For with the trusted value', () => {
    // Frappe reads the leftmost entry into frappe.local.request_ip, which keys
    // its rate limit and login-attempt tracker — relaying this verbatim handed
    // the caller control of its own identity.
    const request = new Request('https://a2c.example.com/api/proxy/api/method/x', {
      headers: { 'x-forwarded-for': '1.1.1.1, 203.0.113.9' },
    });

    expect(buildUpstreamHeaders(request).get('x-forwarded-for')).toBe('203.0.113.9');
  });

  it('drops headers outside the allowlist', () => {
    const request = new Request('https://a2c.example.com/api/proxy/api/method/x', {
      headers: {
        cookie: 'auth_token=secret',
        'x-real-ip': '1.1.1.1',
        authorization: 'Bearer attacker-supplied',
        'x-frappe-cmd': 'frappe.desk.doctype',
        accept: 'application/json',
      },
    });

    const headers = buildUpstreamHeaders(request);

    expect(headers.get('cookie')).toBeNull();
    expect(headers.get('x-frappe-cmd')).toBeNull();
    expect(headers.get('accept')).toBe('application/json');
  });

  it('injects the Authorization header from the server-held token, not the caller', () => {
    const request = new Request('https://a2c.example.com/api/proxy/api/method/x', {
      headers: { authorization: 'Bearer attacker-supplied' },
    });

    expect(buildUpstreamHeaders(request, 'real-jwt').get('authorization')).toBe('Bearer real-jwt');
  });
});

describe('sanitizeResponseHeaders', () => {
  it('drops Set-Cookie so the backend cannot shadow the session cookies', () => {
    const source = new Headers({
      'set-cookie': 'sid=abc; Path=/',
      'content-type': 'application/json',
    });

    const headers = sanitizeResponseHeaders(source);

    expect(headers.get('set-cookie')).toBeNull();
    expect(headers.get('content-type')).toBe('application/json');
  });

  it('drops tech-disclosure headers', () => {
    const source = new Headers({
      server: 'Werkzeug/3.0.1 Python/3.11',
      'x-powered-by': 'Frappe',
      'x-frappe-request-id': 'abc',
    });

    const headers = sanitizeResponseHeaders(source);

    expect([...headers.keys()]).toEqual([]);
  });

  it('keeps the headers a download depends on', () => {
    const source = new Headers({
      'content-disposition': 'attachment; filename="loan.pdf"',
      'content-range': 'bytes 0-99/100',
      'accept-ranges': 'bytes',
    });

    const headers = sanitizeResponseHeaders(source);

    expect(headers.get('content-disposition')).toBe('attachment; filename="loan.pdf"');
    expect(headers.get('content-range')).toBe('bytes 0-99/100');
    expect(headers.get('accept-ranges')).toBe('bytes');
  });
});

describe('buildClientResponse', () => {
  it('strips Frappe debug fields from a JSON error body', async () => {
    const response = jsonResponse({
      exc_type: 'ValidationError',
      exc: 'Traceback (most recent call last): File "/home/frappe/apps/oan_a2c/...", line 212',
      _server_messages: '[{"message": "SELECT * FROM `tabA2C Lead`"}]',
      message: { status: 'error', message: 'Could not save the lead.' },
    });

    const { body } = await buildClientResponse(response, 'https://bench/api/method/x');
    const parsed = JSON.parse(String(body));

    expect(parsed._server_messages).toBeUndefined();
    expect(parsed.exc).toBeUndefined();
    // Kept on purpose: a bare class name with no path or query in it, which the
    // app branches on for legitimate UX (DoesNotExistError -> "not found").
    expect(parsed.exc_type).toBe('ValidationError');
    expect(parsed.message.message).toBe('Could not save the lead.');
  });

  it('leaves a clean payload byte-identical', async () => {
    const payload = { message: { status: 'success', data: { name: 'LEAD-0001' } } };

    const { body } = await buildClientResponse(jsonResponse(payload), 'https://bench/x');

    expect(body).toBe(JSON.stringify(payload));
  });

  it('replaces an unparseable body that claims to be JSON', async () => {
    // An HTML error page served with a JSON content type is exactly where a
    // stack trace shows up.
    const response = new Response('<html><body>Traceback: /home/frappe/apps/...</body></html>', {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });

    const { body } = await buildClientResponse(response, 'https://bench/x');

    expect(String(body)).not.toContain('/home/frappe');
    expect(JSON.parse(String(body)).message).toBe('The server returned an unexpected response.');
  });

  it('streams a non-JSON body through without buffering it', async () => {
    const response = new Response('binary-pdf-bytes', {
      status: 200,
      headers: { 'content-type': 'application/pdf' },
    });

    const { body, init } = await buildClientResponse(response, 'https://bench/files/x.pdf');

    expect(body).toBe(response.body);
    expect(new Headers(init.headers).get('content-type')).toBe('application/pdf');
  });

  it('preserves the upstream status', async () => {
    const { init } = await buildClientResponse(jsonResponse({ message: 'nope' }), 'https://bench/x');

    expect(init.status).toBe(500);
  });
});
