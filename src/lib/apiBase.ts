const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

const ensureApiPath = (value: string) => {
  const cleaned = trimTrailingSlashes(value.trim());
  return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
};

/**
 * Browser requests should stay relative so the same build works from both:
 * - http://jfst.bup.edu.bd
 * - http://103.121.194.11
 */
export const getBrowserApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (envUrl?.startsWith("/")) {
    return trimTrailingSlashes(envUrl);
  }

  return "/api";
};

/**
 * Server Components and Route Handlers need an absolute URL.
 * On the Ubuntu VM this should normally be http://127.0.0.1:5000/api.
 */
export const getServerApiBaseUrl = () => {
  const internalUrl =
    process.env.SERVER_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_SERVER_INTERNAL_URL ||
    process.env.INTERNAL_API_URL;

  if (internalUrl?.trim()) {
    return ensureApiPath(internalUrl);
  }

  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (publicApiUrl && /^https?:\/\//i.test(publicApiUrl)) {
    return ensureApiPath(publicApiUrl);
  }

  return "http://127.0.0.1:5000/api";
};

export const getApiBaseUrl = () => {
  return typeof window === "undefined"
    ? getServerApiBaseUrl()
    : getBrowserApiBaseUrl();
};

export const getBrowserFileOrigin = () => {
  const apiBaseUrl = getBrowserApiBaseUrl();
  return /^https?:\/\//i.test(apiBaseUrl)
    ? apiBaseUrl.replace(/\/api\/?$/, "")
    : "";
};
