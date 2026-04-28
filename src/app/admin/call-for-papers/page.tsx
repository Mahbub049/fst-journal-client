"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  CalendarDays,
  FileText,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  CallForPaperContent,
  CallForPaperInstruction,
  CallForPaperTopic,
  getAdminCallForPaper,
  ImportantDate,
  updateAdminCallForPaper,
} from "@/services/callForPaperService";

const emptyCallForPaper: CallForPaperContent = {
  title: "",
  subtitle: "",
  description: "",

  posterImage: "",
  pdfUrl: "",

  importantDates: [],

  submissionButtonLabel: "Submit Manuscript",
  submissionButtonLink: "",

  contactEmail: "",
  contactPhone: "",
  publisherInfo: "",

  topics: [],
  instructions: [],

  isPublished: true,
};

const createImportantDate = (order: number): ImportantDate => ({
  label: "",
  date: "",
  order,
  isActive: true,
});

const createTopic = (order: number): CallForPaperTopic => ({
  title: "",
  description: "",
  order,
  isActive: true,
});

const createInstruction = (order: number): CallForPaperInstruction => ({
  text: "",
  order,
  isActive: true,
});

export default function AdminCallForPapersPage() {
  const [form, setForm] = useState<CallForPaperContent>(emptyCallForPaper);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const fetchCallForPaper = async () => {
    try {
      setLoading(true);

      const data = await getAdminCallForPaper();

      setForm({
        ...emptyCallForPaper,
        ...data,
        importantDates: data.importantDates || [],
        topics: data.topics || [],
        instructions: data.instructions || [],
      });
    } catch {
      setMessage("Failed to load call for papers content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallForPaper();
  }, []);

  const updateField = <K extends keyof CallForPaperContent>(
    field: K,
    value: CallForPaperContent[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateImportantDate = (
    index: number,
    field: keyof ImportantDate,
    value: any
  ) => {
    const updated = [...form.importantDates];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    updateField("importantDates", updated);
  };

  const addImportantDate = () => {
    updateField("importantDates", [
      ...form.importantDates,
      createImportantDate(form.importantDates.length + 1),
    ]);
  };

  const removeImportantDate = (index: number) => {
    updateField(
      "importantDates",
      form.importantDates
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({
          ...item,
          order: itemIndex + 1,
        }))
    );
  };

  const updateTopic = (
    index: number,
    field: keyof CallForPaperTopic,
    value: any
  ) => {
    const updated = [...form.topics];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    updateField("topics", updated);
  };

  const addTopic = () => {
    updateField("topics", [...form.topics, createTopic(form.topics.length + 1)]);
  };

  const removeTopic = (index: number) => {
    updateField(
      "topics",
      form.topics
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({
          ...item,
          order: itemIndex + 1,
        }))
    );
  };

  const updateInstruction = (
    index: number,
    field: keyof CallForPaperInstruction,
    value: any
  ) => {
    const updated = [...form.instructions];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    updateField("instructions", updated);
  };

  const addInstruction = () => {
    updateField("instructions", [
      ...form.instructions,
      createInstruction(form.instructions.length + 1),
    ]);
  };

  const removeInstruction = (index: number) => {
    updateField(
      "instructions",
      form.instructions
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({
          ...item,
          order: itemIndex + 1,
        }))
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setMessage("Title is required.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const payload: CallForPaperContent = {
        ...form,
        importantDates: form.importantDates.map((item, index) => ({
          ...item,
          order: index + 1,
        })),
        topics: form.topics.map((item, index) => ({
          ...item,
          order: index + 1,
        })),
        instructions: form.instructions.map((item, index) => ({
          ...item,
          order: index + 1,
        })),
      };

      const updated = await updateAdminCallForPaper(payload);

      setForm({
        ...emptyCallForPaper,
        ...updated,
      });

      setMessage("Call for papers content updated successfully.");
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ||
          "Failed to update call for papers content."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#005A78]">
                Scrum 19
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">
                Call for Papers Management
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Manage title, description, poster, PDF, important dates,
                topics, instructions, contact details, and submission button.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              Public Call for Papers page will be connected later.
            </div>
          </div>
        </div>

        {message && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#005A78]" />
            <p className="mt-3 text-sm font-semibold text-slate-600">
              Loading call for papers content...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Main Content
              </h2>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Page Title
                  </label>
                  <input
                    value={form.title}
                    onChange={(event) =>
                      updateField("title", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Subtitle
                  </label>
                  <input
                    value={form.subtitle}
                    onChange={(event) =>
                      updateField("subtitle", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    rows={5}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Poster Image URL
                  </label>
                  <input
                    value={form.posterImage}
                    onChange={(event) =>
                      updateField("posterImage", event.target.value)
                    }
                    placeholder="Paste Cloudinary or image URL"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    PDF URL
                  </label>
                  <input
                    value={form.pdfUrl}
                    onChange={(event) =>
                      updateField("pdfUrl", event.target.value)
                    }
                    placeholder="Paste PDF URL"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Published Status
                  </label>
                  <label className="flex min-h-[46px] items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(event) =>
                        updateField("isPublished", event.target.checked)
                      }
                      className="h-4 w-4"
                    />
                    Visible through public API
                  </label>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Important Dates
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Add submission deadline, review date, publication date, etc.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addImportantDate}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#005A78] px-4 py-2.5 text-sm font-bold text-white"
                >
                  <CalendarDays className="h-4 w-4" />
                  Add Date
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {form.importantDates.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
                      <input
                        value={item.label}
                        onChange={(event) =>
                          updateImportantDate(
                            index,
                            "label",
                            event.target.value
                          )
                        }
                        placeholder="Label"
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                      />

                      <input
                        value={item.date}
                        onChange={(event) =>
                          updateImportantDate(
                            index,
                            "date",
                            event.target.value
                          )
                        }
                        placeholder="Date"
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                      />

                      <button
                        type="button"
                        onClick={() => removeImportantDate(index)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={item.isActive}
                        onChange={(event) =>
                          updateImportantDate(
                            index,
                            "isActive",
                            event.target.checked
                          )
                        }
                      />
                      Active
                    </label>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Submission & Contact
              </h2>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Submission Button Label
                  </label>
                  <input
                    value={form.submissionButtonLabel}
                    onChange={(event) =>
                      updateField("submissionButtonLabel", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Submission Button Link
                  </label>
                  <input
                    value={form.submissionButtonLink}
                    onChange={(event) =>
                      updateField("submissionButtonLink", event.target.value)
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(event) =>
                      updateField("contactEmail", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Contact Phone
                  </label>
                  <input
                    value={form.contactPhone}
                    onChange={(event) =>
                      updateField("contactPhone", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Publisher / Contact Information
                  </label>
                  <textarea
                    value={form.publisherInfo}
                    onChange={(event) =>
                      updateField("publisherInfo", event.target.value)
                    }
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Topic Cards
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Add CFP research topic areas.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addTopic}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#005A78] px-4 py-2.5 text-sm font-bold text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add Topic
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {form.topics.map((topic, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                      <input
                        value={topic.title}
                        onChange={(event) =>
                          updateTopic(index, "title", event.target.value)
                        }
                        placeholder="Topic title"
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                      />

                      <button
                        type="button"
                        onClick={() => removeTopic(index)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <textarea
                      value={topic.description}
                      onChange={(event) =>
                        updateTopic(index, "description", event.target.value)
                      }
                      rows={3}
                      placeholder="Topic description"
                      className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                    />

                    <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={topic.isActive}
                        onChange={(event) =>
                          updateTopic(index, "isActive", event.target.checked)
                        }
                      />
                      Active
                    </label>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Instruction Points
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Add manuscript submission instructions.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addInstruction}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#005A78] px-4 py-2.5 text-sm font-bold text-white"
                >
                  <FileText className="h-4 w-4" />
                  Add Instruction
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {form.instructions.map((instruction, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                      <input
                        value={instruction.text}
                        onChange={(event) =>
                          updateInstruction(index, "text", event.target.value)
                        }
                        placeholder="Instruction text"
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                      />

                      <button
                        type="button"
                        onClick={() => removeInstruction(index)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={instruction.isActive}
                        onChange={(event) =>
                          updateInstruction(
                            index,
                            "isActive",
                            event.target.checked
                          )
                        }
                      />
                      Active
                    </label>
                  </div>
                ))}
              </div>
            </section>

            <div className="sticky bottom-4 z-10 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#005A78] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:bg-[#004765] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving..." : "Save Call for Papers"}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}