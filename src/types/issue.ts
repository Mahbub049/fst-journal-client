export type Issue = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  issn: string;
  volume: string;
  issueNumber: string;
  publishDateLabel: string;
  coverImage: string;
  pdfUrl?: string;
  isRecent: boolean;
  isPublished: boolean;
  order: number;

  createdAt?: string;
  updatedAt?: string;
};

export type PopulatedIssue = {
  _id: string;
  title: string;
  slug: string;
  volume: string;
  issueNumber: string;
  publishDateLabel: string;
  issn: string;
  category: string;
};

export type Article = {
  _id: string;

  // Sometimes issueId is only MongoDB ObjectId string.
  // For homepage articles, backend populate() returns issue object.
  issueId: string | PopulatedIssue;

  title: string;
  slug: string;
  authors: string[];
  abstract: string;
  keywords: string[];
  pages: string;
  pdfUrl: string;
  order: number;
  isPublished: boolean;

  articleId?: string;
  articleUrl?: string;
  doi?: string;
  publishDate?: string;
  views?: number;
  downloads?: number;

  // Needed for homepage tabs
  citations?: number;
  status?: "published" | "inPress";
  articleType?: string;
  accessType?: string;
};

export type IssueDetailsResponse = {
  issue: Issue;
  articles: Article[];
};

export type ArticleDetailsResponse = {
  issue: Issue;
  article: Article;
};