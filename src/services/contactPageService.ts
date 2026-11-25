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
  showMap: boolean;
  mapTitle: string;
  mapQuery: string;
  mapEmbedUrl: string;
  mapHeight: number;
  isPublished: boolean;
};

export const isGoogleMapsEmbedUrl = (value: string): boolean => {
  if (!value.trim()) return true;
  if (value.length > 4096) return false;
  try {
    const url = new URL(value.trim());
    return (
      url.origin === "https://www.google.com" &&
      !url.username && !url.password &&
      url.pathname === "/maps/embed" &&
      Boolean(url.searchParams.get("pb"))
    );
  } catch {
    return false;
  }
};

export const getContactMap = (content: ContactPageContent) => {
  const query = content.mapQuery?.trim() ||
    [content.institution, content.address].map((value) => value?.trim()).filter(Boolean).join(", ") ||
    "Bangladesh University of Professionals, Mirpur Cantonment, Dhaka, Bangladesh";
  const customUrl = content.mapEmbedUrl?.trim();
  const embedUrl = customUrl && isGoogleMapsEmbedUrl(customUrl)
    ? customUrl
    : `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;
  const height = Number(content.mapHeight);
  return {
    query,
    embedUrl,
    height: Number.isFinite(height) ? Math.min(640, Math.max(260, height)) : 420,
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
  };
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
