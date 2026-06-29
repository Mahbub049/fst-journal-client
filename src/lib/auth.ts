export type AdminUser = {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "super_admin" | "admin";
  isActive?: boolean;
  mustChangePassword?: boolean;
};

const TOKEN_KEY = "bup_fst_journal_admin_token";
const ADMIN_KEY = "bup_fst_journal_admin_user";
const LAST_ACTIVITY_KEY = "bup_fst_journal_admin_last_activity";
export const ADMIN_SESSION_TIMEOUT_MS = 60 * 60 * 1000;

const getSessionStorage = () => {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

const getLocalStorage = () => {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const removeOldPersistentAdminStorage = () => {
  const localStorage = getLocalStorage();

  if (!localStorage) return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
};

export const touchAdminSession = () => {
  const storage = getSessionStorage();

  if (!storage) return;

  storage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
};

export const isAdminSessionExpired = () => {
  const storage = getSessionStorage();

  if (!storage) return true;

  const token = storage.getItem(TOKEN_KEY);
  const lastActivity = Number(storage.getItem(LAST_ACTIVITY_KEY) || 0);

  if (!token || !lastActivity) return true;

  return Date.now() - lastActivity > ADMIN_SESSION_TIMEOUT_MS;
};

export const getAdminToken = () => {
  const storage = getSessionStorage();

  if (!storage) return null;

  removeOldPersistentAdminStorage();

  if (isAdminSessionExpired()) {
    removeAdminToken();
    return null;
  }

  return storage.getItem(TOKEN_KEY);
};

export const setAdminToken = (token: string) => {
  const storage = getSessionStorage();

  if (!storage) return;

  removeOldPersistentAdminStorage();
  storage.setItem(TOKEN_KEY, token);
  touchAdminSession();
};

export const removeAdminToken = () => {
  const sessionStorage = getSessionStorage();
  const localStorage = getLocalStorage();

  sessionStorage?.removeItem(TOKEN_KEY);
  sessionStorage?.removeItem(ADMIN_KEY);
  sessionStorage?.removeItem(LAST_ACTIVITY_KEY);

  localStorage?.removeItem(TOKEN_KEY);
  localStorage?.removeItem(ADMIN_KEY);
  localStorage?.removeItem(LAST_ACTIVITY_KEY);
};

export const setAdminUser = (admin: AdminUser) => {
  const storage = getSessionStorage();

  if (!storage) return;

  storage.setItem(ADMIN_KEY, JSON.stringify(admin));
};

export const getAdminUser = (): AdminUser | null => {
  const storage = getSessionStorage();

  if (!storage || isAdminSessionExpired()) {
    removeAdminToken();
    return null;
  }

  const admin = storage.getItem(ADMIN_KEY);

  if (!admin) return null;

  try {
    return JSON.parse(admin);
  } catch {
    return null;
  }
};

export const logoutAdmin = () => {
  removeAdminToken();
};

export const startAdminInactivityWatcher = (onExpire: () => void) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const activityEvents = [
    "click",
    "keydown",
    "mousemove",
    "scroll",
    "touchstart",
  ];

  const markActive = () => {
    if (!isAdminSessionExpired()) {
      touchAdminSession();
    }
  };

  const checkSession = () => {
    if (isAdminSessionExpired()) {
      removeAdminToken();
      onExpire();
    }
  };

  activityEvents.forEach((eventName) => {
    window.addEventListener(eventName, markActive, { passive: true });
  });

  const intervalId = window.setInterval(checkSession, 30 * 1000);

  return () => {
    activityEvents.forEach((eventName) => {
      window.removeEventListener(eventName, markActive);
    });

    window.clearInterval(intervalId);
  };
};
