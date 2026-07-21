import api from "@/lib/api";
import { getServerApiBaseUrl } from "@/lib/apiBase";

export type ContactPageContent = {
  _id?: string;
  showEyebrow: boolean;
  eyebrow: string;
  title: string;
  subtitle: string;
  contentTitle: string;
  contentHtml: string;
  officeEyebrow: string;
  officeTitle: string;
  officeDescription: string;
  publishedByLabel: string;
  publishedBy: string;
  institutionLabel: string;
  institution: string;
  addressLabel: string;
  address: string;
  emailLabel: string;
  email: string;
  phoneLabel: string;
  phone: string;
  supportEyebrow: string;
  supportTitle: string;
  supportDescription: string;
  supportEmail: string;
  emailButtonLabel: string;
  emailSubject: string;
  isPublished: boolean;
};

type ContactPageResponse = {
  success: boolean;
  data: ContactPageContent;
};

export const getPublicContactPage = async () => {
  const response = await fetch(`${getServerApiBaseUrl()}/contact-page`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new Error("Failed to fetch contact page.");
  const data = (await response.json()) as ContactPageResponse;
  return data.data;
};

export const getAdminContactPage = async () => {
  const { data } = await api.get<ContactPageResponse>("/contact-page/admin");
  return data.data;
};

export const updateAdminContactPage = async (payload: ContactPageContent) => {
  const { data } = await api.put<ContactPageResponse>("/contact-page/admin", payload);
  return data.data;
};
