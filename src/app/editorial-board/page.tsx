import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";

const executiveEditors = [
  {
    id: "exec-1",
    name: "Professor Dr. Md. Mahbubur Rahman",
    role: "Executive Editor",
    org: "Faculty of Science & Technology, Bangladesh University of Professionals",
    interests:
      "Computer science, artificial intelligence, information systems, academic research management",
    initials: "MR",
  },
  {
    id: "exec-2",
    name: "Dr. Nusrat Jahan",
    role: "Associate Executive Editor",
    org: "Department of ICT, Bangladesh University of Professionals",
    interests:
      "Data science, machine learning, natural language processing, educational technology",
    initials: "NJ",
  },
  {
    id: "exec-3",
    name: "Dr. Tanvir Ahmed",
    role: "Executive Editor",
    org: "Department of Environmental Science, Bangladesh University of Professionals",
    interests:
      "Applied science, environmental technology, sustainable development, interdisciplinary research",
    initials: "TA",
  },
];

const groupedEditors = [
  {
    id: "group-1",
    title: "Computer Science and Information Technology",
    members: [
      {
        id: "cs-1",
        name: "Dr. Farhana Islam",
        role: "Editorial Board Member",
        org: "Department of ICT, Bangladesh University of Professionals",
        interests:
          "Software engineering, database systems, cybersecurity, human-computer interaction",
        initials: "FI",
      },
      {
        id: "cs-2",
        name: "Dr. Arif Hossain",
        role: "Editorial Board Member",
        org: "Department of Computer Science, Bangladesh University of Professionals",
        interests:
          "Artificial intelligence, deep learning, computer vision, explainable AI",
        initials: "AH",
      },
    ],
  },
  {
    id: "group-2",
    title: "Engineering and Applied Technology",
    members: [
      {
        id: "eng-1",
        name: "Dr. Sabrina Rahman",
        role: "Editorial Board Member",
        org: "Faculty of Science & Technology, Bangladesh University of Professionals",
        interests:
          "Engineering systems, applied technology, automation, smart infrastructure",
        initials: "SR",
      },
    ],
  },
  {
    id: "group-3",
    title: "Environmental Science and Interdisciplinary Research",
    members: [
      {
        id: "env-1",
        name: "Dr. Mehedi Hasan",
        role: "Editorial Board Member",
        org: "Department of Environmental Science, Bangladesh University of Professionals",
        interests:
          "Environmental modeling, climate adaptation, sustainability, applied research methods",
        initials: "MH",
      },
    ],
  },
];

function EditorCard({
  name,
  role,
  org,
  interests,
  initials,
}: {
  name: string;
  role: string;
  org: string;
  interests: string;
  initials: string;
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#111433] text-[15px] font-semibold text-white">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-[18px] font-semibold text-slate-950">
                {name}
              </h3>

              <p className="mt-1 text-[14px] font-medium text-[#111433]">
                {role}
              </p>
            </div>

            <button className="w-fit rounded-full border border-slate-200 px-4 py-2 text-[13px] font-medium text-slate-600 hover:border-[#111433]/30 hover:text-[#111433]">
              View biography
            </button>
          </div>

          <p className="mt-4 text-[14px] leading-7 text-slate-600">{org}</p>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Research Interests
            </p>

            <p className="mt-2 text-[14px] leading-7 text-slate-700">
              {interests}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function EditorialBoardPage() {
  return (
    <PublicLayout>
      <main className="bg-[#f7f8fb]">
        <section className="border-b border-slate-200 bg-white">
          <Container className="py-12 md:py-16">
            <div className="max-w-3xl">
              <p className="journal-subheading">Editorial Leadership</p>

              <h1
                className="mt-4 text-[40px] font-semibold leading-tight tracking-tight text-slate-950 md:text-[56px]"
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                Editorial Board
              </h1>

              <p className="mt-5 text-[16px] leading-8 text-slate-600">
                The editorial board is responsible for supporting the journal’s
                academic quality, peer-review standards, publication ethics, and
                scholarly direction.
              </p>
            </div>
          </Container>
        </section>

        <Container className="py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
              <p className="journal-subheading">Board Summary</p>

              <h2
                className="mt-3 text-[26px] font-semibold leading-tight text-slate-950"
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                Academic Review Structure
              </h2>

              <p className="mt-4 text-[14px] leading-7 text-slate-600">
                Members are grouped by academic expertise to support manuscript
                evaluation across science, technology, engineering, and
                interdisciplinary research areas.
              </p>

              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[28px] font-semibold text-slate-950">
                    {executiveEditors.length}
                  </p>
                  <p className="mt-1 text-[13px] text-slate-500">
                    Executive Editors
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[28px] font-semibold text-slate-950">
                    {groupedEditors.reduce(
                      (total, group) => total + group.members.length,
                      0
                    )}
                  </p>
                  <p className="mt-1 text-[13px] text-slate-500">
                    Board Members
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[28px] font-semibold text-slate-950">
                    {groupedEditors.length}
                  </p>
                  <p className="mt-1 text-[13px] text-slate-500">
                    Research Groups
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-[#111433] p-5 text-white">
                <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-white/70">
                  Note
                </p>

                <p className="mt-3 text-[14px] leading-7 text-white/90">
                  Editorial information can later be connected to the admin
                  dashboard for dynamic updates.
                </p>
              </div>
            </aside>

            <section className="space-y-10">
              <div>
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="journal-subheading">Core Editorial Team</p>

                    <h2 className="journal-heading mt-3">
                      Executive Editors
                    </h2>
                  </div>
                </div>

                <div className="mt-6 grid gap-5">
                  {executiveEditors.map((editor) => (
                    <EditorCard key={editor.id} {...editor} />
                  ))}
                </div>
              </div>

              <div className="space-y-10">
                {groupedEditors.map((group) => (
                  <section key={group.id}>
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <p className="journal-subheading">Editorial Area</p>

                      <h2
                        className="mt-3 text-[28px] font-semibold leading-tight text-slate-950"
                        style={{ fontFamily: "var(--font-source-serif)" }}
                      >
                        {group.title}
                      </h2>
                    </div>

                    <div className="mt-5 grid gap-5">
                      {group.members.map((member) => (
                        <EditorCard key={member.id} {...member} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </section>
          </div>
        </Container>
      </main>
    </PublicLayout>
  );
}