"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  File,
  FileText,
  ImageIcon,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  deleteMedia,
  getMedia,
  MediaItem,
  uploadMedia,
} from "@/services/mediaService";
import { formatFileSize } from "@/lib/formatFileSize";

const folders = [
  "general",
  "homepage",
  "issues",
  "articles",
  "editorial-board",
  "call-for-papers",
  "for-authors",
  "about",
];

const typeFilters = [
  {
    label: "All",
    value: "",
  },
  {
    label: "Images",
    value: "image",
  },
  {
    label: "PDF",
    value: "pdf",
  },
  {
    label: "Documents",
    value: "document",
  },
];

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [selectedType, setSelectedType] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("");

  const [title, setTitle] = useState("");
  const [folder, setFolder] = useState("general");
  const [file, setFile] = useState<File | null>(null);

  const [message, setMessage] = useState("");
  const [copiedId, setCopiedId] = useState("");

  const fetchMedia = async () => {
    try {
      setLoading(true);

      const data = await getMedia({
        type: selectedType || undefined,
        folder: selectedFolder || undefined,
      });

      setMedia(data);
    } catch (error) {
      setMessage("Failed to load media files.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [selectedType, selectedFolder]);

  const filePreviewName = useMemo(() => {
    if (!file) return "No file selected";
    return file.name;
  }, [file]);

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      await uploadMedia({
        file,
        title: title || file.name,
        folder,
      });

      setTitle("");
      setFolder("general");
      setFile(null);

      const fileInput = document.getElementById(
        "media-file-input"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      setMessage("File uploaded successfully.");

      await fetchMedia();
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ||
          "Upload failed. Check Cloudinary credentials and file type."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = async (item: MediaItem) => {
    try {
      await navigator.clipboard.writeText(item.fileUrl);
      setCopiedId(item._id);

      setTimeout(() => {
        setCopiedId("");
      }, 1200);
    } catch {
      setMessage("Could not copy URL.");
    }
  };

  const handleDelete = async (item: MediaItem) => {
    const confirmDelete = window.confirm(
      `Delete "${item.title}" from media library?`
    );

    if (!confirmDelete) return;

    try {
      await deleteMedia(item._id);
      setMessage("Media deleted successfully.");
      await fetchMedia();
    } catch {
      setMessage("Failed to delete media.");
    }
  };

  const renderMediaIcon = (item: MediaItem) => {
    if (item.fileType === "image") {
      return <ImageIcon size={22} />;
    }

    if (item.fileType === "pdf") {
      return <FileText size={22} />;
    }

    return <File size={22} />;
  };

  return (
    <AdminLayout>
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#005A78]">
              Media Library
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Upload Images, PDFs, and Documents
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              Use this library for journal cover images, issue covers, editor
              photos, call-for-papers posters, author guideline PDFs, and article
              PDFs.
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm">
          {message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#005A78]/10 text-[#005A78]">
              <Upload size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Upload New File
              </h2>
              <p className="text-sm text-slate-500">
                Images, PDFs, DOC, and DOCX are allowed.
              </p>
            </div>
          </div>

          <form onSubmit={handleUpload} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                File Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: Call for Papers Poster"
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#005A78] focus:ring-4 focus:ring-[#005A78]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Folder
              </label>

              <select
                value={folder}
                onChange={(event) => setFolder(event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#005A78] focus:ring-4 focus:ring-[#005A78]/10"
              >
                {folders.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Select File
              </label>

              <label
                htmlFor="media-file-input"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center transition hover:border-[#005A78]/50 hover:bg-[#005A78]/5"
              >
                <Upload className="mb-3 text-[#005A78]" size={30} />

                <span className="text-sm font-bold text-slate-700">
                  Click to choose a file
                </span>

                <span className="mt-2 max-w-full truncate text-xs text-slate-500">
                  {filePreviewName}
                </span>

                <input
                  id="media-file-input"
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(event) => {
                    const selected = event.target.files?.[0] || null;
                    setFile(selected);

                    if (selected && !title) {
                      setTitle(selected.name);
                    }
                  }}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#005A78] text-sm font-bold text-white transition hover:bg-[#00465d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload File
                </>
              )}
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Uploaded Media
              </h2>
              <p className="text-sm text-slate-500">
                Copy media URLs and use them in CMS forms.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#005A78]"
              >
                {typeFilters.map((item) => (
                  <option key={item.label} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedFolder}
                onChange={(event) => setSelectedFolder(event.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#005A78]"
              >
                <option value="">All folders</option>
                {folders.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto animate-spin text-[#005A78]" />
                <p className="mt-3 text-sm font-semibold text-slate-600">
                  Loading media...
                </p>
              </div>
            </div>
          ) : media.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <div>
                <ImageIcon className="mx-auto text-slate-400" size={36} />
                <h3 className="mt-4 text-lg font-bold text-slate-800">
                  No media found
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Upload your first image, PDF, or document from the left panel.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {media.map((item) => (
                <div
                  key={item._id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex h-44 items-center justify-center bg-slate-100">
                    {item.fileType === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.fileUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#005A78] shadow-sm">
                        {renderMediaIcon(item)}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="line-clamp-1 text-sm font-bold text-slate-950">
                      {item.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1">
                        {item.fileType}
                      </span>

                      <span className="rounded-full bg-slate-100 px-2.5 py-1">
                        {item.folder}
                      </span>

                      <span className="rounded-full bg-slate-100 px-2.5 py-1">
                        {formatFileSize(item.size)}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(item)}
                        className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        {copiedId === item._id ? (
                          <>
                            <Check size={15} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={15} />
                            Copy URL
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>

                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 block truncate text-xs font-semibold text-[#005A78] hover:underline"
                    >
                      Open file
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}