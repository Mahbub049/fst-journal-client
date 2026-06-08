"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ExternalLink, FileText, Loader2, Plus, Save, Trash2, Upload } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  CallForPaperContent,
  ImportantDate,
  getAdminCallForPaper,
  updateAdminCallForPaper,
} from "@/services/callForPaperService";
import { uploadMedia } from "@/services/mediaService";

const defaultForm: CallForPaperContent = {
  invitationLabel: "Publication Invitation",
  title: "Call for Papers",
  subtitle: "",
  description:
    "The Faculty of Science and Technology, Bangladesh University of Professionals, invites authors to submit original and high-quality manuscripts for the upcoming issue of the Journal of FST. The journal welcomes research contributions in engineering, computer science, communication technology, environmental science, management, and related interdisciplinary fields.",

  posterImage: "",
  pdfUrl: "/pdfs/call-for-papers.pdf",
  pdfTitle: "Call for Papers Document",
  pdfSubtitle: "Volume 4, Issue 1",

  submissionFormatLabel: "Submission Format",
  submissionFormatTitle: "Types of Manuscripts Accepted",
  submissionFormatDescription:
    "The journal welcomes different types of academic submissions. Manuscripts should present original contribution, clear methodology, proper academic writing, and relevance to the scope of the Faculty of Science and Technology.",
  submissionTypes: [
    "Full research articles",
    "Short communications",
    "Book reviews",
    "Policy analysis",
    "Review articles",
  ],

  scopeLabel: "Scope of Submission",
  scopeTitle: "Suggested Research Areas",
  scopeDescription:
    "Authors are encouraged to submit high-quality articles in the areas listed below. The scope covers Electrical and Electronic Engineering, Computer Science and Engineering, Information and Communication Technology, Environmental Science and Management, and other related areas.",
  engineeringTitle: "Engineering, ICT and Computing Areas",
  engineeringTopics: [
    "Electric Power Engineering",
    "Electric Machinery and Power Electronics",
    "Electro Physics and Applications",
    "Electric Material and Semiconductor",
    "High Power, High Voltage and Discharge",
    "Micro-Electro-Mechanical Systems (MEMS)",
    "Nanotechnology",
    "Microwave Engineering",
    "Radar and Satellite Communications",
    "Optical Fiber Communication",
    "Optical and EM Wave",
    "Sensors and Systems",
    "Signal Processing",
    "Robotics, Automation and Control",
    "Application of AI in Smart Education System",
    "Industrial Internet of Things (IIoT)",
    "Mobile Computing for Industry",
    "IoT and WSN for Smart City Applications",
    "Cloud Computing and Networking",
    "Grid and Metering Infrastructure",
    "Smart Transportation System",
    "Big Data and Machine Learning",
    "Natural Language Processing and Text Mining",
    "Data Mining for Biomedical Engineering",
    "Electronic Health Records and Standards",
    "Wearable and Body Implant Technologies",
    "ICT in Telemedicine",
    "Collaborative and Cooperative Education System",
    "Smart Learning System",
    "Cloud-IoT Platforms for Small to Large Scale Farming",
  ],
  environmentalTitle: "Environmental Science and Management Areas",
  environmentalTopics: [
    "Environmental Management",
    "Environmental Pollution and Mitigation",
    "Environmental Chemistry",
    "Environmental Engineering",
    "Environmental Modelling",
    "Environmental Economics",
    "Environmental Technology",
    "Biological Pollution in Environment",
    "Ecology and Biodiversity",
    "Earth Science",
    "Oceanography",
    "Environmental Policy and Governance",
    "Occupational Health and Safety",
    "Integrated Coastal Zone and Floodplain Management",
    "Climate Change Adaptation and Mitigation",
    "Disaster Risk Reduction and Disaster Management",
    "Sustainable Urban Planning and Development",
    "Sustainable Energy Management",
    "Agriculture and Environment",
  ],

  finalSectionLabel: "Final Accepted Papers",
  finalSectionTitle: "Final Submission Requirements",
  finalSectionDescription:
    "Authors must submit the final accepted article in both Word and LaTeX format. All figures should be submitted separately in both colour and grayscale versions. All finally accepted articles will be provided with a DOI.",

  importantInfoLabel: "Important Information",
  timelineTitle: "Current Issue Timeline",
  importantDates: [
    {
      label: "Manuscript Submission Deadline",
      date: "30 November 2026",
      order: 1,
      isActive: true,
    },
    {
      label: "Issue",
      date: "Volume 4, Issue 1",
      order: 2,
      isActive: true,
    },
    {
      label: "Publication Year",
      date: "2026",
      order: 3,
      isActive: true,
    },
    {
      label: "Submission Email",
      date: "journal.fst@bup.edu.bd",
      order: 4,
      isActive: true,
    },
  ],

  submitSectionLabel: "Submit Manuscript",
  submitTitle: "Ready to submit?",
  submitDescription:
    "Please review the author guidelines, manuscript structure, word limit, plagiarism requirement, and formatting rules before submission.",
  submissionButtonLabel: "Email Manuscript",
  submissionButtonLink: "mailto:journal.fst@bup.edu.bd",
  guidelinesButtonLabel: "View Submission Guidelines",
  guidelinesButtonLink: "/for-authors/submission-guidelines",

  contactSectionLabel: "Contact",
  contactTitle: "Editorial Office",
  contactEditorLabel: "Chief Editor",
  contactEditorName: "Brigadier General Sufi Md Ataur Rahman, ndc, psc",
  publishedByLabel: "Published By",
  publishedBy: "Faculty of Science and Technology",
  publisherName: "Bangladesh University of Professionals",
  publisherAddress: "Mirpur Cantonment, Dhaka - 1216",
  contactEmail: "journal.fst@bup.edu.bd",
  contactPhone: "",
  publisherInfo: "Bangladesh University of Professionals",

  isPublished: true,
};

const createImportantDate = (order: number): ImportantDate => ({
  label: "",
  date: "",
  order,
  isActive: true,
});

export default function AdminCallForPapersPage() {
  const [form, setForm] = useState<CallForPaperContent>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"pdf" | "poster" | "">("");
  const [message, setMessage] = useState("");

  const fetchCallForPaper = async () => {
    try {
      setLoading(true);
      const data = await getAdminCallForPaper();
      setForm({
        ...defaultForm,
        ...data,
        importantDates: data.importantDates?.length
          ? data.importantDates
          : defaultForm.importantDates,
        submissionTypes: data.submissionTypes?.length
          ? data.submissionTypes
          : defaultForm.submissionTypes,
        engineeringTopics: data.engineeringTopics?.length
          ? data.engineeringTopics
          : defaultForm.engineeringTopics,
        environmentalTopics: data.environmentalTopics?.length
          ? data.environmentalTopics
          : defaultForm.environmentalTopics,
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
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateListItem = (
    field: "submissionTypes" | "engineeringTopics" | "environmentalTopics",
    index: number,
    value: string
  ) => {
    const updated = [...form[field]];
    updated[index] = value;
    updateField(field, updated);
  };

  const addListItem = (
    field: "submissionTypes" | "engineeringTopics" | "environmentalTopics"
  ) => {
    updateField(field, [...form[field], ""]);
  };

  const removeListItem = (
    field: "submissionTypes" | "engineeringTopics" | "environmentalTopics",
    index: number
  ) => {
    updateField(
      field,
      form[field].filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const updateImportantDate = (
    index: number,
    field: keyof ImportantDate,
    value: string | boolean
  ) => {
    const updated = [...form.importantDates];
    updated[index] = { ...updated[index], [field]: value };
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
        .map((item, itemIndex) => ({ ...item, order: itemIndex + 1 }))
    );
  };

  const handleFileUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    type: "pdf" | "poster"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(type);
      setMessage("");

      const media = await uploadMedia({
        file,
        title: file.name,
        folder: type === "pdf" ? "call-for-papers/pdfs" : "call-for-papers/images",
      });

      updateField(type === "pdf" ? "pdfUrl" : "posterImage", media.fileUrl);
      setMessage(`${type === "pdf" ? "PDF" : "Poster image"} uploaded successfully.`);
    } catch {
      setMessage("Upload failed. Please try again.");
    } finally {
      setUploading("");
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const payload: CallForPaperContent = {
        ...form,
        importantDates: form.importantDates.map((item, index) => ({
          ...item,
          order: index + 1,
        })),
        submissionTypes: form.submissionTypes.filter((item) => item.trim()),
        engineeringTopics: form.engineeringTopics.filter((item) => item.trim()),
        environmentalTopics: form.environmentalTopics.filter((item) => item.trim()),
      };

      const updated = await updateAdminCallForPaper(payload);
      setForm({ ...defaultForm, ...updated });
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

  const Input = ({
    label,
    value,
    onChange,
    placeholder,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }) => (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
      />
    </div>
  );

  const Textarea = ({
    label,
    value,
    onChange,
    rows = 4,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    rows?: number;
  }) => (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
      />
    </div>
  );

  const ListEditor = ({
    title,
    field,
  }: {
    title: string;
    field: "submissionTypes" | "engineeringTopics" | "environmentalTopics";
  }) => (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <button
          type="button"
          onClick={() => addListItem(field)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#005A78] px-3 py-2 text-xs font-bold text-white"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {form[field].map((item, index) => (
          <div key={`${field}-${index}`} className="flex gap-2">
            <input
              value={item}
              onChange={(event) => updateListItem(field, index, event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
            />
            <button
              type="button"
              onClick={() => removeListItem(field, index)}
              className="rounded-xl border border-rose-200 bg-rose-50 px-3 text-rose-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#005A78]">
                Content Management
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">
                Call for Papers Management
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Manage the same public Call for Papers page content from the server.
              </p>
            </div>

            <a
              href="/call-for-papers"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:border-[#005A78] hover:text-[#005A78]"
            >
              <ExternalLink className="h-4 w-4" /> View Public Page
            </a>
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
                Publication Invitation
              </h2>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <Input label="Small Heading" value={form.invitationLabel} onChange={(value) => updateField("invitationLabel", value)} />
                <Input label="Page Title" value={form.title} onChange={(value) => updateField("title", value)} />
                <div className="lg:col-span-2">
                  <Textarea label="Description" value={form.description} rows={5} onChange={(value) => updateField("description", value)} />
                </div>
                <Input label="PDF Title" value={form.pdfTitle} onChange={(value) => updateField("pdfTitle", value)} />
                <Input label="PDF Subtitle" value={form.pdfSubtitle} onChange={(value) => updateField("pdfSubtitle", value)} />
                <div>
                  <Input label="PDF URL" value={form.pdfUrl} onChange={(value) => updateField("pdfUrl", value)} />
                  <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-[#005A78] hover:text-[#005A78]">
                    {uploading === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload PDF
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(event) => handleFileUpload(event, "pdf")}
                      className="hidden"
                    />
                  </label>
                  {form.pdfUrl && (
                    <a
                      href={form.pdfUrl}
                      target="_blank"
                      className="ml-3 inline-flex items-center gap-2 text-sm font-bold text-[#005A78]"
                    >
                      <FileText className="h-4 w-4" /> Open PDF
                    </a>
                  )}
                </div>
                <div>
                  <Input label="Poster Image URL" value={form.posterImage} onChange={(value) => updateField("posterImage", value)} />
                  <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-[#005A78] hover:text-[#005A78]">
                    {uploading === "poster" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload Poster
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleFileUpload(event, "poster")}
                      className="hidden"
                    />
                  </label>
                </div>
                <label className="flex min-h-[46px] items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(event) => updateField("isPublished", event.target.checked)}
                    className="h-4 w-4"
                  />
                  Visible through public API
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Submission Format
              </h2>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <Input label="Small Heading" value={form.submissionFormatLabel} onChange={(value) => updateField("submissionFormatLabel", value)} />
                <Input label="Section Title" value={form.submissionFormatTitle} onChange={(value) => updateField("submissionFormatTitle", value)} />
                <div className="lg:col-span-2">
                  <Textarea label="Description" value={form.submissionFormatDescription} onChange={(value) => updateField("submissionFormatDescription", value)} />
                </div>
                <div className="lg:col-span-2">
                  <ListEditor title="Types of Manuscripts Accepted" field="submissionTypes" />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Suggested Research Areas
              </h2>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <Input label="Small Heading" value={form.scopeLabel} onChange={(value) => updateField("scopeLabel", value)} />
                <Input label="Section Title" value={form.scopeTitle} onChange={(value) => updateField("scopeTitle", value)} />
                <div className="lg:col-span-2">
                  <Textarea label="Description" value={form.scopeDescription} onChange={(value) => updateField("scopeDescription", value)} />
                </div>
                <Input label="Engineering Area Title" value={form.engineeringTitle} onChange={(value) => updateField("engineeringTitle", value)} />
                <Input label="Environmental Area Title" value={form.environmentalTitle} onChange={(value) => updateField("environmentalTitle", value)} />
                <ListEditor title="Engineering, ICT and Computing Areas" field="engineeringTopics" />
                <ListEditor title="Environmental Science and Management Areas" field="environmentalTopics" />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Final Submission Requirements
              </h2>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <Input label="Small Heading" value={form.finalSectionLabel} onChange={(value) => updateField("finalSectionLabel", value)} />
                <Input label="Section Title" value={form.finalSectionTitle} onChange={(value) => updateField("finalSectionTitle", value)} />
                <div className="lg:col-span-2">
                  <Textarea label="Description" value={form.finalSectionDescription} onChange={(value) => updateField("finalSectionDescription", value)} />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-950">
                  Important Information Sidebar
                </h2>
                <button
                  type="button"
                  onClick={addImportantDate}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#005A78] px-4 py-2.5 text-sm font-bold text-white"
                >
                  <Plus className="h-4 w-4" /> Add Info
                </button>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <Input label="Small Heading" value={form.importantInfoLabel} onChange={(value) => updateField("importantInfoLabel", value)} />
                <Input label="Sidebar Title" value={form.timelineTitle} onChange={(value) => updateField("timelineTitle", value)} />
              </div>

              <div className="mt-5 space-y-4">
                {form.importantDates.map((item, index) => (
                  <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
                      <input
                        value={item.label}
                        onChange={(event) => updateImportantDate(index, "label", event.target.value)}
                        placeholder="Label"
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                      />
                      <input
                        value={item.date}
                        onChange={(event) => updateImportantDate(index, "date", event.target.value)}
                        placeholder="Value"
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
                        onChange={(event) => updateImportantDate(index, "isActive", event.target.checked)}
                      />
                      Active
                    </label>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Submit Manuscript Box
              </h2>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <Input label="Small Heading" value={form.submitSectionLabel} onChange={(value) => updateField("submitSectionLabel", value)} />
                <Input label="Box Title" value={form.submitTitle} onChange={(value) => updateField("submitTitle", value)} />
                <div className="lg:col-span-2">
                  <Textarea label="Description" value={form.submitDescription} onChange={(value) => updateField("submitDescription", value)} />
                </div>
                <Input label="Email Button Label" value={form.submissionButtonLabel} onChange={(value) => updateField("submissionButtonLabel", value)} />
                <Input label="Email Button Link" value={form.submissionButtonLink} onChange={(value) => updateField("submissionButtonLink", value)} />
                <Input label="Guidelines Button Label" value={form.guidelinesButtonLabel} onChange={(value) => updateField("guidelinesButtonLabel", value)} />
                <Input label="Guidelines Button Link" value={form.guidelinesButtonLink} onChange={(value) => updateField("guidelinesButtonLink", value)} />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Contact Box
              </h2>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <Input label="Small Heading" value={form.contactSectionLabel} onChange={(value) => updateField("contactSectionLabel", value)} />
                <Input label="Box Title" value={form.contactTitle} onChange={(value) => updateField("contactTitle", value)} />
                <Input label="Editor Label" value={form.contactEditorLabel} onChange={(value) => updateField("contactEditorLabel", value)} />
                <Input label="Editor Name" value={form.contactEditorName} onChange={(value) => updateField("contactEditorName", value)} />
                <Input label="Published By Label" value={form.publishedByLabel} onChange={(value) => updateField("publishedByLabel", value)} />
                <Input label="Published By" value={form.publishedBy} onChange={(value) => updateField("publishedBy", value)} />
                <Input label="Publisher Name" value={form.publisherName} onChange={(value) => updateField("publisherName", value)} />
                <Input label="Publisher Address" value={form.publisherAddress} onChange={(value) => updateField("publisherAddress", value)} />
                <Input label="Email" value={form.contactEmail} onChange={(value) => updateField("contactEmail", value)} />
                <Input label="Phone" value={form.contactPhone} onChange={(value) => updateField("contactPhone", value)} />
              </div>
            </section>

            <div className="sticky bottom-4 z-10 flex justify-end">
              <button
                type="submit"
                disabled={saving || uploading !== ""}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#005A78] px-6 py-4 text-sm font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Call for Papers
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
