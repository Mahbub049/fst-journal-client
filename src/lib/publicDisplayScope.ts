export type PublicDisplayScope = "homepage" | "all" | "custom";

const normalizePath = (value: string) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      return new URL(trimmed).pathname || "/";
    } catch {
      return "";
    }
  }

  const withoutQuery = trimmed.split(/[?#]/, 1)[0] || "/";
  if (withoutQuery === "*") return "*";
  return withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
};

export const normalizeCustomDisplayPaths = (values?: string[] | null) => {
  return Array.from(
    new Set(
      (values || [])
        .map(normalizePath)
        .filter(Boolean),
    ),
  );
};

export const parseCustomDisplayPaths = (value: string) => {
  return normalizeCustomDisplayPaths(
    String(value || "")
      .split(/[\n,]+/)
      .map((item) => item.trim()),
  );
};

export const matchesPublicDisplayScope = ({
  pathname,
  scope,
  customPaths,
}: {
  pathname: string;
  scope?: PublicDisplayScope | null;
  customPaths?: string[] | null;
}) => {
  const currentPath = normalizePath(pathname || "/") || "/";
  const resolvedScope = scope || "homepage";

  if (resolvedScope === "all") return true;
  if (resolvedScope === "homepage") return currentPath === "/";

  const paths = normalizeCustomDisplayPaths(customPaths);
  if (paths.length === 0) return false;

  return paths.some((pattern) => {
    if (pattern === "*") return true;
    if (pattern.endsWith("/*")) {
      const base = pattern.slice(0, -2) || "/";
      return currentPath === base || currentPath.startsWith(`${base}/`);
    }
    if (pattern.endsWith("*")) {
      return currentPath.startsWith(pattern.slice(0, -1));
    }
    return currentPath === pattern;
  });
};
