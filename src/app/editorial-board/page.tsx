import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";
import { buildGmailComposeUrl } from "@/lib/emailLinks";
import {
  EditorialBoardMember,
  EditorialBoardPageSettings,
  getPublicEditorialBoard,
  getPublicEditorialBoardConfig,
} from "@/services/editorialBoardService";

export const dynamic = "force-dynamic";

const fallbackConfig: EditorialBoardPageSettings = {
  showEyebrow: true,
  eyebrow: "Editorial Leadership",
  pageTitle: "Editorial Board",
  intro:
    "The editorial board of BUP Faculty of Science and Technology Journal supports academic quality, publication ethics, manuscript evaluation, and scholarly direction.",
  summaryEyebrow: "Board Summary",
  summaryTitle: "Editorial Review Structure",
  summaryDescription:
    "Members are organized according to the official editorial structure and their assigned roles.",
  chiefEditorResponsibilityTitle: "Chief Editor Responsibilities",
  chiefEditorResponsibilityDescription:
    "Our chief editor is accountable for the overall direction of the journal, ensuring that published work is of the highest quality, follows BUP publication policies and procedures, and advances the journal's editorial mission.",
  showSummaryCards: true,
  showTotalCard: true,
  editorialOfficeTitle: "Editorial Office",
  editorialOfficeDescription:
    "For journal-related queries, manuscript preparation, publication information, and author support, please contact the editorial office.",
  editorialOfficePublisher: "Faculty of Science & Technology",
  editorialOfficeInstitution: "Bangladesh University of Professionals",
  editorialOfficeAddress: "Mirpur Cantonment, Dhaka - 1216",
  editorialOfficeEmail: "editor.fstjournal@bup.edu.bd",
  editorialOfficePhone: "",
  categories: [
    {
      name: "Chief Editor",
      description: "",
      order: 0,
      isActive: true,
      showInSummary: true,
    },
    {
      name: "Editor",
      description: "",
      order: 1,
      isActive: true,
      showInSummary: true,
    },
    {
      name: "Associate Editor",
      description: "",
      order: 2,
      isActive: true,
      showInSummary: true,
    },
    {
      name: "Editorial Advisory Board",
      description: "",
      order: 3,
      isActive: true,
      showInSummary: true,
    },
  ],
  editorialAreas: [],
};

const normalize = (value?: string) =>
  (value || "").toLowerCase().replace(/\s+/g, " ").trim();

const isChiefEditorRole = (value?: string) => {
  const normalized = (value || "")
    .toLowerCase()
    .replace(/[^a-z]+/g, " ")
    .trim();

  return normalized === "chief editor" || normalized === "editor in chief";
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const sortMembers = (members: EditorialBoardMember[]) =>
  [...members].sort((a, b) => {
    const orderDifference = Number(a.order || 0) - Number(b.order || 0);
    return orderDifference || a.name.localeCompare(b.name);
  });

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

function getDetailsButtonLabel(member: EditorialBoardMember) {
  if (isChiefEditorRole(member.category)) {
    return member.professionalProfileLabel?.trim() || "Meet the Chief Editor";
  }

  return member.biographyLabel?.trim() || "View Full Biography";
}

function EditorCard({ member }: { member: EditorialBoardMember }) {
  const imageUrl = member.profileImage?.trim();

  return (
    <article
      id={`member-${member._id}`}
      className="scroll-mt-32 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-6"
    >
      <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-stretch md:text-left">
        <div className="h-[260px] w-[200px] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-[#f1f5f9] shadow-sm md:h-auto md:min-h-[280px] md:w-[220px] md:self-stretch">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={member.name}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[40px] font-bold text-[#111433]">
              {getInitials(member.name)}
            </div>
          )}
        </div>

        <div className="flex min-w-0 w-full flex-1 flex-col self-stretch pt-1">
          <div>
            <h3 className="text-[20px] font-semibold leading-8 text-slate-950">
              {member.name}
            </h3>

            <div className="mt-5 space-y-2 text-[15px] leading-7 text-slate-700">
              {member.designation ? <p>{member.designation}</p> : null}
              {member.department ? (
                <p className="text-slate-600">{member.department}</p>
              ) : null}
              {member.institution ? (
                <p className="text-slate-600">{member.institution}</p>
              ) : null}
            </div>

            {member.expertise?.length ? (
              <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                {member.expertise.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-slate-100 px-3 py-1 text-[12px] font-semibold text-slate-600"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-auto pt-6">
            <Link
              href={`/editorial-board/${member._id}`}
              className="inline-flex items-center gap-2 rounded-full bg-[#005A78] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#004862]"
            >
              {getDetailsButtonLabel(member)}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default async function EditorialBoardPage() {
  let members: EditorialBoardMember[] = [];
  let config = fallbackConfig;

  const [membersResult, configResult] = await Promise.allSettled([
    getPublicEditorialBoard(),
    getPublicEditorialBoardConfig(),
  ]);

  if (membersResult.status === "fulfilled") members = membersResult.value;
  if (configResult.status === "fulfilled") {
    config = {
      ...fallbackConfig,
      ...configResult.value,
      categories:
        configResult.value.categories?.length > 0
          ? configResult.value.categories
          : fallbackConfig.categories,
      editorialAreas: configResult.value.editorialAreas || [],
    };
  }

  const activeCategories = [...config.categories]
    .filter((category) => category.isActive)
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

  const activeCategoryNames = new Set(
    activeCategories.map((category) => normalize(category.name))
  );
  const visibleMembers = members.filter(
    (member) => member.isActive && activeCategoryNames.has(normalize(member.category))
  );

  const sections = activeCategories
    .map((category) => ({
      category,
      members: sortMembers(
        visibleMembers.filter(
          (member) => normalize(member.category) === normalize(category.name)
        )
      ),
    }))
    .filter((section) => section.members.length > 0);

  const summaryCategories = activeCategories.filter(
    (category) => category.showInSummary
  );

  const officeDetails = [
    config.editorialOfficePublisher,
    config.editorialOfficeInstitution,
    config.editorialOfficeAddress,
  ].filter(Boolean);

  return (
    <PublicLayout>
      <main className="bg-[#f7f8fb]">
        <section className="border-b border-slate-200 bg-white">
          <Container className="py-12 md:py-16">
            <div>
              {config.showEyebrow !== false && config.eyebrow ? (
                <p className="journal-subheading">{config.eyebrow}</p>
              ) : null}

              <h1
                className={`${config.showEyebrow !== false && config.eyebrow ? "mt-4" : "mt-0"} text-[36px] font-semibold leading-tight tracking-tight text-slate-950 md:text-[56px]`}
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                {config.pageTitle}
              </h1>

              {config.intro ? (
                <p className="mt-5 text-[15px] leading-8 text-slate-600 md:text-justify md:text-[16px]">
                  {config.intro}
                </p>
              ) : null}
            </div>
          </Container>
        </section>

        <Container className="py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="order-last h-fit space-y-6 lg:order-first lg:sticky lg:top-[106px]">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="journal-subheading">{config.summaryEyebrow}</p>

                <h2
                  className="mt-3 text-[26px] font-semibold leading-tight text-slate-950"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  {config.summaryTitle}
                </h2>

                {config.summaryDescription ? (
                  <p className="mt-4 text-[14px] leading-7 text-slate-600">
                    {config.summaryDescription}
                  </p>
                ) : null}

                {config.showSummaryCards ? (
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {summaryCategories.map((category) => {
                      const count = visibleMembers.filter(
                        (member) =>
                          normalize(member.category) === normalize(category.name)
                      ).length;

                      return (
                        <a
                          key={category._id || category.name}
                          href={`#${slugify(category.name)}`}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-[#005A78]/30 hover:bg-[#eef8fc]"
                        >
                          <p className="text-[28px] font-semibold text-slate-950">
                            {count}
                          </p>
                          <p className="mt-1 text-[13px] leading-5 text-slate-500">
                            {category.name}
                          </p>
                        </a>
                      );
                    })}

                    {config.showTotalCard ? (
                      <div className="col-span-2 rounded-2xl border border-[#111433]/10 bg-[#111433] p-4 text-white">
                        <p className="text-[28px] font-semibold">
                          {visibleMembers.length}
                        </p>
                        <p className="mt-1 text-[13px] text-white/70">
                          Total Active Members
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="journal-subheading">Editorial Office</p>
                <h2
                  className="mt-3 text-[24px] font-semibold leading-tight text-slate-950"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  {config.editorialOfficeTitle}
                </h2>

                {config.editorialOfficeDescription ? (
                  <p className="mt-4 text-[14px] leading-7 text-slate-600">
                    {config.editorialOfficeDescription}
                  </p>
                ) : null}

                {officeDetails.length ? (
                  <div className="mt-4 space-y-1 text-sm leading-6 text-slate-600">
                    {officeDetails.map((detail) => (
                      <p key={detail}>{detail}</p>
                    ))}
                  </div>
                ) : null}

                {config.editorialOfficeEmail ? (
                  <a
                    href={buildGmailComposeUrl(
                      config.editorialOfficeEmail,
                      "Journal of FST editorial office inquiry"
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#111433] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1b204a]"
                  >
                    Email Editorial Office
                  </a>
                ) : null}

                {config.editorialOfficePhone ? (
                  <a
                    href={`tel:${config.editorialOfficePhone}`}
                    className="mt-3 block text-center text-sm font-semibold text-[#005A78]"
                  >
                    {config.editorialOfficePhone}
                  </a>
                ) : null}
              </section>
            </aside>

            <section className="space-y-10">
              {sections.length > 0 ? (
                sections.map(({ category, members: categoryMembers }) => (
                  <section
                    key={category._id || category.name}
                    id={slugify(category.name)}
                    className="scroll-mt-32"
                  >
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h2
                        className="text-center text-[28px] font-semibold leading-tight text-slate-950 md:text-left"
                        style={{ fontFamily: "var(--font-source-serif)" }}
                      >
                        {category.name}
                      </h2>
                      {category.description ? (
                        <p className="mt-3 text-center text-sm leading-7 text-slate-600 md:text-left">
                          {category.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-5 grid gap-5">
                      {categoryMembers.map((member) => (
                        <EditorCard key={member._id} member={member} />
                      ))}
                    </div>
                  </section>
                ))
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <h2 className="text-xl font-semibold text-slate-950">
                    No editorial board members found
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Add active members and assign them to an active role from the
                    editorial board admin panel.
                  </p>
                </div>
              )}
            </section>
          </div>
        </Container>
      </main>
    </PublicLayout>
  );
}
