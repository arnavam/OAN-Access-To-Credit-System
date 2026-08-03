// In the browser, requests are same-origin. On the server (SSR), there is no
// origin, so prefer an explicit deployment URL and fall back to localhost on
// the actual configured port rather than a hardcoded 3000.
const BASE_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;

import { ApiErrorCode, httpStatusToErrorCode } from './apiErrors';

export class ApiError extends Error {
  responseData: unknown;
  /** HTTP status that produced this error, so callers can classify it (e.g. 5xx → Connection). */
  status?: number;

  constructor(message: string, responseData?: unknown, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.responseData = responseData;
    if (status !== undefined) this.status = status;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function extractFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  const details = (error.responseData as any)?.message?.details;
  if (!details || typeof details !== 'object') return {};
  return Object.fromEntries(
    Object.entries(details).filter(([, v]) => typeof v === 'string')
  ) as Record<string, string>;
}

let activeRefresh: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error('TimeoutError')), timeoutMs);
  
  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort(options.signal.reason);
    } else {
      options.signal.addEventListener('abort', () => controller.abort(options.signal?.reason));
    }
  }

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError' && options.signal?.aborted) {
      throw error; // Intentional abort from frontend (e.g. unmount)
    }
    if (error.message === 'TimeoutError' || error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new ApiError('The server is taking too long to respond. Please try again.', null, 408);
    }
    throw new ApiError('Network error. Please check your connection.', null, 0);
  }
}

export async function fetchApi(path: string, options: RequestInit = {}) {
  const url = new URL(`/api/proxy/api/method/${path}`, BASE_URL);
  
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let response = await fetchWithTimeout(url.toString(), {
    ...options,
    headers,
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    if (!activeRefresh) {
      activeRefresh = refreshSession().then(
        (success) => {
          activeRefresh = null;
          return success;
        },
        () => {
          activeRefresh = null;
          return false;
        }
      );
    }
    const success = await activeRefresh;
    if (success) {
      response = await fetchWithTimeout(url.toString(), {
        ...options,
        headers,
      });
    }
  }

  let responseData;
  try {
    responseData = await response.json();
  } catch (e) {
    if (!response.ok) throw new Error(`API Request failed with status ${response.status}`);
    return null;
  }

  if (!response.ok) {
    // 401 = unauthenticated (expired/invalid session) → triggers global logout.
    // 403 = authenticated but not permitted → surfaced as an error, NOT a logout.
    const authCode = httpStatusToErrorCode(response.status);
    if (authCode === ApiErrorCode.Auth || authCode === ApiErrorCode.Forbidden) {
      throw new Error(authCode);
    }
    // 5xx still throws an ApiError carrying the parsed server message (callers may
    // surface it in a toast); classifyError(error) recognizes it via .status.
    let errorMsg = `API Request failed with status ${response.status}`;
    if (responseData?._server_messages) {
      try {
        const msgs = JSON.parse(responseData._server_messages);
        if (Array.isArray(msgs) && msgs.length > 0) {
          const firstMsg = typeof msgs[0] === 'string' ? JSON.parse(msgs[0]) : msgs[0];
          if (firstMsg?.message) {
            errorMsg = firstMsg.message;
          }
        }
      } catch (e) {
        // ignore
      }
    } else if (responseData?.message?.details && typeof responseData.message.details === 'object') {
      const detailEntries = Object.entries(responseData.message.details).filter(([, v]) => Boolean(v));
      if (detailEntries.length > 0) {
        errorMsg = detailEntries
          .map(([k, v]) => `${k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}: ${v}`)
          .join('. ');
      } else if (responseData?.message?.message) {
        errorMsg = responseData.message.message;
      }
    } else if (responseData?.message?.message) {
      errorMsg = responseData.message.message;
    } else if (responseData?.message) {
      errorMsg = typeof responseData.message === 'string' ? responseData.message : JSON.stringify(responseData.message);
    }
    throw new ApiError(errorMsg, responseData, response.status);
  }

  // Handle "200 OK" application-level errors
  if (responseData?.message?.status === 'error') {
    let errorMsg = responseData.message.message || 'Application Error';
    if (responseData.message.details && typeof responseData.message.details === 'object') {
      const detailEntries = Object.entries(responseData.message.details).filter(([, v]) => Boolean(v));
      if (detailEntries.length > 0) {
        errorMsg = detailEntries
          .map(([k, v]) => `${k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}: ${v}`)
          .join('. ');
      }
    }
    throw new ApiError(errorMsg, responseData);
  }

  return responseData?.message ?? responseData;
}
