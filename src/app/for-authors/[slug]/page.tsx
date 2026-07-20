import Container from "@/components/common/Container";
import CmsContentRenderer from "@/components/common/CmsContentRenderer";
import PageTransition from "@/components/common/PageTransition";
import PublicLayout from "@/components/layout/PublicLayout";
import Link from "next/link";
import { buildGmailComposeUrl } from "@/lib/emailLinks";
import { getPublicEditorialBoardConfig } from "@/services/editorialBoardService";
import {
  getPublicPageByGroupAndSlug,
  getPublicPagesByGroup,
  PublicCmsPage,
  PublicContentBlock,
} from "@/services/publicPageService";

export const dynamic = "force-dynamic";

const pageData: Record<
  string,
  {
    title: string;
    subtitle: string;
    sections: { heading: string; body: string | string[] }[];
  }
> = {
  "author-guidelines": {
    title: "Author Guidelines",
    subtitle:
      "Detailed instructions for preparing manuscripts for the BUP Faculty of Science and Technology Journal.",
    sections: [
      {
        heading: "Before the Beginning",
        body: "Authors are requested to carefully review the journal guidelines and manuscript template before submission. All necessary information will be available at the official website of Bangladesh University of Professionals through the journal section.",
      },
      {
        heading: "Manuscript Structure",
        body: [
          "Title page with title of the study, corresponding author details, and co-author details.",
          "Abstract with a maximum of 250 words.",
          "Maximum 6 keywords.",
          "Main body including Introduction, Methodology, Result and Discussion, and Conclusion.",
          "References following APA 7 format or the latest edition.",
          "All figures with relevant captions.",
          "All tables including titles, descriptions, and footnotes.",
          "Indicate clearly if colour should be used for any figures in print.",
          "Graphical abstract or highlights file, where applicable.",
          "Page limit: maximum 20 pages.",
          "Plagiarism should be less than 20%.",
          "Supplementary files, where applicable.",
        ],
      },
      {
        heading: "Language and Formatting",
        body: "The manuscript should be spell-checked and grammar-checked before submission. Authors should write clearly, concisely, and avoid overly long articles. The manuscript should follow the journal template and accepted academic formatting standards.",
      },
      {
        heading: "Ethical Responsibility",
        body: "Authors must ensure that the manuscript is original, has not been published previously, and is not under consideration for publication elsewhere. Permission must be obtained for the use of copyrighted materials from other sources, including internet sources.",
      },
    ],
  },

  "submission-guidelines": {
    title: "Submission Guidelines",
    subtitle:
      "Submission instructions, required documents, and communication process for authors.",
    sections: [
      {
        heading: "Submission Email",
        body: "Authors should send their manuscripts and required documents to the official journal email address: journal.fst@bup.edu.bd.",
      },
      {
        heading: "Submission Checklist",
        body: [
          "One author must be designated as the corresponding author.",
          "Corresponding author contact details must include email address and full postal address.",
          "The manuscript must include title page, abstract, keywords, main body, references, tables, figures, and supplementary files where applicable.",
          "The manuscript should follow the template provided on the journal website.",
          "The manuscript should be checked for spelling and grammar before submission.",
          "A declaration of conflict of interest should be included.",
        ],
      },
      {
        heading: "Communication Process",
        body: "All correspondence, including notification of the editor's decisions and requests for revision, will be sent by email. Authors should keep their contact information updated during the full submission and review process.",
      },
      {
        heading: "Submission Deadline",
        body: "The last date of manuscript submission for the current issue is 30th November 2026.",
      },
    ],
  },

  "peer-review-process": {
    title: "Peer Review Process",
    subtitle:
      "The editorial board reviews submitted manuscripts before publication.",
    sections: [
      {
        heading: "Editorial Screening",
        body: "After submission, the editorial office checks whether the manuscript follows the journal scope, formatting rules, required structure, plagiarism limit, and ethical requirements.",
      },
      {
        heading: "Originality Checking",
        body: "For verifying originality, the article may be checked by an originality detection service or similarity checker.",
      },
      {
        heading: "Review and Decision",
        body: "The editorial board reviews the submitted manuscripts and makes publication decisions based on quality, originality, relevance, clarity, and compliance with journal guidelines.",
      },
      {
        heading: "Revision Communication",
        body: "If revision is required, authors will receive editorial comments or instructions through email. Revised manuscripts should be submitted according to the instructions provided by the editorial office.",
      },
    ],
  },

  "article-processing-charge": {
    title: "Article Processing Charge",
    subtitle:
      "Information about article processing or publication-related charges.",
    sections: [
      {
        heading: "Current Information",
        body: "The provided journal document does not mention any specific article processing charge. Authors should contact the editorial office for the latest information before submission.",
      },
      {
        heading: "Editorial Contact",
        body: "For updated information regarding submission, processing, or publication-related requirements, authors may contact the journal office through journal.fst@bup.edu.bd.",
      },
    ],
  },

  "copyright-licensing": {
    title: "Copyright & Licensing",
    subtitle:
      "Rules regarding originality, copyright permission, and author responsibility.",
    sections: [
      {
        heading: "Original Work Declaration",
        body: "Submission of an article implies that the work described has not been published previously, is not under consideration for publication elsewhere, and has been approved by all authors and responsible authorities where the work was carried out.",
      },
      {
        heading: "Copyright Permission",
        body: "Authors must obtain permission for the use of copyrighted materials from other sources, including materials collected from the internet.",
      },
      {
        heading: "Publication Restriction",
        body: "If accepted, the article must not be published elsewhere in the same form, in English or in any other language, including electronic versions, without written permission from the copyright holder.",
      },
      {
        heading: "Conflict of Interest",
        body: "Authors should submit a declaration of conflict of interest with the manuscript.",
      },
    ],
  },

  templates: {
    title: "Templates",
    subtitle:
      "Manuscript template and final accepted paper formatting instructions.",
    sections: [
      {
        heading: "Manuscript Template",
        body: "Authors should follow the official manuscript template provided on the journal website before preparing and submitting their article.",
      },
      {
        heading: "Final Accepted Papers",
        body: "Authors must submit their final accepted articles in both Word and LaTeX formats. All figures must be submitted separately in both colour and grayscale versions.",
      },
      {
        heading: "Reference Style",
        body: "References should follow APA style, preferably APA 7 format or the latest edition recommended by the journal.",
      },
      {
        heading: "DOI Information",
        body: "All finally accepted articles will be provided with a DOI.",
      },
    ],
  },
};


const fallbackSideLinks = [
  { label: "Author Guidelines", href: "/for-authors/author-guidelines" },
  { label: "Submission Guidelines", href: "/for-authors/submission-guidelines" },
  { label: "Peer Review Process", href: "/for-authors/peer-review-process" },
  {
    label: "Article Processing Charge",
    href: "/for-authors/article-processing-charge",
  },
  {
    label: "Copyright & Licensing",
    href: "/for-authors/copyright-licensing",
  },
  { label: "Templates", href: "/for-authors/templates" },
];


const getFallbackBlocks = (
  sections: { heading: string; body: string | string[] }[]
): PublicContentBlock[] => {
  return sections.map((section, index) => {
    if (Array.isArray(section.body)) {
      return {
        type: "list",
        title: section.heading,
        items: section.body,
        order: index + 1,
        isActive: true,
      };
    }

    return {
      type: "paragraph",
      title: section.heading,
      content: section.body,
      order: index + 1,
      isActive: true,
    };
  });
};

export default async function ForAuthorsInnerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let cmsPage: PublicCmsPage | null = null;
  let cmsPages: PublicCmsPage[] = [];
  let editorialOfficeEmail = "journal.fst@bup.edu.bd";

  const [pageResult, pagesResult, officeResult] = await Promise.allSettled([
    getPublicPageByGroupAndSlug("for-authors", slug),
    getPublicPagesByGroup("for-authors"),
    getPublicEditorialBoardConfig(),
  ]);

  if (pageResult.status === "fulfilled") cmsPage = pageResult.value;
  if (pagesResult.status === "fulfilled") cmsPages = pagesResult.value;
  if (officeResult.status === "fulfilled" && officeResult.value.editorialOfficeEmail) {
    editorialOfficeEmail = officeResult.value.editorialOfficeEmail;
  }

  const fallback = pageData[slug] || pageData["author-guidelines"];
  const data = {
    title: cmsPage?.title || fallback.title,
    showTopLabel: cmsPage?.showTopLabel !== false,
    subtitle: cmsPage?.subtitle || fallback.subtitle,
    shortDescription: cmsPage?.shortDescription || "",
    bannerImage: cmsPage?.bannerImage || "",
    buttonLabel: cmsPage?.buttonLabel || "",
    buttonUrl: cmsPage?.buttonUrl || "",
    contentBlocks:
      cmsPage?.contentBlocks && cmsPage.contentBlocks.length > 0
        ? [...cmsPage.contentBlocks].sort((a, b) => a.order - b.order)
        : getFallbackBlocks(fallback.sections),
  };

  const sideLinks =
    cmsPages.length > 0
      ? cmsPages.map((page) => ({
          label: page.title,
          href: `/for-authors/${page.slug}`,
        }))
      : fallbackSideLinks;

  return (
    <PublicLayout>
      <main className="bg-[#f7f8fb]">
        <PageTransition>
          <section
            id="page-start"
            className="scroll-mt-[78px] border-b border-slate-200 bg-white"
          >
            <Container className="py-12 md:py-16">
              {data.showTopLabel ? (
                <p className="journal-subheading">For Authors</p>
              ) : null}

              <h1
                className={`${data.showTopLabel ? "mt-4" : "mt-0"} text-[32px] font-semibold leading-tight tracking-tight text-slate-950 md:text-[56px]`}
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                {data.title}
              </h1>

              {data.subtitle && (
                <p className="mt-5 max-w-3xl text-[15px] leading-7 text-slate-600 md:text-justify md:text-[16px] md:leading-8">
                  {data.subtitle}
                </p>
              )}

              {data.shortDescription && (
                <p className="mt-3 max-w-3xl text-[14px] leading-7 text-slate-500 md:text-[15px]">
                  {data.shortDescription}
                </p>
              )}

              {data.bannerImage && (
                <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                  <img
                    src={data.bannerImage}
                    alt={data.title}
                    className="max-h-[360px] w-full rounded-2xl object-cover"
                  />
                </div>
              )}
            </Container>
          </section>

          <Container className="py-10 md:py-14">
            <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
                <aside className="h-fit self-start rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-[106px] lg:max-h-[calc(100vh-126px)] lg:overflow-y-auto">
                  <p className="px-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#111433]">
                    Author Menu
                  </p>

                  <div className="mt-4 grid gap-2">
                    {sideLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={`${link.href}#page-start`}
                        scroll={false}
                        className={`rounded-2xl px-4 py-3 text-[14px] font-medium transition ${
                          link.href.endsWith(slug)
                            ? "bg-[#111433] text-white"
                            : "text-slate-600 hover:bg-[#eef8fc] hover:text-[#22b8e8]"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </aside>

                <section className="space-y-5 text-justify">
                  <CmsContentRenderer
                    blocks={data.contentBlocks}
                    variant="authors"
                  />

                  {data.buttonLabel && data.buttonUrl && (
                    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
                      <a
                        href={data.buttonUrl}
                        target={data.buttonUrl.startsWith("http") ? "_blank" : undefined}
                        rel={data.buttonUrl.startsWith("http") ? "noreferrer" : undefined}
                        className="inline-flex items-center justify-center rounded-full bg-[#111433] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1b204a]"
                      >
                        {data.buttonLabel}
                      </a>
                    </article>
                  )}

                  <div className="rounded-3xl border border-slate-200 bg-[#111433] p-5 text-white shadow-sm md:p-7">
                    <h2
                      className="text-[22px] font-semibold leading-tight md:text-[28px]"
                      style={{ fontFamily: "var(--font-source-serif)" }}
                    >
                      Need help preparing your manuscript?
                    </h2>

                    <p className="mt-4 text-[15px] leading-7 text-white/80 md:text-justify">
                      Please review the author guidelines, submission checklist,
                      and call for papers notice before final submission.
                      Manuscripts and related documents should be sent to{" "}
                      {editorialOfficeEmail}.
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                      <Link
                        href="/call-for-papers"
                        className="flex h-12 w-full items-center justify-center rounded-full bg-white px-2 text-center text-[12px] font-medium leading-tight text-[#111433] hover:bg-slate-100 sm:h-11 sm:w-auto sm:px-6 sm:text-[14px]"
                      >
                        View Call for Papers
                      </Link>

                      <a
                        href={buildGmailComposeUrl(
                          editorialOfficeEmail,
                          "Journal of FST editorial office inquiry"
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-12 w-full items-center justify-center rounded-full border border-white/30 px-2 text-center text-[12px] font-medium leading-tight text-white hover:bg-white/10 sm:h-11 sm:w-auto sm:px-6 sm:text-[14px]"
                      >
                        Email Editorial Office
                      </a>
                    </div>
                  </div>
                </section>
            </div>
          </Container>
        </PageTransition>
      </main>
    </PublicLayout>
  );
}
