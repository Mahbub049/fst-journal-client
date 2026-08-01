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

const fallbackPageData: Record<
  string,
  {
    title: string;
    subtitle: string;
    content: string[];
  }
> = {
  "about-the-journal": {
    title: "About the Journal",
    subtitle:
      "A peer-reviewed academic journal of the Faculty of Science & Technology, Bangladesh University of Professionals.",
    content: [
      "BUP Faculty of Science & Technology Journal is an academic publication platform dedicated to high-quality research in science, technology, engineering, computing, and interdisciplinary fields.",
      "The journal encourages original research articles, review papers, technical notes, and scholarly discussions that contribute to academic knowledge and practical problem solving.",
      "It aims to support researchers, faculty members, students, and professionals by providing a reliable platform for research publication and academic visibility.",
    ],
  },
  "aims-scope": {
    title: "Aims & Scope",
    subtitle:
      "The journal publishes research across science, technology, engineering, and interdisciplinary domains.",
    content: [
      "The aim of the journal is to promote scholarly communication and research excellence in science and technology-based disciplines.",
      "The journal welcomes manuscripts in areas such as computer science, artificial intelligence, data science, software engineering, cybersecurity, environmental science, applied technology, and related interdisciplinary fields.",
      "Submissions should present clear contribution, sound methodology, academic originality, and relevance to current research or practical challenges.",
    ],
  },
  "policies-ethics": {
    title: "Policies & Ethics",
    subtitle:
      "The journal follows academic integrity, publication ethics, and transparent review standards.",
    content: [
      "Authors are expected to submit original work that has not been published or submitted elsewhere at the same time.",
      "All manuscripts should follow ethical research practices, proper citation standards, and responsible authorship guidelines.",
      "The journal does not tolerate plagiarism, duplicate submission, data fabrication, or unethical publication behavior.",
    ],
  },
  "open-access-statement": {
    title: "Open Access Statement",
    subtitle:
      "The journal supports accessible scholarly communication and research visibility.",
    content: [
      "BUP Faculty of Science & Technology Journal supports open academic communication by making published research accessible to readers.",
      "Open Access helps increase research visibility, supports knowledge sharing, and allows researchers, students, and professionals to benefit from scholarly work.",
      "Authors should follow the journal’s copyright and licensing guidelines before publication.",
    ],
  },
  "abstracting-indexing": {
    title: "Abstracting & Indexing",
    subtitle:
      "Indexing information and database coverage will be updated as the journal develops.",
    content: [
      "The journal aims to improve discoverability through academic indexing, abstracting services, and research databases.",
      "Indexing information will be updated as the journal expands its publication profile and fulfills relevant database requirements.",
      "Researchers are encouraged to cite published articles properly to improve academic reach and visibility.",
    ],
  },
};

const fallbackSideLinks = [
  { label: "About the Journal", href: "/about/about-the-journal" },
  { label: "Aims & Scope", href: "/about/aims-scope" },
  { label: "Policies & Ethics", href: "/about/policies-ethics" },
  { label: "Open Access Statement", href: "/about/open-access-statement" },
  { label: "Abstracting & Indexing", href: "/about/abstracting-indexing" },
];

const getFallbackBlocks = (content: string[]): PublicContentBlock[] => {
  return content.map((paragraph, index) => ({
    type: "paragraph",
    content: paragraph,
    order: index + 1,
    isActive: true,
  }));
};

const getBlockTextLength = (block: PublicContentBlock): number => {
  const stripHtml = (value?: string) =>
    String(value || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

  return (
    stripHtml(block.title).length +
    stripHtml(block.content).length +
    (block.items || []).reduce((total, item) => total + stripHtml(item).length, 0) +
    (block.children || []).reduce(
      (total, child) => total + getBlockTextLength(child),
      0
    )
  );
};

const hasLargeMedia = (block: PublicContentBlock): boolean =>
  ["image", "video", "table", "columns"].includes(block.type) ||
  (block.children || []).some((child) => hasLargeMedia(child));

const shouldCenterCompactContent = (blocks: PublicContentBlock[]) => {
  const activeBlocks = blocks.filter((block) => block.isActive);
  if (activeBlocks.some((block) => hasLargeMedia(block))) return false;

  const textLength = activeBlocks.reduce(
    (total, block) => total + getBlockTextLength(block),
    0
  );

  return textLength > 0 && textLength <= 900;
};

export default async function AboutInnerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let cmsPage: PublicCmsPage | null = null;
  let cmsPages: PublicCmsPage[] = [];

  try {
    const [pageResponse, pagesResponse] = await Promise.all([
      getPublicPageByGroupAndSlug("about", slug),
      getPublicPagesByGroup("about"),
    ]);

    cmsPage = pageResponse;
    cmsPages = pagesResponse;
  } catch {
    cmsPage = null;
    cmsPages = [];
  }

  const fallback = fallbackPageData[slug] || fallbackPageData["about-the-journal"];
  const data = {
    title: cmsPage?.title || fallback.title,
    showTopLabel: cmsPage?.showTopLabel !== false,
    subtitle: cmsPage?.subtitle || fallback.subtitle,
    bannerImage: cmsPage?.bannerImage || "",
    buttonLabel: cmsPage?.buttonLabel || "",
    buttonUrl: cmsPage?.buttonUrl || "",
    showButton: cmsPage?.showButton !== false,
    buttonIcon: cmsPage?.buttonIcon || "none",
    buttonVariant: cmsPage?.buttonVariant || "primary",
    buttonOpenInNewTab: cmsPage?.buttonOpenInNewTab,
    contentBlocks:
      cmsPage?.contentBlocks && cmsPage.contentBlocks.length > 0
        ? [...cmsPage.contentBlocks].sort((a, b) => a.order - b.order)
        : getFallbackBlocks(fallback.content),
  };

  const centerCompactContent = shouldCenterCompactContent(data.contentBlocks);

  const sideLinks =
    cmsPages.length > 0
      ? cmsPages.map((page) => ({
          label: page.title,
          href: page.slug === "contact-us" ? "/contact" : `/about/${page.slug}`,
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
                <p className="journal-subheading">About</p>
              ) : null}

              <h1
                className={`${data.showTopLabel ? "mt-4" : "mt-0"} text-[32px] font-semibold leading-tight tracking-tight text-slate-950 md:text-[56px]`}
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                {data.title}
              </h1>

              <p className="mt-5 max-w-3xl pr-2 hyphens-auto md:pr-0 text-justify text-[15px] leading-7 text-slate-600 [text-align-last:left] md:text-left md:text-[16px] md:leading-8 md:[text-align-last:auto]">
                {data.subtitle}
              </p>

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
                  About Menu
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

              <section
                className={`flex rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-9 ${
                  centerCompactContent ? "flex-col justify-center" : "block"
                }`}
              >
                <CmsContentRenderer
                  blocks={data.contentBlocks}
                  variant="about"
                  pageAction={{
                    label: data.buttonLabel,
                    url: data.buttonUrl,
                    show: data.showButton,
                    icon: data.buttonIcon,
                    variant: data.buttonVariant,
                    openInNewTab: data.buttonOpenInNewTab,
                  }}
                />
              </section>
            </div>
          </Container>
        </PageTransition>
      </main>
    </PublicLayout>
  );
}
