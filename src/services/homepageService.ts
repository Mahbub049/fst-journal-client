import api from "@/lib/api";
import { showAdminSuccessToast } from "@/lib/adminToast";
import type { PublicDisplayScope } from "@/lib/publicDisplayScope";

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

export type HomepageLaunchModalLayout = "text" | "image-text" | "image";
export type HomepageLaunchModalFrequency =
  | "every-visit"
  | "once-per-session"
  | "once-per-day";

export type HomepageCelebrationStyle = "confetti" | "fireworks" | "both";
export type HomepageCelebrationFrequency = "once-per-session" | "every-page";

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
  executiveEditorsShowBiographyPreview: boolean;

  articlesSectionTitle: string;
  articlesSectionSubtitle: string;

  recentIssuesTitle: string;
  recentIssuesSubtitle: string;

  buttons: HomepageButton[];

  launchModalEnabled: boolean;
  launchModalLayout: HomepageLaunchModalLayout;
  launchModalEyebrow: string;
  launchModalTitle: string;
  launchModalMessage: string;
  launchModalImageUrl: string;
  launchModalImageAlt: string;
  launchModalPrimaryLabel: string;
  launchModalPrimaryUrl: string;
  launchModalSecondaryLabel: string;
  launchModalStartAt: string | null;
  launchModalEndAt: string | null;
  launchModalFrequency: HomepageLaunchModalFrequency;
  launchModalDismissible: boolean;
  launchModalAutoCloseSeconds: number;
  launchModalScope?: PublicDisplayScope;
  launchModalCustomPaths?: string[];

  celebrationEnabled: boolean;
  celebrationStyle: HomepageCelebrationStyle;
  celebrationDurationSeconds: number;
  celebrationFrequency: HomepageCelebrationFrequency;
  celebrationStartAt: string | null;
  celebrationEndAt: string | null;
  celebrationScope?: PublicDisplayScope;
  celebrationCustomPaths?: string[];

  isPublished: boolean;
};

export const getAdminHomepage = async () => {
  const { data } = await api.get("/homepage/admin");
  return data.homepage as HomepageContent;
};

export const updateAdminHomepage = async (payload: HomepageContent) => {
  const { data } = await api.put("/homepage/admin", payload);
  void showAdminSuccessToast("Homepage saved");
  return data.homepage as HomepageContent;
};
