import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";

type EditorialBoardMember = {
  _id: string;
  category: string;
  editorialArea?: string;
  name: string;
  designation?: string;
  institution?: string;
  department?: string;
  expertise?: string[];
  profileImage?: string;
  bio?: string;
  email?: string;
  order?: number;
  isActive?: boolean;
};

type EditorialSection = {
  id: string;
  label: string;
  title: string;
  acceptedCategories: string[];
  members: EditorialBoardMember[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const sectionConfig = [
  {
    id: "chief-patron",
    label: "Chief Patron",
    title: "Chief Patron",
    acceptedCategories: ["Chief Patron"],
  },
  {
    id: "chief-editor",
    label: "Chief Editor",
    title: "Chief Editor",
    acceptedCategories: ["Chief Editor"],
  },
  {
    id: "editor",
    label: "Editor",
    title: "Editor",
    acceptedCategories: ["Editor"],
  },
  {
    id: "assistant-editors",
    label: "Assistant Editors",
    title: "Assistant Editors",
    acceptedCategories: ["Assistant Editor", "Assistant Editors"],
  },
  {
    id: "editorial-advisory-board",
    label: "Editorial Advisory Board",
    title: "Editorial Advisory Board",
    acceptedCategories: [
      "Editorial Advisory Board",
      "Editorial Advisory Board Member",
      "Editorial Advisory Board Members",
      "Advisory Board Member",
      "Advisory Board Members",
    ],
  },
];

async function getEditorialBoardMembers(): Promise<EditorialBoardMember[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/editorial-board`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();

    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch editorial board members:", error);
    return [];
  }
}

function normalizeCategory(value?: string) {
  return (value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function isCategoryMatch(category: string | undefined, acceptedNames: string[]) {
  const currentCategory = normalizeCategory(category);

  return acceptedNames.some(
    (name) => normalizeCategory(name) === currentCategory
  );
}

function sortMembers(members: EditorialBoardMember[]) {
  return [...members].sort((a, b) => {
    const orderA = Number(a.order ?? 0);
    const orderB = Number(b.order ?? 0);

    if (orderA !== orderB) return orderA - orderB;

    return (a.name || "").localeCompare(b.name || "");
  });
}

function buildEditorialSections(
  members: EditorialBoardMember[]
): EditorialSection[] {
  const configuredSections = sectionConfig.map((section) => ({
    ...section,
    members: sortMembers(
      members.filter((member) =>
        isCategoryMatch(member.category, section.acceptedCategories)
      )
    ),
  }));

  const knownCategories = sectionConfig
    .flatMap((section) => section.acceptedCategories)
    .map((category) => normalizeCategory(category));

  const extraCategories = Array.from(
    new Set(
      members
        .map((member) => member.category)
        .filter(
          (category): category is string =>
            Boolean(category) &&
            !knownCategories.includes(normalizeCategory(category))
        )
    )
  );

  const extraSections = extraCategories.map((category) => ({
    id: category
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    label: category,
    title: category,
    acceptedCategories: [category],
    members: sortMembers(
      members.filter((member) => isCategoryMatch(member.category, [category]))
    ),
  }));

  return [...configuredSections, ...extraSections].filter(
    (section) => section.members.length > 0
  );
}
function getInitials(name: string) {
  return name
    .replace(/Dr\.|Professor|Prof\.|Major General|Brigadier General/gi, "")
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getCategoryCount(
  members: EditorialBoardMember[],
  acceptedNames: string[]
) {
  return members.filter((member) =>
    isCategoryMatch(member.category, acceptedNames)
  ).length;
}

function EditorCard({ member }: { member: EditorialBoardMember }) {
  const imageUrl = member.profileImage?.trim();

  return (
    <article
      id={`member-${member._id}`}
      className="scroll-mt-32 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-6"
    >
      <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:text-left">
        <div className="shrink-0 self-center md:self-start">
          <div className="h-[220px] w-[170px] overflow-hidden rounded-2xl border border-slate-200 bg-[#f1f5f9] shadow-sm">
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
        </div>

        <div className="min-w-0 w-full flex-1 pt-1">
          <h3 className="text-[20px] font-semibold leading-8 text-slate-950">
            {member.name}
          </h3>

          <p className="mt-1 text-[14px] font-semibold text-[#111433]">
            {member.category}
          </p>

          <div className="mt-5 space-y-2 text-[15px] leading-7 text-slate-700">
            {member.designation ? <p>{member.designation}</p> : null}

            {member.department ? (
              <p className="text-slate-600">{member.department}</p>
            ) : null}

            {member.institution ? (
              <p className="text-slate-600">{member.institution}</p>
            ) : null}
          </div>

          {member.expertise && member.expertise.length > 0 ? (
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

          {member.bio ? (
            <p className="mt-4 text-[14px] leading-7 text-slate-600">
              {member.bio}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default async function EditorialBoardPage() {
  const members = await getEditorialBoardMembers();
  const editorialSections = buildEditorialSections(members);

  const chiefPatronCount = getCategoryCount(members, ["Chief Patron"]);

  const chiefEditorCount = getCategoryCount(members, ["Chief Editor"]);

  const editorCount = getCategoryCount(members, ["Editor"]);

  const assistantEditorCount = getCategoryCount(members, [
    "Assistant Editor",
    "Assistant Editors",
  ]);

  const advisoryBoardCount = getCategoryCount(members, [
    "Editorial Advisory Board",
    "Editorial Advisory Board Member",
    "Editorial Advisory Board Members",
    "Advisory Board Member",
    "Advisory Board Members",
  ]);

  const totalMembers = members.length;

  return (
    <PublicLayout>
      <main className="bg-[#f7f8fb]">
        <section className="border-b border-slate-200 bg-white">
          <Container className="py-12 md:py-16">
            <div className="max-w-3xl">
              <p className="journal-subheading">Editorial Leadership</p>

              <h1
                className="mt-4 text-[36px] md:text-[40px] font-semibold leading-tight tracking-tight text-slate-950 md:text-[56px]"
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                Editorial Board
              </h1>

              <p className="mt-5 text-[15px] md:text-[16px] text-justify leading-8 text-slate-600">
                The editorial board of BUP Faculty of Science and Technology
                Journal supports academic quality, publication ethics,
                manuscript evaluation, and scholarly direction.
              </p>
            </div>
          </Container>
        </section>

        <Container className="py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="order-last h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:order-first lg:sticky lg:top-[106px]">
              <p className="journal-subheading">Board Summary</p>

              <h2
                className="mt-3 text-[26px] font-semibold leading-tight text-slate-950"
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                Editorial Review Structure
              </h2>

              <p className="mt-4 text-[14px] leading-7 text-slate-600">
                Members are organized according to the official editorial board
                structure, including chief patron, chief editor, editor,
                assistant editors, and advisory board members.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[28px] font-semibold text-slate-950">
                    {chiefPatronCount}
                  </p>
                  <p className="mt-1 text-[13px] text-slate-500">
                    Chief Patron
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[28px] font-semibold text-slate-950">
                    {chiefEditorCount}
                  </p>
                  <p className="mt-1 text-[13px] text-slate-500">
                    Chief Editor
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[28px] font-semibold text-slate-950">
                    {editorCount}
                  </p>
                  <p className="mt-1 text-[13px] text-slate-500">Editor</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[28px] font-semibold text-slate-950">
                    {assistantEditorCount}
                  </p>
                  <p className="mt-1 text-[13px] text-slate-500">
                    Assistant Editors
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[28px] font-semibold text-slate-950">
                    {advisoryBoardCount}
                  </p>
                  <p className="mt-1 text-[13px] text-slate-500">
                    Advisory Board Members
                  </p>
                </div>

                <div className="col-span-2 rounded-2xl border border-[#111433]/10 bg-[#111433] p-4 text-white">
                  <p className="text-[28px] font-semibold">{totalMembers}</p>
                  <p className="mt-1 text-[13px] text-white/70">
                    Total Members
                  </p>
                </div>
              </div>

              {/* <div className="mt-6 rounded-2xl bg-[#f5c84b] p-5 text-[#111433]">
                <p className="text-[13px] font-bold uppercase tracking-[0.16em]">
                  Note
                </p>

                <p className="mt-3 text-[14px] leading-7">
                  This page is connected with the admin editorial board data.
                  Active members will appear here automatically.
                </p>
              </div> */}
            </aside>

            <section className="space-y-10">
              {editorialSections.length > 0 ? (
                editorialSections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-32"
                  >
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h2
                        className="text-center text-[28px] font-semibold leading-tight text-slate-950 md:text-left"
                        style={{ fontFamily: "var(--font-source-serif)" }}
                      >
                        {section.title}
                      </h2>
                    </div>

                    <div className="mt-5 grid gap-5">
                      {section.members.map((member) => (
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
                    Add active members from the admin editorial board panel to
                    show them on this page.
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