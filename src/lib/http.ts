import type { RequestConfig, ResponseData } from "./types";

function buildUrl(url: string, params: RequestConfig["params"]): string {
  const enabled = params.filter((p) => p.enabled && p.key.trim());
  if (!enabled.length) return url;
  try {
    const u = new URL(url);
    enabled.forEach((p) => u.searchParams.append(p.key, p.value));
    return u.toString();
  } catch {
    const qs = enabled
      .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join("&");
    return url + (url.includes("?") ? "&" : "?") + qs;
  }
}

export function statusMessage(status: number): string {
  if (status === 0) return "Network error — request could not be sent. Check the URL or CORS.";
  if (status === 400) return "Bad Request — the server rejected the request payload.";
  if (status === 401) return "Unauthorized — check your API key or bearer token.";
  if (status === 403) return "Forbidden — you don't have permission for this resource.";
  if (status === 404) return "Not Found — the endpoint does not exist.";
  if (status === 408) return "Request Timeout — the server took too long to respond.";
  if (status === 429) return "Too Many Requests — you've been rate limited.";
  if (status >= 500) return "Server Error — something went wrong on the server.";
  if (status >= 400) return "Client Error";
  if (status >= 300) return "Redirect";
  if (status >= 200) return "Success";
  return "Unknown";
}

export async function sendRequest(req: RequestConfig): Promise<ResponseData> {
  const url = buildUrl(req.url, req.params);
  const headers = new Headers();
  req.headers
    .filter((h) => h.enabled && h.key.trim())
    .forEach((h) => headers.set(h.key, h.value));
  if (req.bearerToken.trim()) {
    headers.set("Authorization", `Bearer ${req.bearerToken.trim()}`);
  }

  const init: RequestInit = { method: req.method, headers };
  if (["POST", "PUT", "PATCH"].includes(req.method) && req.body.trim()) {
    init.body = req.body;
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  }

  const start = performance.now();
  try {
    const res = await fetch(url, init);
    const text = await res.text();
    const timeMs = Math.round(performance.now() - start);
    const sizeBytes = new Blob([text]).size;

    let data: unknown = text;
    try {
      data = JSON.parse(text);
    } catch {
      // not JSON, keep as text
    }

    const respHeaders: Record<string, string> = {};
    res.headers.forEach((v, k) => (respHeaders[k] = v));

    return {
      status: res.status,
      statusText: res.statusText || statusMessage(res.status),
      headers: respHeaders,
      data,
      rawText: text,
      timeMs,
      sizeBytes,
      ok: res.ok,
    };
  } catch (e) {
    const timeMs = Math.round(performance.now() - start);
    const message = e instanceof Error ? e.message : "Request failed";
    return {
      status: 0,
      statusText: "Network Error",
      headers: {},
      data: null,
      rawText: "",
      timeMs,
      sizeBytes: 0,
      ok: false,
      error: `${message}. ${statusMessage(0)}`,
    };
  }
}

export function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}
