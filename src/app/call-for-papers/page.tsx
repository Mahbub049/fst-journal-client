import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";
import Image from "next/image";
import Link from "next/link";

const importantDates = [
  {
    label: "Manuscript Submission Deadline",
    value: "30 November 2026",
  },
  {
    label: "Issue",
    value: "Volume 4, Issue 1",
  },
  {
    label: "Publication Year",
    value: "2026",
  },
  {
    label: "Submission Email",
    value: "journal.fst@bup.edu.bd",
  },
];

const submissionTypes = [
  "Full research articles",
  "Short communications",
  "Book reviews",
  "Policy analysis",
  "Review articles",
];

const engineeringTopics = [
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
];

const environmentalTopics = [
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
];

export default function CallForPapersPage() {
  return (
    <PublicLayout>
      <main className="bg-[#f7f8fb]">
        <Container className="py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="space-y-8">
              {/* Main Call for Papers Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div className="border-b border-slate-200 pb-6">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="journal-subheading">
                        Publication Invitation
                      </p>

                      <h1
                        className="mt-3 text-[34px] font-semibold leading-tight text-slate-950 md:text-[42px]"
                        style={{ fontFamily: "var(--font-source-serif)" }}
                      >
                        Call for Papers
                      </h1>

                      <p className="mt-4 max-w-3xl text-[15px] text-justify leading-8 text-slate-600">
                        The Faculty of Science and Technology, Bangladesh
                        University of Professionals, invites authors to submit
                        original and high-quality manuscripts for the upcoming
                        issue of the Journal of FST. The journal welcomes
                        research contributions in engineering, computer science,
                        communication technology, environmental science,
                        management, and related interdisciplinary fields.
                      </p>
                    </div>

                    {/* <Link
                      href="/pdfs/call-for-papers.pdf"
                      target="_blank"
                      className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#111433] px-6 text-[14px] font-semibold text-white hover:bg-[#1b1f4a]"
                    >
                      Open PDF
                    </Link> */}
                  </div>
                </div>

                {/* PDF Viewer */}
                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
                    <div>
                      <p className="text-[13px] font-semibold text-slate-900">
                        Call for Papers Document
                      </p>
                      <p className="text-[12px] text-slate-500">
                        Volume 4, Issue 1
                      </p>
                    </div>

                    <a
                      href="/pdfs/call-for-papers.pdf"
                      target="_blank"
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-[12px] font-semibold text-slate-700 hover:border-[#111433]/40 hover:text-[#111433]"
                    >
                      View Fullscreen
                    </a>
                  </div>

                  <iframe
                    src="/pdfs/call-for-papers.pdf#toolbar=0&navpanes=0&scrollbar=1"
                    title="Call for Papers PDF"
                    className="block h-[720px] w-full bg-white"
                  />
                </div>
              </div>

              {/* Submission Types */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <p className="journal-subheading">Submission Format</p>

                <h2
                  className="mt-3 text-[30px] font-semibold leading-tight text-slate-950"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  Types of Manuscripts Accepted
                </h2>

                <p className="mt-4 text-[15px] leading-8 text-slate-600">
                  The journal welcomes different types of academic submissions.
                  Manuscripts should present original contribution, clear
                  methodology, proper academic writing, and relevance to the
                  scope of the Faculty of Science and Technology.
                </p>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {submissionTypes.map((type) => (
                    <div
                      key={type}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[14px] font-medium leading-6 text-slate-700"
                    >
                      {type}
                    </div>
                  ))}
                </div>
              </div>

              {/* Scope */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <p className="journal-subheading">Scope of Submission</p>

                <h2
                  className="mt-3 text-[30px] font-semibold leading-tight text-slate-950"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  Suggested Research Areas
                </h2>

                <p className="mt-4 text-[15px] leading-8 text-slate-600">
                  Authors are encouraged to submit high-quality articles in the
                  areas listed below. The scope covers Electrical and Electronic
                  Engineering, Computer Science and Engineering, Information and
                  Communication Technology, Environmental Science and Management,
                  and other related areas.
                </p>

                <div className="mt-8 space-y-8">
                  <div>
                    <h3 className="text-[20px] font-semibold text-slate-950">
                      Engineering, ICT and Computing Areas
                    </h3>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {engineeringTopics.map((topic) => (
                        <div
                          key={topic}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[14px] font-medium leading-6 text-slate-700"
                        >
                          {topic}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[20px] font-semibold text-slate-950">
                      Environmental Science and Management Areas
                    </h3>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {environmentalTopics.map((topic) => (
                        <div
                          key={topic}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[14px] font-medium leading-6 text-slate-700"
                        >
                          {topic}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Requirements */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <p className="journal-subheading">Final Accepted Papers</p>

                <h2
                  className="mt-3 text-[30px] font-semibold leading-tight text-slate-950"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  Final Submission Requirements
                </h2>

                <p className="mt-4 text-[15px] leading-8 text-slate-600">
                  Authors must submit the final accepted article in both Word and
                  LaTeX format. All figures should be submitted separately in
                  both colour and grayscale versions. All finally accepted
                  articles will be provided with a DOI.
                </p>
              </div>
            </section>

            <aside className="space-y-6">
              {/* Important Dates */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="journal-subheading">Important Information</p>

                <h2
                  className="mt-3 text-[26px] font-semibold leading-tight text-slate-950"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  Current Issue Timeline
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

                      <p className="mt-1 break-words text-[15px] font-semibold text-slate-900">
                        {date.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Card */}
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
                  Please review the author guidelines, manuscript structure,
                  word limit, plagiarism requirement, and formatting rules before
                  submission.
                </p>

                <a
                  href="mailto:journal.fst@bup.edu.bd"
                  className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-white px-5 text-[14px] font-medium text-[#111433] hover:bg-slate-100"
                >
                  Email Manuscript
                </a>

                <Link
                  href="/for-authors/submission-guidelines"
                  className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full border border-white/30 px-5 text-[14px] font-medium text-white hover:bg-white/10"
                >
                  View Submission Guidelines
                </Link>
              </div>

              {/* Poster */}
              {/* <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
              </div> */}

              {/* Contact */}
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
                      Chief Editor
                    </span>
                    <br />
                    Brigadier General Sufi Md Ataur Rahman, ndc, psc
                  </p>

                  <p>
                    <span className="font-semibold text-slate-900">
                      Published By
                    </span>
                    <br />
                    Faculty of Science and Technology
                  </p>

                  <p>Bangladesh University of Professionals</p>

                  <p>Mirpur Cantonment, Dhaka - 1216</p>

                  <p>
                    <span className="font-semibold text-slate-900">
                      Email:
                    </span>{" "}
                    journal.fst@bup.edu.bd
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </main>
    </PublicLayout>
  );
}