import api from "@/lib/api";

export type MediaItem = {
  _id: string;
  title: string;
  fileUrl: string;
  publicId: string;
  fileType: "image" | "pdf" | "document" | "other";
  mimeType: string;
  size: number;
  folder: string;
  createdAt: string;
  updatedAt: string;
};

export const getMedia = async (params?: {
  type?: string;
  folder?: string;
}) => {
  const { data } = await api.get("/media", {
    params,
  });

  return data.media as MediaItem[];
};

export const uploadMedia = async (payload: {
  file: File;
  title?: string;
  folder?: string;
}) => {
  const formData = new FormData();

  formData.append("file", payload.file);
  formData.append("title", payload.title || payload.file.name);
  formData.append("folder", payload.folder || "general");

  const { data } = await api.post("/media/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data.media as MediaItem;
};

export const deleteMedia = async (id: string) => {
  const { data } = await api.delete(`/media/${id}`);
  return data;
};