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
};