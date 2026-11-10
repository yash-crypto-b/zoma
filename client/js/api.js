import { getSession, clearSession } from "./store.js";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function api(path, { method = "GET", body, metadata, auth = true } = {}) {
  const headers = { Accept: "application/json", ...(method !== "GET" ? { "Content-Type": "application/json" } : {}) };

  if (body !== undefined) {
    headers["Content-Type"] = body instanceof Blob ? "video/mp4" : "application/json";
    if (metadata) headers["X-Reel-Metadata"] = encodeURIComponent(JSON.stringify(metadata));
  }

  let response;

  try {
    response = await fetch(`/api${path}`, {
      method,
      headers,
      credentials: "same-origin",
      body: body === undefined ? undefined : body instanceof Blob ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Can't reach the server. Is it running?", 0);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401 && auth) {
      clearSession();
    }
    throw new ApiError(
      data?.message || `Request failed (${response.status})`,
      response.status
    );
  }

  return data;
}
