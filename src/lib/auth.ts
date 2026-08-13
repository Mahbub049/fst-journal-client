export type AdminUser = {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "super_admin" | "admin";
  isActive?: boolean;
  mustChangePassword?: boolean;
};

const LEGACY_TOKEN_KEY =
  "bup_fst_journal_admin_token";

const LEGACY_ADMIN_KEY =
  "bup_fst_journal_admin_user";

const LEGACY_LAST_ACTIVITY_KEY =
  "bup_fst_journal_admin_last_activity";

export const ADMIN_SESSION_TIMEOUT_MS =
  60 * 60 * 1000;

type AdminUserListener = (
  admin: AdminUser | null
) => void;

let currentAdmin: AdminUser | null = null;
let lastActivityAt = Date.now();

const adminUserListeners =
  new Set<AdminUserListener>();

const getBrowserStorage = (
  storageType: "localStorage" | "sessionStorage"
): Storage | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window[storageType];
  } catch {
    return null;
  }
};

export const clearLegacyAdminStorage = (): void => {
  const localStorage =
    getBrowserStorage("localStorage");

  const sessionStorage =
    getBrowserStorage("sessionStorage");

  const legacyKeys = [
    LEGACY_TOKEN_KEY,
    LEGACY_ADMIN_KEY,
    LEGACY_LAST_ACTIVITY_KEY,
  ];

  legacyKeys.forEach((key) => {
    localStorage?.removeItem(key);
    sessionStorage?.removeItem(key);
  });
};

const notifyAdminUserListeners = (): void => {
  adminUserListeners.forEach((listener) => {
    listener(currentAdmin);
  });
};

export const getAdminUser = (): AdminUser | null =>
  currentAdmin;

export const setAdminUser = (
  admin: AdminUser
): void => {
  currentAdmin = admin;
  lastActivityAt = Date.now();
  notifyAdminUserListeners();
};

export const clearAdminUser = (): void => {
  currentAdmin = null;
  lastActivityAt = Date.now();
  notifyAdminUserListeners();
};

export const subscribeToAdminUser = (
  listener: AdminUserListener
): (() => void) => {
  adminUserListeners.add(listener);

  return () => {
    adminUserListeners.delete(listener);
  };
};

export const touchAdminSession = (): void => {
  lastActivityAt = Date.now();
};

export const startAdminInactivityWatcher = (
  onExpire: () => void
): (() => void) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  let hasExpired = false;

  const activityEvents = [
    "click",
    "keydown",
    "mousemove",
    "scroll",
    "touchstart",
  ] as const;

  const markActive = (): void => {
    if (!hasExpired) {
      touchAdminSession();
    }
  };

  const checkSession = (): void => {
    const inactiveFor =
      Date.now() - lastActivityAt;

    if (
      !hasExpired &&
      inactiveFor > ADMIN_SESSION_TIMEOUT_MS
    ) {
      hasExpired = true;
      clearAdminUser();
      onExpire();
    }
  };

  touchAdminSession();

  activityEvents.forEach((eventName) => {
    window.addEventListener(
      eventName,
      markActive,
      { passive: true }
    );
  });

  const intervalId = window.setInterval(
    checkSession,
    30 * 1000
  );

  return () => {
    activityEvents.forEach((eventName) => {
      window.removeEventListener(
        eventName,
        markActive
      );
    });

    window.clearInterval(intervalId);
  };
};