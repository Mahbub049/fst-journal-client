import api from "@/lib/api";

export type HomepageMetric = {
  _id?: string;
  label: string;
  value: string;
  description?: string;
  order: number;
  isActive: boolean;
};

export type HomepageInfoItem = {
  _id?: string;
  label: string;
  value: string;
  order: number;
  isActive: boolean;
};

export type HomepageButton = {
  _id?: string;
  label: string;
  url: string;
  variant: "primary" | "secondary";
  order: number;
  isActive: boolean;
};

export type HomepageCarouselImage = {
  _id?: string;
  imageUrl: string;
  altText: string;
  order: number;
  isActive: boolean;
};

export type HomepageContent = {
  _id?: string;
  heroTitle: string;
  heroSubtitle: string;
  journalCoverImage: string;
  publishingModel: string;
  issnPrint: string;
  issnOnline: string;

  metrics: HomepageMetric[];

  overviewTitle: string;
  overviewContent: string;

  countdownEnabled: boolean;
  countdownTitle: string;
  countdownTargetDate: string | null;
  countdownExpiredText: string;

  carouselEnabled: boolean;
  carouselIntervalSeconds: number;
  carouselImages: HomepageCarouselImage[];

  journalInfoTitle: string;
  journalInfoItems: HomepageInfoItem[];

  executiveEditorsTitle: string;
  executiveEditorsSubtitle: string;

  articlesSectionTitle: string;
  articlesSectionSubtitle: string;

  recentIssuesTitle: string;
  recentIssuesSubtitle: string;

  buttons: HomepageButton[];

  isPublished: boolean;
};

export const getAdminHomepage = async () => {
  const { data } = await api.get("/homepage/admin");
  return data.homepage as HomepageContent;
};

export const updateAdminHomepage = async (payload: HomepageContent) => {
  const { data } = await api.put("/homepage/admin", payload);
  return data.homepage as HomepageContent;
};
