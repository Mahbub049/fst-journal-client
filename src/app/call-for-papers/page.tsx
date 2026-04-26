import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";
import Image from "next/image";
import Link from "next/link";

const importantDates = [
  {
    label: "Paper Submission Deadline",
    value: "30 June 2026",
  },
  {
    label: "Review Notification",
    value: "31 August 2026",
  },
  {
    label: "Camera Ready Submission",
    value: "30 September 2026",
  },
  {
    label: "Expected Publication",
    value: "31 October 2026",
  },
];

const topics = [
  "Computer Science and Information Technology",
  "Artificial Intelligence and Data Science",
  "Cybersecurity and Software Engineering",
  "Environmental Science and Applied Technology",
  "Engineering, Innovation and Interdisciplinary Research",
];

export default function CallForPapersPage() {
  return (
    <PublicLayout>
      <main className="bg-[#f7f8fb]">
        {/* <section className="border-b border-slate-200 bg-white">
          <Container className="py-12 md:py-16">
            <div className="max-w-4xl">
              <p className="journal-subheading">Publication Invitation</p>

              <h1
                className="mt-4 text-[40px] font-semibold leading-tight tracking-tight text-slate-950 md:text-[56px]"
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                Call for Papers
              </h1>

              <p className="mt-5 text-[16px] leading-8 text-slate-600">
                BUP Faculty of Science & Technology Journal invites researchers,
                academicians, professionals, and postgraduate scholars to submit
                original research papers, review articles, and technical studies
                for the upcoming issue.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/for-authors/submission-guidelines"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[#111433] px-6 text-[14px] font-medium text-white shadow-sm hover:bg-[#0b3d49]"
                >
                  Submission Guidelines
                </Link>

                <Link
                  href="/for-authors/templates"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-[14px] font-medium text-slate-700 hover:border-[#111433]/30 hover:text-[#111433]"
                >
                  Download Template
                </Link>
              </div>
            </div>
          </Container>
        </section> */}

        <Container className="py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="space-y-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="journal-subheading">Document Preview</p>

                    <h2
                      className="mt-3 text-[30px] font-semibold leading-tight text-slate-950"
                      style={{ fontFamily: "var(--font-source-serif)" }}
                    >
                      Call for Papers Document
                    </h2>
                  </div>

                  <Link
                    href="/pdfs/call-for-papers.pdf"
                    target="_blank"
                    className="inline-flex h-10 w-fit items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-[13px] font-medium text-slate-700 hover:border-[#111433]/30 hover:text-[#111433]"
                  >
                    Open PDF
                  </Link>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <iframe
                    src="/pdfs/call-for-papers.pdf"
                    title="Call for Papers PDF"
                    className="h-[760px] w-full"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <p className="journal-subheading">Scope of Submission</p>

                <h2
                  className="mt-3 text-[30px] font-semibold leading-tight text-slate-950"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  Suggested Research Areas
                </h2>

                <p className="mt-4 text-[15px] leading-8 text-slate-600">
                  Manuscripts should present original contribution, clear
                  methodology, proper academic writing, and relevance to science,
                  technology, engineering, or interdisciplinary research.
                </p>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {topics.map((topic) => (
                    <div
                      key={topic}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[14px] font-medium leading-6 text-slate-700"
                    >
                      {topic}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="journal-subheading">Important Dates</p>

                <h2
                  className="mt-3 text-[26px] font-semibold leading-tight text-slate-950"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  Timeline
                </h2>

                <div className="mt-6 space-y-3">
                  {importantDates.map((date) => (
                    <div
                      key={date.label}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-[13px] text-slate-500">
                        {date.label}
                      </p>
                      <p className="mt-1 text-[15px] font-semibold text-slate-900">
                        {date.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-[#111433] p-6 text-white shadow-sm">
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">
                  Submit Manuscript
                </p>

                <h2
                  className="mt-3 text-[26px] font-semibold leading-tight text-white"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  Ready to submit?
                </h2>

                <p className="mt-4 text-[14px] leading-7 text-white/80">
                  Please review the author guidelines and formatting template
                  before preparing your manuscript.
                </p>

                <Link
                  href="/for-authors/submission-guidelines"
                  className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-white px-5 text-[14px] font-medium text-[#111433] hover:bg-slate-100"
                >
                  View Submission Process
                </Link>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="journal-subheading">Poster</p>

                <h2
                  className="mt-3 text-[26px] font-semibold leading-tight text-slate-950"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  Announcement Poster
                </h2>

                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <Image
                    src="/images/call-for-papers-poster.jpg"
                    alt="Call for Papers Poster"
                    width={500}
                    height={700}
                    className="h-auto w-full object-cover"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="journal-subheading">Contact</p>

                <h2
                  className="mt-3 text-[26px] font-semibold leading-tight text-slate-950"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  Editorial Office
                </h2>

                <div className="mt-5 space-y-3 text-[14px] leading-7 text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-900">
                      Published By
                    </span>
                    <br />
                    Faculty of Science & Technology
                  </p>

                  <p>Bangladesh University of Professionals</p>
                  <p>Mirpur Cantonment, Dhaka - 1216</p>
                  <p>Telephone: +8809666790799</p>
                  <p>Email: editor.fstjournal@bup.edu.bd</p>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </main>
    </PublicLayout>
  );
}