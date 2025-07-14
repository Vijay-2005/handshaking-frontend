// Centralized API wrapper for interacting with the 3-Way Handshaking backend
// All endpoints exposed by the backend are mapped to type-safe functions here.
// If you want to point to a different backend at runtime simply set the
// environment variable `VITE_API_URL` when building / running Vite.

const BASE_URL =
  (import.meta.env.VITE_API_URL as string) ||
  "https://3-way-handshaking-backend-efpo.vercel.app";

interface RequestOptions extends RequestInit {
  // The generic type of the response expected from this call.
  // This enables callers to get proper type-ahead when they `await api.xyz()`.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responseSchema?: any;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { responseSchema: _schema, ...fetchOpts } = options;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...fetchOpts,
  });

  if (!res.ok) {
    // Attempt to read text for better DX in the toast / console.
    const errText = await res.text();
    throw new Error(`Request failed: ${res.status} – ${errText}`);
  }

  // Most endpoints return JSON; if something else, the caller can handle.
  return (await res.json()) as T;
}

// ----- GET endpoints -------------------------------------------------------
export const api = {
  // Health check
  health: () => request<{ status: string; timestamp: number; version: string }>(
    "/api/health"
  ),

  // Current simulation status
  status: () =>
    request<unknown>(
      "/api/status"
      // You can swap out `unknown` for a proper interface once the shape is
      // confirmed.
    ),

  // Historical results
  history: () => request<unknown>("/api/history"),

  // ----- POST endpoints ----------------------------------------------------
  reset: () =>
    request<void>("/api/reset", {
      method: "POST",
    }),

  sendPacket: (body: {
    data: string;
    checksum: string;
    valid: boolean;
  }) =>
    request<unknown>("/api/send-packet", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  handshake: () =>
    request<unknown>("/api/handshake", {
      method: "POST",
    }),

  runTest: () =>
    request<unknown>("/api/run-test", {
      method: "POST",
    }),

  validateChecksum: (body: { data: string }) =>
    request<{ checksum: string; valid: boolean }>("/api/validate-checksum", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  generatePacket: () =>
    request<{ data: string; checksum: string }>("/api/generate-packet", {
      method: "POST",
    }),
};

export type Api = typeof api;
