"use client";

import { FormEvent, useEffect, useState } from "react";
import { ExternalLink, Loader2, Save } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import RichTextEditor from "@/components/admin/RichTextEditor";
import {
  ContactPageContent,
  getAdminContactPage,
  updateAdminContactPage,
} from "@/services/contactPageService";

const defaultForm: ContactPageContent = {
  showEyebrow: true,
  eyebrow: "Contact",
  title: "Contact Us",
  subtitle: "Contact information for journal communication.",
  contentTitle: "Contact Us",
  contentHtml:
    "For journal-related communication, authors and readers may contact the editorial office through journal.fst@bup.edu.bd.",
  officeEyebrow: "Editorial Office",
  officeTitle: "Editorial Office",
  officeDescription:
    "For any queries regarding manuscript submission, processing, or publication requirements, please contact the Editorial Office.",
  publishedByLabel: "Published By",
  publishedBy: "Journal of Faculty of Science & Technology",
  institutionLabel: "Institution",
  institution: "Bangladesh University of Professionals",
  addressLabel: "Address",
  address: "Mirpur Cantonment, Dhaka - 1216",
  emailLabel: "Email",
  email: "editor.fstjournal@bup.edu.bd",
  phoneLabel: "Phone",
  phone: "",
  supportEyebrow: "Office Note",
  supportTitle: "Author Support",
  supportDescription:
    "For any queries regarding manuscript submission, processing, or publication requirements, please contact the Editorial Office.",
  supportEmail: "editor.fstjournal@bup.edu.bd",
  emailButtonLabel: "Email Editorial Office",
  emailSubject: "Journal of FST editorial office inquiry",
  isPublished: true,
};

type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function TextInput({ label, value, onChange, placeholder }: InputProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
      />
    </div>
  );
}

function TextArea({ label, value, onChange }: InputProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
      />
    </div>
  );
}

export default function AdminContactPage() {
  const [form, setForm] = useState<ContactPageContent>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAdminContactPage();
        setForm({ ...defaultForm, ...data });
      } catch {
        setMessage("Failed to load contact page settings.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const updateField = <K extends keyof ContactPageContent>(
    field: K,
    value: ContactPageContent[K]
  ) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true);
      setMessage("");
      const updated = await updateAdminContactPage(form);
      setForm({ ...defaultForm, ...updated });
      setMessage("Contact page updated successfully.");
    } catch {
      setMessage("Failed to update contact page.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#005A78]">
              Website Content
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">
              Contact Page Management
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Edit every heading, description, office detail, label, and email action shown on the public Contact Us page.
            </p>
          </div>
          <a
            href="/contact"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <ExternalLink size={16} /> View Public Page
          </a>
        </section>

        {message ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-sm">
            {message}
          </div>
        ) : null}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-3xl border border-slate-200 bg-white">
            <Loader2 className="h-7 w-7 animate-spin text-[#005A78]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">Page Header</h2>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <label className="lg:col-span-2 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.showEyebrow !== false}
                    onChange={(event) => updateField("showEyebrow", event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#005A78]"
                  />
                  <span>
                    Show the small heading above the page title
                    <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">
                      When disabled, the small heading is removed and the main title moves up without leaving blank space.
                    </span>
                  </span>
                </label>
                <TextInput label="Small Heading" value={form.eyebrow} onChange={(value) => updateField("eyebrow", value)} />
                <TextInput label="Page Title" value={form.title} onChange={(value) => updateField("title", value)} />
                <div className="lg:col-span-2">
                  <TextArea label="Page Subtitle" value={form.subtitle} onChange={(value) => updateField("subtitle", value)} />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">Main Contact Content</h2>
              <div className="mt-5 space-y-4">
                <TextInput label="Content Title" value={form.contentTitle} onChange={(value) => updateField("contentTitle", value)} />
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Content
                  </label>
                  <RichTextEditor
                    value={form.contentHtml}
                    onChange={(value) => updateField("contentHtml", value)}
                    minHeight={170}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">Editorial Office</h2>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <TextInput label="Small Heading" value={form.officeEyebrow} onChange={(value) => updateField("officeEyebrow", value)} />
                <TextInput label="Office Title" value={form.officeTitle} onChange={(value) => updateField("officeTitle", value)} />
                <div className="lg:col-span-2">
                  <TextArea label="Office Description" value={form.officeDescription} onChange={(value) => updateField("officeDescription", value)} />
                </div>
                <TextInput label="Published By Label" value={form.publishedByLabel} onChange={(value) => updateField("publishedByLabel", value)} />
                <TextInput label="Published By Value" value={form.publishedBy} onChange={(value) => updateField("publishedBy", value)} />
                <TextInput label="Institution Label" value={form.institutionLabel} onChange={(value) => updateField("institutionLabel", value)} />
                <TextInput label="Institution Value" value={form.institution} onChange={(value) => updateField("institution", value)} />
                <TextInput label="Address Label" value={form.addressLabel} onChange={(value) => updateField("addressLabel", value)} />
                <TextInput label="Address" value={form.address} onChange={(value) => updateField("address", value)} />
                <TextInput label="Email Label" value={form.emailLabel} onChange={(value) => updateField("emailLabel", value)} />
                <TextInput label="Email Address" value={form.email} onChange={(value) => updateField("email", value)} />
                <TextInput label="Phone Label" value={form.phoneLabel} onChange={(value) => updateField("phoneLabel", value)} />
                <TextInput label="Phone Number" value={form.phone} onChange={(value) => updateField("phone", value)} />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">Author Support Box</h2>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <TextInput label="Small Heading" value={form.supportEyebrow} onChange={(value) => updateField("supportEyebrow", value)} />
                <TextInput label="Box Title" value={form.supportTitle} onChange={(value) => updateField("supportTitle", value)} />
                <div className="lg:col-span-2">
                  <TextArea label="Box Description" value={form.supportDescription} onChange={(value) => updateField("supportDescription", value)} />
                </div>
                <TextInput label="Recipient Email Address" value={form.supportEmail} onChange={(value) => updateField("supportEmail", value)} placeholder="editorial.office@example.com" />
                <TextInput label="Email Button Label" value={form.emailButtonLabel} onChange={(value) => updateField("emailButtonLabel", value)} />
                <div className="lg:col-span-2">
                  <TextInput label="Pre-filled Email Subject" value={form.emailSubject} onChange={(value) => updateField("emailSubject", value)} />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(event) => updateField("isPublished", event.target.checked)}
                />
                Visible through public API
              </label>
            </section>

            <div className="sticky bottom-4 z-10 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#005A78] px-6 py-4 text-sm font-bold text-white shadow-lg disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Contact Page
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
