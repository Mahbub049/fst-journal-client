import { getServerApiBaseUrl } from "@/lib/apiBase";

export type PublicPageGroup = "about" | "for-authors" | "reviewers" | "issues" | "custom";

export type CmsButtonIcon =
  | "none"
  | "download"
  | "pdf"
  | "latex"
  | "document"
  | "submit"
  | "external"
  | "arrow-right"
  | "arrow-up-right";
export type CmsButtonVariant = "primary" | "secondary" | "outline" | "light";
export type CmsButtonLayout = "vertical" | "horizontal";
export type CmsPageActionButton = {
  _id?: string;
  label: string;
  url: string;
  icon: CmsButtonIcon;
  variant: CmsButtonVariant;
  openInNewTab: boolean;
  order: number;
  isActive: boolean;
};

export type PublicContentBlockType =
  | "paragraph"
  | "heading"
  | "list"
  | "card"
  | "section"
  | "columns"
  | "quote"
  | "notice"
  | "image"
  | "pdf"
  | "button"
  | "video"
  | "table"
  | "code"
  | "divider"
  | "spacer";

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
  showButton?: boolean;
  buttonIcon?: CmsButtonIcon;
  buttonVariant?: CmsButtonVariant;
  buttonOpenInNewTab?: boolean;
  caption?: string;
  altText?: string;
  codeLanguage?: string;
  style?: {
    alignment?: "left" | "center" | "right" | "justify";
    backgroundColor?: string;
    textColor?: string;
    width?: "full" | "wide" | "normal" | "narrow";
    padding?: "none" | "small" | "medium" | "large";
    columns?: number;
    headingLevel?: number;
    variant?: string;
    buttonLayout?: CmsButtonLayout;
  };
  children?: PublicContentBlock[];
  order: number;
  isActive: boolean;
};

export type PublicCmsPage = {
  _id: string;
  title: string;
  slug: string;
  group: PublicPageGroup;
  showTopLabel?: boolean;
  subtitle?: string;
  bannerImage?: string;
  shortDescription?: string;
  contentBlocks?: PublicContentBlock[];
  buttonLabel?: string;
  buttonUrl?: string;
  showButton?: boolean;
  buttonIcon?: CmsButtonIcon;
  buttonVariant?: CmsButtonVariant;
  buttonOpenInNewTab?: boolean;
  showHelpCard?: boolean;
  helpCardTitle?: string;
  helpCardContent?: string;
  helpCardButtonLayout?: CmsButtonLayout;
  helpCardButtons?: CmsPageActionButton[];
  metaTitle?: string;
  metaDescription?: string;
  order: number;
  isPublished: boolean;
};

type PublicPagesResponse = { success: boolean; pages: PublicCmsPage[] };
type PublicPageResponse = { success: boolean; page: PublicCmsPage };

const fetchPublicPageApi = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${getServerApiBaseUrl()}${path}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
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
