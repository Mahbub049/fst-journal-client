import api from "@/lib/api";

export type ImportantDate = {
  _id?: string;
  label: string;
  date: string;
  order: number;
  isActive: boolean;
};

export type CallForPaperTopic = {
  _id?: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
};

export type CallForPaperInstruction = {
  _id?: string;
  text: string;
  order: number;
  isActive: boolean;
};

export type CallForPaperContent = {
  _id?: string;

  title: string;
  subtitle: string;
  description: string;

  posterImage: string;
  pdfUrl: string;

  importantDates: ImportantDate[];

  submissionButtonLabel: string;
  submissionButtonLink: string;

  contactEmail: string;
  contactPhone: string;
  publisherInfo: string;

  topics: CallForPaperTopic[];
  instructions: CallForPaperInstruction[];

  isPublished: boolean;

  createdAt?: string;
  updatedAt?: string;
};

type CallForPaperResponse = {
  success: boolean;
  data: CallForPaperContent;
};

export const getAdminCallForPaper = async () => {
  const { data } = await api.get<CallForPaperResponse>(
    "/call-for-papers/admin"
  );

  return data.data;
};

export const updateAdminCallForPaper = async (
  payload: CallForPaperContent
) => {
  const { data } = await api.put<CallForPaperResponse>(
    "/call-for-papers/admin",
    payload
  );

  return data.data;
};