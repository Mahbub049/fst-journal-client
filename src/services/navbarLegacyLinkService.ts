import api from "@/lib/api";

export type NavbarLegacyLinkPosition =
  | "before-search"
  | "between-search-submit"
  | "after-submit";

export type NavbarLegacyLinkSettings = {
  _id?: string;
  enabled: boolean;
  label: string;
  url: string;
  position: NavbarLegacyLinkPosition;
  openInNewTab: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type NavbarLegacyLinkResponse = {
  success: boolean;
  data: NavbarLegacyLinkSettings;
};

export const getPublicNavbarLegacyLinkSettings = async () => {
  const { data } = await api.get<NavbarLegacyLinkResponse>(
    "/site-settings/navbar-link",
    {
      headers: { "Cache-Control": "no-cache" },
      params: { _t: Date.now() },
    }
  );

  return data.data;
};

export const getAdminNavbarLegacyLinkSettings = async () => {
  const { data } = await api.get<NavbarLegacyLinkResponse>(
    "/site-settings/navbar-link/admin",
    {
      headers: { "Cache-Control": "no-cache" },
      params: { _t: Date.now() },
    }
  );

  return data.data;
};

export const updateAdminNavbarLegacyLinkSettings = async (
  payload: NavbarLegacyLinkSettings
) => {
  const { data } = await api.put<NavbarLegacyLinkResponse>(
    "/site-settings/navbar-link/admin",
    payload,
    {
      headers: { "Cache-Control": "no-cache" },
      params: { _t: Date.now() },
    }
  );

  return data.data;
};
