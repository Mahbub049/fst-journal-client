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

export type SiteSettingsContent = {
  _id?: string;

  footerDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  copyrightText: string;

  journalInfoTitle: string;
  publisherName: string;
  publishingModel: string;
  language: string;
  publicationFrequency: string;

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

export const getAdminSiteSettings = async () => {
  const { data } = await api.get<SiteSettingsResponse>(
    "/site-settings/admin"
  );

  return data.data;
};

export const updateAdminSiteSettings = async (
  payload: SiteSettingsContent
) => {
  const { data } = await api.put<SiteSettingsResponse>(
    "/site-settings/admin",
    payload
  );

  return data.data;
};