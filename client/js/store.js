// Discard legacy persistent bearer tokens. Authentication uses HttpOnly cookies.
localStorage.removeItem("zomareel.session");
const STORAGE_KEY = "zomareel.session";

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = binary
    .split("")
    .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
    .join("");
  return decodeURIComponent(bytes);
}

export function decodeToken(token) {
  try {
    return JSON.parse(decodeBase64Url(token.split(".")[1]));
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeToken(token);
  if (!payload?.exp) {
    return false;
  }
  return payload.exp * 1000 <= Date.now();
}

export function getSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const session = JSON.parse(raw);

    if (!session?.role) {
      return null;
    }

    if (session.expiresAt <= Date.now()) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function setSession(session) {
  const { token, ...metadata } = session;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ expiresAt: Date.now() + 86400000, ...metadata }));
}

export function updateSession(patch) {
  const session = getSession();
  if (session) {
    setSession({ ...session, ...patch });
  }
}

export function clearSession() {
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
}
