export const getAdminToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bup_fst_journal_admin_token");
};

export const setAdminToken = (token: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("bup_fst_journal_admin_token", token);
};

export const removeAdminToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("bup_fst_journal_admin_token");
};