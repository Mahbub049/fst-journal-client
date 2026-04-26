import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";

const executiveEditors = [
  {
    name: "Dr. Sergio Hoyos Calvo",
    org: "Polytechnic University of Valencia, Valencia, Spain",
    interests: "Wall turbulence, Climate change, Artificial intelligence",
  },
  {
    name: "Assoc. Professor Madjid Karimirad",
    org: "Queen's University Belfast, School of Natural and Built Environment, Department of Civil Engineering, Belfast, United Kingdom",
    interests:
      "Ocean energy systems, Wave mechanics, Fluid-structure interaction, Structural dynamics, Hydrodynamics",
  },
  {
    name: "Professor Shouliang Yi",
    org: "Sichuan University, Chengdu, Sichuan, China",
    interests:
      "Membrane separations for advanced water purification, Carbon capture and utilization, Clean energy production",
  },
  {
    name: "Professor Soledad Le Clainche",
    org: "Polytechnic University of Madrid, Madrid, Spain",
    interests:
      "Data-driven methods, CFD, Flow control, Artificial intelligence, Turbulent flows",
  },
];

const groupedEditors = [
  {
    title: "Biomedical Engineering and Bioengineering Applications",
    members: [
      {
        name: "Professor Stavros Kassinos",
        org: "University of Cyprus, Department of Mechanical & Manufacturing Engineering, Nicosia, Cyprus",
        interests:
          "Computational fluid dynamics, respiratory biomechanics and physiology, drug delivery, turbulence simulation",
      },
    ],
  },
  {
    title: "Chemical & Environmental",
    members: [
      {
        name: "Professor Suresh C. Pillai",
        org: "Atlantic Technological University - Sligo Campus, Sligo, Ireland",
        interests:
          "Nanotechnology, Energy Materials, Supercapacitors, Photocatalysis, Advanced Functional Materials",
      },
    ],
  },
  {
    title: "Civil, Structural and Materials",
    members: [
      {
        name: "Prof. Dr. Seyed Ghaffar",
        org: "University of Birmingham, Birmingham, United Kingdom",
        interests:
          "Construction Materials, Sustainable material development, 3D printing of concrete, Bio-based materials",
      },
    ],
  },
];

function EditorRow({
  name,
  org,
  interests,
}: {
  name: string;
  org: string;
  interests: string;
}) {
  return (
    <div className="flex gap-4 py-4">
      <div className="h-14 w-14 shrink-0 border border-slate-200 bg-slate-100" />

      <div>
        <h3 className="text-[16px] font-semibold text-slate-900">{name}</h3>
        <p className="mt-1 text-[13px] leading-6 text-slate-700">{org}</p>
        <p className="mt-1 text-[13px] leading-6 text-slate-500">{interests}</p>

        <button className="mt-2 text-[13px] font-semibold text-[#1570A6]">
          View full biography
        </button>
      </div>
    </div>
  );
}

export default function EditorialBoardPage() {
  return (
    <PublicLayout>
      <main className="bg-white py-10">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
            <aside className="border-r border-slate-200 pr-8">
              <h1 className="text-[34px] font-semibold tracking-wide text-[#1F2A44]">
                Editorial board
              </h1>

              <div className="mt-10 border-t border-slate-200 pt-10">
                <h2 className="text-[18px] font-semibold leading-8 text-slate-800">
                  Gender diversity of editors and editorial board members
                </h2>

                <div className="mt-8 flex justify-center">
                  <div className="h-40 w-40 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[12px] text-slate-500">
                    Chart Placeholder
                  </div>
                </div>

                <div className="mt-8 space-y-3 text-[13px] text-slate-700">
                  <p>85% man</p>
                  <p>13% woman</p>
                  <p>1% non-binary or gender diverse</p>
                  <p>1% prefer not to disclose</p>
                </div>

                <p className="mt-8 text-[13px] leading-6 text-slate-600">
                  Data represents responses from 80% of 224 editors and editorial board members.
                </p>
              </div>
            </aside>

            <section>
              <h2 className="text-[22px] font-semibold text-slate-900">
                Executive Editors
              </h2>

              <div className="mt-5 space-y-2">
                {executiveEditors.map((editor) => (
                  <EditorRow key={editor.name} {...editor} />
                ))}
              </div>

              <div className="mt-12 space-y-10">
                {groupedEditors.map((group) => (
                  <div key={group.title}>
                    <h3 className="text-[18px] font-semibold text-slate-900">
                      {group.title}
                    </h3>

                    <div className="mt-4 space-y-2">
                      {group.members.map((member) => (
                        <EditorRow key={member.name} {...member} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </Container>
      </main>
    </PublicLayout>
  );
}