import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";
import { resolveEmailActionUrl } from "@/lib/emailLinks";
import Link from "next/link";
import { notFound } from "next/navigation";
import CallForPapersPdfViewer from "@/components/call-for-papers/CallForPapersPdfViewer";
import { getServerApiBaseUrl } from "@/lib/apiBase";

const apiBaseUrl = getServerApiBaseUrl();

type ImportantDate = {
  _id?: string;
  label: string;
  date: string;
  order?: number;
  isActive?: boolean;
};

type CallForPaperContent = {
  showInvitationLabel: boolean;
  invitationLabel: string;
  title: string;
  subtitle: string;
  description: string;

  posterImage: string;
  pdfUrl: string;
  pdfTitle: string;
  pdfSubtitle: string;

  submissionFormatLabel: string;
  submissionFormatTitle: string;
  submissionFormatDescription: string;
  submissionTypes: string[];

  scopeLabel: string;
  scopeTitle: string;
  scopeDescription: string;
  engineeringTitle: string;
  engineeringTopics: string[];
  environmentalTitle: string;
  environmentalTopics: string[];

  finalSectionLabel: string;
  finalSectionTitle: string;
  finalSectionDescription: string;

  importantInfoLabel: string;
  timelineTitle: string;
  importantDates: ImportantDate[];

  submitSectionLabel: string;
  submitTitle: string;
  submitDescription: string;
  submissionButtonLabel: string;
  submissionButtonLink: string;
  guidelinesButtonLabel: string;
  guidelinesButtonLink: string;

  contactSectionLabel: string;
  contactTitle: string;
  contactEditorLabel: string;
  contactEditorName: string;
  publishedByLabel: string;
  publishedBy: string;
  publisherName: string;
  publisherAddress: string;
  contactEmail: string;
  contactPhone: string;
  publisherInfo: string;
};

type CallForPaperResponse = {
  success: boolean;
  data?: CallForPaperContent;
};

const fallbackContent: CallForPaperContent = {
  showInvitationLabel: true,
  invitationLabel: "Publication Invitation",
  title: "Call for Papers",
  subtitle: "",
  description:
    "The Faculty of Science and Technology, Bangladesh University of Professionals, invites authors to submit original and high-quality manuscripts for the upcoming issue of the Journal of FST. The journal welcomes research contributions in engineering, computer science, communication technology, environmental science, management, and related interdisciplinary fields.",

  posterImage: "",
  pdfUrl: "/pdfs/call-for-papers.pdf",
  pdfTitle: "Call for Papers Document",
  pdfSubtitle: "Volume 4, Issue 1",

  submissionFormatLabel: "Submission Format",
  submissionFormatTitle: "Types of Manuscripts Accepted",
  submissionFormatDescription:
    "The journal welcomes different types of academic submissions. Manuscripts should present original contribution, clear methodology, proper academic writing, and relevance to the scope of the Faculty of Science and Technology.",
  submissionTypes: [
    "Full research articles",
    "Short communications",
    "Book reviews",
    "Policy analysis",
    "Review articles",
  ],

  scopeLabel: "Scope of Submission",
  scopeTitle: "Suggested Research Areas",
  scopeDescription:
    "Authors are encouraged to submit high-quality articles in the areas listed below. The scope covers Electrical and Electronic Engineering, Computer Science and Engineering, Information and Communication Technology, Environmental Science and Management, and other related areas.",
  engineeringTitle: "Engineering, ICT and Computing Areas",
  engineeringTopics: [
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
  ],
  environmentalTitle: "Environmental Science and Management Areas",
  environmentalTopics: [
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
  ],

  finalSectionLabel: "Final Accepted Papers",
  finalSectionTitle: "Final Submission Requirements",
  finalSectionDescription:
    "Authors must submit the final accepted article in both Word and LaTeX format. All figures should be submitted separately in both colour and grayscale versions. All finally accepted articles will be provided with a DOI.",

  importantInfoLabel: "Important Information",
  timelineTitle: "Current Issue Timeline",
  importantDates: [
    {
      label: "Manuscript Submission Deadline",
      date: "30 November 2026",
      order: 1,
      isActive: true,
    },
    {
      label: "Issue",
      date: "Volume 4, Issue 1",
      order: 2,
      isActive: true,
    },
    {
      label: "Publication Year",
      date: "2026",
      order: 3,
      isActive: true,
    },
    {
      label: "Submission Email",
      date: "journal.fst@bup.edu.bd",
      order: 4,
      isActive: true,
    },
  ],

  submitSectionLabel: "Submit Manuscript",
  submitTitle: "Ready to submit?",
  submitDescription:
    "Please review the author guidelines, manuscript structure, word limit, plagiarism requirement, and formatting rules before submission.",
  submissionButtonLabel: "Email Manuscript",
  submissionButtonLink: "mailto:journal.fst@bup.edu.bd",
  guidelinesButtonLabel: "View Submission Guidelines",
  guidelinesButtonLink: "/for-authors/submission-guidelines",

  contactSectionLabel: "Contact",
  contactTitle: "Editorial Office",
  contactEditorLabel: "Chief Editor",
  contactEditorName: "Brigadier General Sufi Md Ataur Rahman, ndc, psc",
  publishedByLabel: "Published By",
  publishedBy: "Faculty of Science and Technology",
  publisherName: "Bangladesh University of Professionals",
  publisherAddress: "Mirpur Cantonment, Dhaka - 1216",
  contactEmail: "journal.fst@bup.edu.bd",
  contactPhone: "",
  publisherInfo: "Bangladesh University of Professionals",
};

const mergeCallForPaperContent = (
  data: Partial<CallForPaperContent>
): CallForPaperContent => ({
  ...fallbackContent,
  ...data,
  importantDates: Array.isArray(data.importantDates)
    ? data.importantDates
    : fallbackContent.importantDates,
  submissionTypes: Array.isArray(data.submissionTypes)
    ? data.submissionTypes
    : fallbackContent.submissionTypes,
  engineeringTopics: Array.isArray(data.engineeringTopics)
    ? data.engineeringTopics
    : fallbackContent.engineeringTopics,
  environmentalTopics: Array.isArray(data.environmentalTopics)
    ? data.environmentalTopics
    : fallbackContent.environmentalTopics,
});

const getPublicCallForPaper = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/call-for-papers`, {
      cache: "no-store",
    });

    if (response.status === 404) return null;
    if (!response.ok) return fallbackContent;

    const result = (await response.json()) as CallForPaperResponse;

    if (!result.success || !result.data) return fallbackContent;

    return mergeCallForPaperContent(result.data);
  } catch (error) {
    console.error("Failed to load call for papers:", error);
    return fallbackContent;
  }
};

const normalizeHref = (url: string) => {
  if (!url) return "#";
  return resolveEmailActionUrl(url, "Journal of FST manuscript submission");
};

export default async function CallForPapersPage() {
  const content = await getPublicCallForPaper();

  if (!content) notFound();

  const activeImportantDates = [...content.importantDates]
    .filter((item) => item.isActive !== false)
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

  const pdfUrl = content.pdfUrl || fallbackContent.pdfUrl;

  return (
    <PublicLayout>
      <main className="bg-[#f7f8fb]">
        <Container className="py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="space-y-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div className="border-b border-slate-200 pb-6">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      {content.showInvitationLabel !== false && content.invitationLabel ? (
                        <p className="journal-subheading">{content.invitationLabel}</p>
                      ) : null}

                      <h1
                        className={`${content.showInvitationLabel !== false && content.invitationLabel ? "mt-3" : "mt-0"} text-[34px] font-semibold leading-tight text-slate-950 md:text-[42px]`}
                        style={{ fontFamily: "var(--font-source-serif)" }}
                      >
                        {content.title}
                      </h1>

                      {content.subtitle ? (
                        <p className="mt-3 max-w-3xl text-[16px] font-medium leading-7 text-slate-700">
                          {content.subtitle}
                        </p>
                      ) : null}

                      {content.description ? (
                        <p className="mt-4 max-w-3xl text-[15px] text-justify leading-8 text-slate-600">
                          {content.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <CallForPapersPdfViewer
                  pdfUrl={pdfUrl}
                  pdfTitle={content.pdfTitle}
                  pdfSubtitle={content.pdfSubtitle}
                />
              </div>

              <aside className="space-y-6 lg:hidden">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  {content.importantInfoLabel ? (
                    <p className="journal-subheading">{content.importantInfoLabel}</p>
                  ) : null}

                  <h2
                    className="mt-3 text-[26px] font-semibold leading-tight text-slate-950"
                    style={{ fontFamily: "var(--font-source-serif)" }}
                  >
                    {content.timelineTitle}
                  </h2>

                  <div className="mt-6 space-y-3">
                    {activeImportantDates.map((date, index) => (
                      <div
                        key={`${date.label}-${date.date}-${index}`}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <p className="text-[13px] text-slate-500">
                          {date.label}
                        </p>

                        <p className="mt-1 break-words text-[15px] font-semibold text-slate-900">
                          {date.date}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {content.posterImage ? (
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
                    <img
                      src={content.posterImage}
                      alt={`${content.title} poster`}
                      className="h-auto w-full rounded-2xl object-contain"
                    />
                  </div>
                ) : null}

                <div className="rounded-3xl border border-slate-200 bg-[#111433] p-6 text-white shadow-sm">
                  {content.submitSectionLabel ? (
                    <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">
                      {content.submitSectionLabel}
                    </p>
                  ) : null}

                  <h2
                    className="mt-3 text-[26px] font-semibold leading-tight text-white"
                    style={{ fontFamily: "var(--font-source-serif)" }}
                  >
                    {content.submitTitle}
                  </h2>

                  {content.submitDescription ? (
                    <p className="mt-4 text-[14px] leading-7 text-white/80">
                      {content.submitDescription}
                    </p>
                  ) : null}

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <a
                      href={normalizeHref(content.submissionButtonLink)}
                      target={normalizeHref(content.submissionButtonLink).startsWith("http") ? "_blank" : undefined}
                      rel={normalizeHref(content.submissionButtonLink).startsWith("http") ? "noreferrer" : undefined}
                      className="flex h-12 w-full items-center justify-center rounded-full bg-white px-2 text-center text-[12px] font-medium leading-tight text-[#111433] hover:bg-slate-100"
                    >
                      {content.submissionButtonLabel}
                    </a>

                    <Link
                      href={normalizeHref(content.guidelinesButtonLink)}
                      className="flex h-12 w-full items-center justify-center rounded-full border border-white/30 px-2 text-center text-[12px] font-medium leading-tight text-white hover:bg-white/10"
                    >
                      {content.guidelinesButtonLabel}
                    </Link>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  {content.contactSectionLabel ? (
                    <p className="journal-subheading">{content.contactSectionLabel}</p>
                  ) : null}

                  <h2
                    className="mt-3 text-[26px] font-semibold leading-tight text-slate-950"
                    style={{ fontFamily: "var(--font-source-serif)" }}
                  >
                    {content.contactTitle}
                  </h2>

                  <div className="mt-5 space-y-3 text-[14px] leading-7 text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-900">
                        {content.contactEditorLabel}
                      </span>
                      <br />
                      {content.contactEditorName}
                    </p>

                    <p>
                      <span className="font-semibold text-slate-900">
                        {content.publishedByLabel}
                      </span>
                      <br />
                      {content.publishedBy}
                    </p>

                    <p>{content.publisherName}</p>

                    <p>{content.publisherAddress}</p>

                    <p>
                      <span className="font-semibold text-slate-900">
                        Email:
                      </span>{" "}
                      {content.contactEmail}
                    </p>
                    {content.contactPhone ? (
                      <p>
                        <span className="font-semibold text-slate-900">
                          Phone:
                        </span>{" "}
                        {content.contactPhone}
                      </p>
                    ) : null}
                  </div>
                </div>
              </aside>


              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                {content.submissionFormatLabel ? (
                  <p className="journal-subheading">{content.submissionFormatLabel}</p>
                ) : null}

                <h2
                  className="mt-3 text-[30px] font-semibold leading-tight text-slate-950"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  {content.submissionFormatTitle}
                </h2>

                {content.submissionFormatDescription ? (
                  <p className="mt-4 text-[15px] leading-8 text-slate-600">
                    {content.submissionFormatDescription}
                  </p>
                ) : null}

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {content.submissionTypes.map((type) => (
                    <div
                      key={type}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[14px] font-medium leading-6 text-slate-700"
                    >
                      {type}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                {content.scopeLabel ? (
                  <p className="journal-subheading">{content.scopeLabel}</p>
                ) : null}

                <h2
                  className="mt-3 text-[30px] font-semibold leading-tight text-slate-950"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  {content.scopeTitle}
                </h2>

                {content.scopeDescription ? (
                  <p className="mt-4 text-[15px] leading-8 text-slate-600">
                    {content.scopeDescription}
                  </p>
                ) : null}

                {/* Mobile only: dropdown/accordion view for research areas */}
                <div className="mt-8 space-y-3 md:hidden">
                  <details className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 [&>summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-semibold leading-6 text-slate-950">
                      <span>{content.engineeringTitle}</span>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[20px] leading-none text-[#111433] shadow-sm transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>

                    <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
                      {content.engineeringTopics.map((topic, index) => (
                        <div
                          key={`${content.engineeringTitle}-${topic}-${index}`}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-medium leading-6 text-slate-700"
                        >
                          {topic}
                        </div>
                      ))}
                    </div>
                  </details>

                  <details className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 [&>summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-semibold leading-6 text-slate-950">
                      <span>{content.environmentalTitle}</span>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[20px] leading-none text-[#111433] shadow-sm transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>

                    <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
                      {content.environmentalTopics.map((topic, index) => (
                        <div
                          key={`${content.environmentalTitle}-${topic}-${index}`}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-medium leading-6 text-slate-700"
                        >
                          {topic}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>

                {/* Desktop/tablet: keep the full visible topic grid */}
                <div className="mt-8 hidden space-y-8 md:block">
                  <div>
                    <h3 className="text-[20px] font-semibold text-slate-950">
                      {content.engineeringTitle}
                    </h3>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {content.engineeringTopics.map((topic, index) => (
                        <div
                          key={`${content.engineeringTitle}-${topic}-${index}`}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[14px] font-medium leading-6 text-slate-700"
                        >
                          {topic}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[20px] font-semibold text-slate-950">
                      {content.environmentalTitle}
                    </h3>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {content.environmentalTopics.map((topic, index) => (
                        <div
                          key={`${content.environmentalTitle}-${topic}-${index}`}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[14px] font-medium leading-6 text-slate-700"
                        >
                          {topic}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                {content.finalSectionLabel ? (
                  <p className="journal-subheading">{content.finalSectionLabel}</p>
                ) : null}

                <h2
                  className="mt-3 text-[30px] font-semibold leading-tight text-slate-950"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  {content.finalSectionTitle}
                </h2>

                {content.finalSectionDescription ? (
                  <p className="mt-4 text-[15px] leading-8 text-slate-600">
                    {content.finalSectionDescription}
                  </p>
                ) : null}
              </div>
            </section>

            <aside className="hidden space-y-6 lg:block">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                {content.importantInfoLabel ? (
                    <p className="journal-subheading">{content.importantInfoLabel}</p>
                  ) : null}

                <h2
                  className="mt-3 text-[26px] font-semibold leading-tight text-slate-950"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  {content.timelineTitle}
                </h2>

                <div className="mt-6 space-y-3">
                  {activeImportantDates.map((date, index) => (
                    <div
                      key={`${date.label}-${date.date}-${index}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-[13px] text-slate-500">
                        {date.label}
                      </p>

                      <p className="mt-1 break-words text-[15px] font-semibold text-slate-900">
                        {date.date}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {content.posterImage ? (
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
                  <img
                    src={content.posterImage}
                    alt={`${content.title} poster`}
                    className="h-auto w-full rounded-2xl object-contain"
                  />
                </div>
              ) : null}

              <div className="rounded-3xl border border-slate-200 bg-[#111433] p-6 text-white shadow-sm">
                {content.submitSectionLabel ? (
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">
                    {content.submitSectionLabel}
                  </p>
                ) : null}

                <h2
                  className="mt-3 text-[26px] font-semibold leading-tight text-white"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  {content.submitTitle}
                </h2>

                {content.submitDescription ? (
                  <p className="mt-4 text-[14px] leading-7 text-white/80">
                    {content.submitDescription}
                  </p>
                ) : null}

                <a
                  href={normalizeHref(content.submissionButtonLink)}
                  target={normalizeHref(content.submissionButtonLink).startsWith("http") ? "_blank" : undefined}
                  rel={normalizeHref(content.submissionButtonLink).startsWith("http") ? "noreferrer" : undefined}
                  className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-white px-5 text-[14px] font-medium text-[#111433] hover:bg-slate-100"
                >
                  {content.submissionButtonLabel}
                </a>

                <Link
                  href={normalizeHref(content.guidelinesButtonLink)}
                  className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full border border-white/30 px-5 text-[14px] font-medium text-white hover:bg-white/10"
                >
                  {content.guidelinesButtonLabel}
                </Link>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                {content.contactSectionLabel ? (
                    <p className="journal-subheading">{content.contactSectionLabel}</p>
                  ) : null}

                <h2
                  className="mt-3 text-[26px] font-semibold leading-tight text-slate-950"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  {content.contactTitle}
                </h2>

                <div className="mt-5 space-y-3 text-[14px] leading-7 text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-900">
                      {content.contactEditorLabel}
                    </span>
                    <br />
                    {content.contactEditorName}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-900">
                      {content.publishedByLabel}
                    </span>
                    <br />
                    {content.publishedBy}
                  </p>

                  <p>{content.publisherName}</p>

                  <p>{content.publisherAddress}</p>

                  <p>
                    <span className="font-semibold text-slate-900">
                      Email:
                    </span>{" "}
                    {content.contactEmail}
                  </p>
                  {content.contactPhone ? (
                    <p>
                      <span className="font-semibold text-slate-900">
                        Phone:
                      </span>{" "}
                      {content.contactPhone}
                    </p>
                  ) : null}
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </main>
    </PublicLayout>
  );
}
