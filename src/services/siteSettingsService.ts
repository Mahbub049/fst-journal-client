import api from "@/lib/api";

export type UsefulLink = {
  _id?: string;
  label: string;
  url: string;
  group: string;
  order: number;
  isActive: boolean;
};

export type SocialLink = {
  _id?: string;
  platform: string;
  url: string;
  order: number;
  isActive: boolean;
};

export type AnnouncementItem = {
  _id?: string;
  text: string;
  url?: string;
  order: number;
  isActive: boolean;
};

export type SiteSettingsContent = {
  _id?: string;

  footerJournalTitle: string;
  footerJournalSubtitle: string;
  footerDescription: string;
  publisherLabel: string;
  publisherName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  copyrightText: string;
  footerCreditText: string;
  footerCreditUrl: string;

  journalInfoTitle: string;
  publishingModel: string;
  language: string;
  publicationFrequency: string;

  announcementItems: AnnouncementItem[];
  announcementSpeedSeconds: number;

  usefulLinks: UsefulLink[];
  socialLinks: SocialLink[];

  isPublished: boolean;

  createdAt?: string;
  updatedAt?: string;
};

type SiteSettingsResponse = {
  success: boolean;
  data: SiteSettingsContent;
};

export const getPublicSiteSettings = async () => {
  const { data } = await api.get<SiteSettingsResponse>("/site-settings", {
    headers: { "Cache-Control": "no-cache" },
    params: { _t: Date.now() },
  });

  return data.data;
};

export const getAdminSiteSettings = async () => {
  const { data } = await api.get<SiteSettingsResponse>(
    "/site-settings/admin",
    {
      headers: { "Cache-Control": "no-cache" },
      params: { _t: Date.now() },
    }
  );

  return data.data;
};

export const updateAdminSiteSettings = async (
  payload: SiteSettingsContent
) => {
  const { data } = await api.put<SiteSettingsResponse>(
    "/site-settings/admin",
    payload,
    {
      headers: { "Cache-Control": "no-cache" },
      params: { _t: Date.now() },
    }
  );

  return data.data;
};
