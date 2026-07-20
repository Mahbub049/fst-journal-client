import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  ExternalLink,
  FlaskConical,
  Globe2,
  GraduationCap,
  LibraryBig,
  Mail,
  Orbit,
  UserRound,
} from "lucide-react";
import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";
import { buildGmailComposeUrl } from "@/lib/emailLinks";
import {
  EditorialBoardMember,
  EditorialBoardPageSettings,
  getPublicEditorialBoardById,
  getPublicEditorialBoardConfig,
} from "@/services/editorialBoardService";

export const dynamic = "force-dynamic";

const fallbackConfig: EditorialBoardPageSettings = {
  showEyebrow: true,
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

const formatBiography = (value: string) =>
  value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

function LinkedInIcon({ size = 19 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M5.2 7.2A2.2 2.2 0 1 0 5.2 2.8a2.2 2.2 0 0 0 0 4.4ZM3.3 21h3.8V8.9H3.3V21ZM9.4 8.9V21h3.8v-6.7c0-1.8.3-3.5 2.5-3.5 2.2 0 2.2 2 2.2 3.6V21h3.8v-7.4c0-3.6-.8-6.4-5-6.4-2 0-3.4 1.1-4 2.1h-.1V8.9H9.4Z" />
    </svg>
  );
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
  const chiefEditor = isChiefEditorRole(member.category);
  const externalBiographyUrl = normalizeExternalHref(member.biographyUrl);

  const socialProfiles = [
    {
      label: "Google Scholar",
      href: normalizeExternalHref(member.googleScholarUrl),
      icon: GraduationCap,
    },
    {
      label: "ResearchGate",
      href: normalizeExternalHref(member.researchGateUrl),
      icon: FlaskConical,
    },
    {
      label: "LinkedIn",
      href: normalizeExternalHref(member.linkedinUrl),
      icon: LinkedInIcon,
    },
    {
      label: "ORCID",
      href: normalizeExternalHref(member.orcidUrl),
      icon: BadgeCheck,
    },
    {
      label: "Scopus",
      href: normalizeExternalHref(member.scopusUrl),
      icon: LibraryBig,
    },
    {
      label: "Web of Science",
      href: normalizeExternalHref(member.webOfScienceUrl),
      icon: Orbit,
    },
    {
      label: "Website",
      href: normalizeExternalHref(member.personalWebsiteUrl),
      icon: Globe2,
    },
    {
      label: "Professional Profile",
      href: normalizeExternalHref(member.professionalProfileUrl),
      icon: UserRound,
    },
  ].filter((profile) => Boolean(profile.href));

  return (
    <PublicLayout>
      <main className="min-h-screen bg-white">
        <Container className="py-8 md:py-12 lg:py-14">
          <Link
            href="/editorial-board"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#005A78] transition hover:text-[#003f59] hover:underline"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Editorial Board
          </Link>

          <div className="mt-8 grid items-start gap-10 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)] xl:gap-14">
            <aside className="lg:sticky lg:top-28">
              <div className="aspect-[4/5] w-full overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={member.name}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[72px] font-bold text-[#122b49]">
                    {getInitials(member.name)}
                  </div>
                )}
              </div>

              <div className="border-b border-slate-200 py-6">
                <div className="space-y-2 text-[15px] leading-6 text-slate-700">
                  {member.category ? (
                    <p className="font-bold text-[#005A78]">{member.category}</p>
                  ) : null}
                  {member.designation ? <p>{member.designation}</p> : null}
                  {member.department ? <p>{member.department}</p> : null}
                  {member.institution ? <p>{member.institution}</p> : null}
                </div>
              </div>

              {member.expertise?.length ? (
                <section className="border-b border-slate-200 py-6">
                  <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Areas of Expertise
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {member.expertise.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              {socialProfiles.length || member.email ? (
                <section className="py-6">
                  <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Research Profiles & Contact
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {socialProfiles.map((profile) => {
                      const Icon = profile.icon;
                      return (
                        <a
                          key={profile.label}
                          href={profile.href}
                          target="_blank"
                          rel="noreferrer"
                          title={profile.label}
                          aria-label={profile.label}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-[#005A78] shadow-sm transition hover:-translate-y-0.5 hover:border-[#005A78] hover:bg-[#005A78] hover:text-white"
                        >
                          <Icon size={19} />
                        </a>
                      );
                    })}

                    {member.email ? (
                      <a
                        href={buildGmailComposeUrl(
                          member.email,
                          "Journal of FST editorial board inquiry"
                        )}
                        target="_blank"
                        rel="noreferrer"
                        title="Email"
                        aria-label={`Email ${member.name}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-[#005A78] shadow-sm transition hover:-translate-y-0.5 hover:border-[#005A78] hover:bg-[#005A78] hover:text-white"
                      >
                        <Mail size={19} aria-hidden="true" />
                      </a>
                    ) : null}
                  </div>
                </section>
              ) : null}
            </aside>

            <article className="min-w-0">
              <h1
                className="text-[40px] font-semibold leading-[1.08] tracking-tight text-[#064779] md:text-[52px]"
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                {member.name}
              </h1>

              {biographyParagraphs.length ? (
                <div className="mt-6 space-y-5 text-[16px] leading-8 text-slate-700 md:text-justify">
                  {biographyParagraphs.map((paragraph, index) => (
                    <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
                  ))}
                </div>
              ) : null}

              {chiefEditor && config.chiefEditorResponsibilityDescription ? (
                <section className="mt-9 border-t border-slate-200 pt-7">
                  <h2
                    className="text-[28px] font-semibold text-slate-950"
                    style={{ fontFamily: "var(--font-source-serif)" }}
                  >
                    {config.chiefEditorResponsibilityTitle ||
                      "Chief Editor Responsibilities"}
                  </h2>
                  <p className="mt-4 text-[16px] leading-8 text-slate-700 md:text-justify">
                    {config.chiefEditorResponsibilityDescription}
                  </p>
                </section>
              ) : null}

              {externalBiographyUrl ? (
                <a
                  href={externalBiographyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-9 inline-flex items-center gap-2 rounded-full border border-[#005A78] px-5 py-3 text-sm font-bold text-[#005A78] transition hover:bg-[#005A78] hover:text-white"
                >
                  <BookOpen size={17} aria-hidden="true" />
                  External Biography
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              ) : null}
            </article>
          </div>
        </Container>
      </main>
    </PublicLayout>
  );
}
