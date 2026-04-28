import AdminLayout from "@/components/admin/AdminLayout";
import {
  FileText,
  Image,
  Newspaper,
  PenTool,
  Users,
} from "lucide-react";

const cards = [
  {
    title: "Pages",
    value: "Manage",
    description: "Edit About, For Authors, and other content pages.",
    icon: FileText,
  },
  {
    title: "Issues",
    value: "Manage",
    description: "Add journal issues, cover images, and archive details.",
    icon: Newspaper,
  },
  {
    title: "Articles",
    value: "Manage",
    description: "Add papers with authors, DOI, PDF, and issue mapping.",
    icon: PenTool,
  },
  {
    title: "Editorial Board",
    value: "Manage",
    description: "Control editor groups, profiles, images, and order.",
    icon: Users,
  },
  {
    title: "Media Library",
    value: "Upload",
    description: "Upload images and PDFs for different website sections.",
    icon: Image,
  },
];

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#005A78]">
          Admin CMS
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Welcome to the Journal Admin Panel
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          From here, you will manage homepage content, pages, issues, articles,
          editorial board members, call-for-papers information, images, PDFs,
          and button links.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#005A78]/10 text-[#005A78]">
                <Icon size={24} />
              </div>

              <h2 className="text-xl font-bold text-slate-950">
                {card.title}
              </h2>

              <p className="mt-1 text-sm font-semibold text-[#005A78]">
                {card.value}
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}