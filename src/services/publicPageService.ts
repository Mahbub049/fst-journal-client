import api from "@/lib/api";

export type PublicPageGroup = "about" | "for-authors" | "issues" | "custom";

export type PublicCmsPage = {
  _id: string;
  title: string;
  slug: string;
  group: PublicPageGroup;
  shortDescription?: string;
  order: number;
  isPublished: boolean;
};

type PublicPagesResponse = {
  success: boolean;
  pages: PublicCmsPage[];
};

export const getPublicPagesByGroup = async (group: PublicPageGroup) => {
  const { data } = await api.get<PublicPagesResponse>("/pages", {
    params: { group },
  });

  return data.pages || [];
};