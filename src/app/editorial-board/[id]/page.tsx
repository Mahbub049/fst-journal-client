import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Mail,
} from "lucide-react";
import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";
import {
  EditorialBoardMember,
  EditorialBoardPageSettings,
  getPublicEditorialBoardById,
  getPublicEditorialBoardConfig,
} from "@/services/editorialBoardService";

export const dynamic = "force-dynamic";

const fallbackConfig: EditorialBoardPageSettings = {
  eyebrow: "Editorial Leadership",
  pageTitle: "Editorial Board",
  intro: "",
  summaryEyebrow: "Board Summary",
  summaryTitle: "Editorial Review Structure",
  summaryDescription: "",
  chiefEditorResponsibilityTitle: "Chief Editor Responsibilities",
  chiefEditorResponsibilityDescription:
    "Our chief editor is accountable for the overall direction of the journal, ensuring that published work is of the highest quality, follows BUP publication policies and procedures, and advances the journal's editorial mission.",
  showSummaryCards: true,
  showTotalCard: true,
  editorialOfficeTitle: "Editorial Office",
  editorialOfficeDescription: "",
  editorialOfficePublisher: "",
  editorialOfficeInstitution: "",
  editorialOfficeAddress: "",
  editorialOfficeEmail: "",
  editorialOfficePhone: "",
  categories: [],
  editorialAreas: [],
};

const isChiefEditorRole = (value?: string) => {
  const normalized = (value || "")
    .toLowerCase()
    .replace(/[^a-z]+/g, " ")
    .trim();

  return normalized === "chief editor" || normalized === "editor in chief";
};

const normalizeExternalHref = (value?: string) => {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const getInitials = (name: string) =>
  name
    .replace(/Dr\.|Professor|Prof\.|Major General|Brigadier General/gi, "")
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

function formatBiography(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default async function EditorialMemberDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let member: EditorialBoardMember | null = null;
  let config = fallbackConfig;

  const [memberResult, configResult] = await Promise.allSettled([
    getPublicEditorialBoardById(id),
    getPublicEditorialBoardConfig(),
  ]);

  if (memberResult.status === "fulfilled") member = memberResult.value;
  if (configResult.status === "fulfilled") {
    config = { ...fallbackConfig, ...configResult.value };
  }

  if (!member || !member.isActive) notFound();

  const imageUrl = member.profileImage?.trim();
  const biographyParagraphs = formatBiography(member.bio || "");
  const professionalProfileUrl = normalizeExternalHref(
    member.professionalProfileUrl
  );
  const externalBiographyUrl = normalizeExternalHref(member.biographyUrl);
  const chiefEditor = isChiefEditorRole(member.category);

  return (
    <PublicLayout>
      <main className="min-h-screen bg-[#f7f8fb]">
        <section className="border-b border-slate-200 bg-white">
          <Container className="py-10 md:py-14">
            <Link
              href="/editorial-board"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#005A78] hover:underline"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to Editorial Board
            </Link>

            <p className="journal-subheading mt-8">{member.category}</p>
            <h1
              className="mt-3 max-w-4xl text-[36px] font-semibold leading-tight tracking-tight text-slate-950 md:text-[54px]"
              style={{ fontFamily: "var(--font-source-serif)" }}
            >
              {member.name}
            </h1>

            {member.designation ? (
              <p className="mt-4 text-lg font-semibold text-[#005A78]">
                {member.designation}
              </p>
            ) : null}
          </Container>
        </section>

        <Container className="py-10 md:py-14">
          <article className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
            <div className="grid lg:min-h-[520px] lg:grid-cols-[330px_minmax(0,1fr)]">
              <div className="h-[420px] overflow-hidden border-b border-slate-200 bg-slate-100 lg:h-full lg:min-h-[520px] lg:border-b-0 lg:border-r">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={member.name}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[72px] font-bold text-[#111433]">
                    {getInitials(member.name)}
                  </div>
                )}
              </div>

              <div className="p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex rounded-full bg-[#eef8fc] px-3 py-1.5 text-xs font-semibold text-[#005A78]">
                      {member.category}
                    </span>

                    <div className="mt-5 space-y-2 text-[15px] leading-7 text-slate-600">
                      {member.department ? <p>{member.department}</p> : null}
                      {member.institution ? <p>{member.institution}</p> : null}
                    </div>
                  </div>
                </div>

                {member.expertise?.length ? (
                  <section className="mt-8">
                    <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
                      Area of Expertise
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {member.expertise.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </section>
                ) : null}

                {chiefEditor && config.chiefEditorResponsibilityDescription ? (
                  <section className="mt-8 rounded-2xl border border-[#005A78]/15 bg-[#eef8fc] p-5">
                    <h2 className="text-base font-bold text-slate-950">
                      {config.chiefEditorResponsibilityTitle ||
                        "Chief Editor Responsibilities"}
                    </h2>
                    <p className="mt-3 text-[15px] leading-8 text-slate-600">
                      {config.chiefEditorResponsibilityDescription}
                    </p>
                  </section>
                ) : null}

                {biographyParagraphs.length ? (
                  <section className="mt-8">
                    <h2
                      className="text-[28px] font-semibold text-slate-950"
                      style={{ fontFamily: "var(--font-source-serif)" }}
                    >
                      Biography
                    </h2>
                    <div className="mt-4 space-y-4 text-[15px] leading-8 text-slate-600 md:text-justify">
                      {biographyParagraphs.map((paragraph, index) => (
                        <p key={`${index}-${paragraph.slice(0, 24)}`}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                ) : null}

                <div className="mt-9 flex flex-wrap gap-3">
                  {professionalProfileUrl ? (
                    <a
                      href={professionalProfileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-[#005A78] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#004862]"
                    >
                      View Professional Profile
                      <ExternalLink size={15} aria-hidden="true" />
                    </a>
                  ) : null}

                  {externalBiographyUrl ? (
                    <a
                      href={externalBiographyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#005A78] hover:text-[#005A78]"
                    >
                      <BookOpen size={16} aria-hidden="true" />
                      External Biography
                      <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  ) : null}

                  {member.email ? (
                    <a
                      href={`mailto:${member.email}`}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#005A78] hover:text-[#005A78]"
                    >
                      <Mail size={16} aria-hidden="true" />
                      Email
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </article>
        </Container>
      </main>
    </PublicLayout>
  );
}
