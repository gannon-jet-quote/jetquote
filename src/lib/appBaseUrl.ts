/**
 * Single source of truth for the app's base URL.
 *
 * Priority:
 *  1. VITE_APP_BASE_URL build-time env var (set in Lovable environment)
 *  2. window.location.origin (safe fallback in the browser)
 *
 * Always returns a string without a trailing slash so callers can safely
 * concatenate paths like `${getAppBaseUrl()}/proposal/respond/${token}`.
 */
export function getAppBaseUrl(): string {
  const fromEnv = (import.meta.env.VITE_APP_BASE_URL as string | undefined)?.trim();
  const base = fromEnv && fromEnv.length > 0
    ? fromEnv
    : (typeof window !== "undefined" ? window.location.origin : "");
  return base.replace(/\/+$/, "");
}

/** Build an absolute URL for a given path on the app. */
export function buildAppUrl(path: string): string {
  const base = getAppBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
