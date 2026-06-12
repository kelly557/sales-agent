export const AUTH_SESSION_KEY = "doctech:auth:session";
export const AUTH_SESSION_TTL_DAYS = 7;
export const AUTH_SESSION_TTL_MS =
  AUTH_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

export type AuthSession = {
  username: string;
  expiresAt: number;
};

export const AUTH_DEFAULT_USERNAME = "admin";
export const AUTH_DEFAULT_PASSWORD = "admin123";

export function readAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (
      typeof parsed?.username === "string" &&
      typeof parsed?.expiresAt === "number" &&
      parsed.expiresAt > Date.now()
    ) {
      return { username: parsed.username, expiresAt: parsed.expiresAt };
    }
    window.localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  } catch {
    return null;
  }
}

export function writeAuthSession(username: string) {
  const session: AuthSession = {
    username,
    expiresAt: Date.now() + AUTH_SESSION_TTL_MS,
  };
  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_SESSION_KEY);
}

export function getExpectedCredentials(): {
  username: string;
  password: string;
} {
  const envUsername = (import.meta.env.VITE_AUTH_USERNAME ?? "").trim();
  const envPassword = (import.meta.env.VITE_AUTH_PASSWORD ?? "").trim();
  return {
    username: envUsername || AUTH_DEFAULT_USERNAME,
    password: envPassword || AUTH_DEFAULT_PASSWORD,
  };
}
