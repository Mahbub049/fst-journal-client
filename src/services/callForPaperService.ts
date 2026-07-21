import api from "@/lib/api";

export type ImportantDate = {
  _id?: string;
  label: string;
  date: string;
  order: number;
  isActive: boolean;
};

export type SubmissionType = {
  _id?: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
};

export type CallForPaperContent = {
  _id?: string;

  showInvitationLabel: boolean;
  invitationLabel: string;
  title: string;
  subtitle: string;
  description: string;
  descriptionWidth: "normal" | "full";
  descriptionAlignment: "left" | "center" | "right" | "justify";

  posterImage: string;
  pdfUrl: string;
  pdfTitle: string;
  pdfSubtitle: string;
  showPdfActionButton: boolean;
  pdfActionButtonLabel: string;
  pdfActionButtonLink: string;
  showPdfActionButtonIcon: boolean;
  showEmbeddedPdfViewer: boolean;

  submissionFormatLabel: string;
  submissionFormatTitle: string;
  submissionFormatDescription: string;
  submissionTypes: string[];
  submissionTypeDetails: SubmissionType[];

  scopeLabel: string;
  scopeTitle: string;
  scopeDescription: string;
  engineeringTitle: string;
  engineeringTopics: string[];
  environmentalTitle: string;
  environmentalTopics: string[];

  finalSectionLabel: string;
  finalSectionTitle: string;
  finalSectionDescription: string;

  importantInfoLabel: string;
  timelineTitle: string;
  importantDates: ImportantDate[];

  submitSectionLabel: string;
  submitTitle: string;
  submitDescription: string;
  submissionButtonLabel: string;
  submissionButtonLink: string;
  guidelinesButtonLabel: string;
  guidelinesButtonLink: string;

  contactSectionLabel: string;
  contactTitle: string;
  contactEditorLabel: string;
  contactEditorName: string;
  publishedByLabel: string;
  publishedBy: string;
  publisherName: string;
  publisherAddress: string;
  contactEmail: string;
  contactPhone: string;
  publisherInfo: string;

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


export const uploadAdminCallForPaperPdf = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.put<CallForPaperResponse>(
    "/call-for-papers/admin/pdf",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data.data;
};
