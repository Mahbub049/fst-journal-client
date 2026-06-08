import api from "@/lib/api";

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

export const getPublicPagesByGroup = async (group: PublicPageGroup) => {
  const { data } = await api.get<PublicPagesResponse>("/pages", {
    params: { group },
  });

  return data.pages || [];
};

export const getPublicPageByGroupAndSlug = async (
  group: PublicPageGroup,
  slug: string
) => {
  const { data } = await api.get<PublicPageResponse>(`/pages/${group}/${slug}`);
  return data.page;
};
