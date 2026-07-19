import { getServerApiBaseUrl } from "@/lib/apiBase";

export type PublicPageGroup = "about" | "for-authors" | "issues" | "custom";

export type PublicContentBlockType =
  | "paragraph"
  | "heading"
  | "list"
  | "card"
  | "image"
  | "pdf"
  | "button";

export type PublicContentBlock = {
  _id?: string;
  type: PublicContentBlockType;
  title?: string;
  content?: string;
  items?: string[];
  imageUrl?: string;
  fileUrl?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  order: number;
  isActive: boolean;
};

export type PublicCmsPage = {
  _id: string;
  title: string;
  slug: string;
  group: PublicPageGroup;
  subtitle?: string;
  bannerImage?: string;
  shortDescription?: string;
  contentBlocks?: PublicContentBlock[];
  buttonLabel?: string;
  buttonUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  order: number;
  isPublished: boolean;
};

type PublicPagesResponse = {
  success: boolean;
  pages: PublicCmsPage[];
};

type PublicPageResponse = {
  success: boolean;
  page: PublicCmsPage;
};

const fetchPublicPageApi = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${getServerApiBaseUrl()}${path}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Public page API request failed with ${response.status}.`);
  }

  return (await response.json()) as T;
};

export const getPublicPagesByGroup = async (group: PublicPageGroup) => {
  const query = new URLSearchParams({ group });
  const data = await fetchPublicPageApi<PublicPagesResponse>(
    `/pages?${query.toString()}`
  );

  return data.pages || [];
};

export const getPublicPageByGroupAndSlug = async (
  group: PublicPageGroup,
  slug: string
) => {
  const data = await fetchPublicPageApi<PublicPageResponse>(
    `/pages/${encodeURIComponent(group)}/${encodeURIComponent(slug)}`
  );

  return data.page;
};
