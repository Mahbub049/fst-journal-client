import Container from "@/components/common/Container";
import CmsContentRenderer from "@/components/common/CmsContentRenderer";
import PageTransition from "@/components/common/PageTransition";
import PublicLayout from "@/components/layout/PublicLayout";
import Link from "next/link";
import {
  getPublicPageByGroupAndSlug,
  getPublicPagesByGroup,
  PublicCmsPage,
  PublicContentBlock,
} from "@/services/publicPageService";

export const dynamic = "force-dynamic";

const fallbackPages: Record<
  string,
  {
    title: string;
    subtitle: string;
    blocks: PublicContentBlock[];
  }
> = {
  "reviewers-guideline": {
    title: "Reviewers Guideline",
    subtitle:
      "Guidance for reviewers participating in the Journal of FST double-blind peer review process.",
    blocks: [
      {
        type: "paragraph",
        title: "Reviewers",
        content:
          "Reviewers are an integral part of the double-blind peer review process, and their valuable comments are imperative for helping authors improve their research.",
        order: 1,
        isActive: true,
      },
      {
        type: "paragraph",
        title: "Reviewers Guideline",
        content:
          "All articles submitted to Journal of FST are reviewed by a minimum of two independent reviewers using a double-blind peer review process, where the identities of the reviewers and authors are concealed from each other. The reviewers’ evaluation form link can be added from the admin panel when the official document is available.",
        order: 2,
        isActive: true,
      },
    ],
  },
  "peer-review-process": {
    title: "Peer Review Process",
    subtitle:
      "The review process includes desk review, double-blind peer review, editorial decision, revision, and production.",
    blocks: [
      {
        type: "paragraph",
        title: "Review Process",
        content:
          "The review processes are Desk Review, Double-Blind Peer Review, Editorial Decision, and Production.",
        order: 1,
        isActive: true,
      },
      {
        type: "list",
        title: "Steps of Review",
        items: [
          "Initial Submission and Desk Review: Quality Check, Editor Assessment, and Desk Reject.",
          "Double-Blind Review: Selection of Reviewers, Double-Blind Review, and Evaluation.",
          "Editorial Decision: Accept, Minor Revisions, Major Revisions, or Reject.",
          "Revision and Production: Addressing Comments, Final Checks, and Production.",
        ],
        order: 2,
        isActive: true,
      },
      {
        type: "paragraph",
        title: "Editorial Screening / Desk Review",
        content:
          "The editorial board will verify whether the manuscript complies with the journal's scope, originality requirements, article quality, word limits, page limits, formatting requirements, manuscript structure, similarity threshold or plagiarism requirements, and ethical standards after initial submission.",
        order: 3,
        isActive: true,
      },
      {
        type: "paragraph",
        title: "Originality Checking / Double-Blind Review",
        content:
          "After desk acceptance, the article will be evaluated by a minimum of two subject experts.",
        order: 4,
        isActive: true,
      },
      {
        type: "paragraph",
        title: "Review and Decision / Editorial Decision",
        content:
          "The Editorial Board evaluates submitted manuscripts and makes publication decisions, including acceptance or rejection, based on subject experts' opinions and the journal's policy.",
        order: 5,
        isActive: true,
      },
      {
        type: "paragraph",
        title: "Revision Communication / Revision and Production",
        content:
          "Accepted manuscripts that require revision will be sent to authors with reviewer comments and editorial instructions via email. Revised manuscripts should be submitted according to the instructions provided by the editorial office.",
        order: 6,
        isActive: true,
      },
    ],
  },
};

const fallbackSideLinks = [
  {
    label: "Reviewers Guideline",
    href: "/reviewers/reviewers-guideline",
  },
  {
    label: "Peer Review Process",
    href: "/reviewers/peer-review-process",
  },
];

export default async function ReviewersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let cmsPage: PublicCmsPage | null = null;
  let cmsPages: PublicCmsPage[] = [];

  const [pageResult, pagesResult] = await Promise.allSettled([
    getPublicPageByGroupAndSlug("reviewers", slug),
    getPublicPagesByGroup("reviewers"),
  ]);

  if (pageResult.status === "fulfilled") cmsPage = pageResult.value;
  if (pagesResult.status === "fulfilled") cmsPages = pagesResult.value;

  const fallback =
    fallbackPages[slug] || fallbackPages["reviewers-guideline"];

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
        : fallback.blocks,
  };

  const sideLinks =
    cmsPages.length > 0
      ? [...cmsPages]
          .sort((a, b) => a.order - b.order)
          .map((page) => ({
            label: page.title,
            href: `/reviewers/${page.slug}`,
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
                <p className="journal-subheading">Reviewers</p>
              ) : null}

              <h1
                className={`${data.showTopLabel ? "mt-4" : "mt-0"} text-[32px] font-semibold leading-tight tracking-tight text-slate-950 md:text-[56px]`}
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                {data.title}
              </h1>

              {data.subtitle && (
                <p className="mt-5 max-w-4xl text-[15px] leading-7 text-slate-600 md:text-justify md:text-[16px] md:leading-8">
                  {data.subtitle}
                </p>
              )}

              {data.shortDescription && (
                <p className="mt-3 max-w-4xl text-[14px] leading-7 text-[#111111] md:text-[15px]">
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
                  Reviewers Menu
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
                          : "text-[#111111] hover:bg-[#eef8fc] hover:text-[#22b8e8]"
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
                      target={
                        data.buttonUrl.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        data.buttonUrl.startsWith("http")
                          ? "noreferrer"
                          : undefined
                      }
                      className="inline-flex items-center justify-center rounded-full bg-[#111433] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1b204a]"
                    >
                      {data.buttonLabel}
                    </a>
                  </article>
                )}
              </section>
            </div>
          </Container>
        </PageTransition>
      </main>
    </PublicLayout>
  );
}
