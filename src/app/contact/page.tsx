import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";
import {
  getPublicPageByGroupAndSlug,
  PublicCmsPage,
  PublicContentBlock,
} from "@/services/publicPageService";

export const dynamic = "force-dynamic";

const splitContent = (content?: string) =>
  (content || "")
    .split("\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

function ContactContentBlock({ block }: { block: PublicContentBlock }) {
  if (!block.isActive) return null;

  if (block.type === "heading") {
    return (
      <h2
        className="text-[24px] font-semibold leading-tight text-slate-950 md:text-[30px]"
        style={{ fontFamily: "var(--font-source-serif)" }}
      >
        {block.title || block.content}
      </h2>
    );
  }

  if (block.type === "paragraph") {
    return (
      <div>
        {block.title ? (
          <h2
            className="text-[24px] font-semibold leading-tight text-slate-950 md:text-[30px]"
            style={{ fontFamily: "var(--font-source-serif)" }}
          >
            {block.title}
          </h2>
        ) : null}

        <div className={block.title ? "mt-4 space-y-3" : "space-y-3"}>
          {splitContent(block.content).map((paragraph, index) => (
            <p
              key={index}
              className="text-[15px] leading-7 text-slate-600 md:text-justify md:text-[16px] md:leading-8"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "list") {
    return (
      <div>
        {block.title ? (
          <h2
            className="text-[24px] font-semibold leading-tight text-slate-950 md:text-[30px]"
            style={{ fontFamily: "var(--font-source-serif)" }}
          >
            {block.title}
          </h2>
        ) : null}

        <ul className="mt-4 space-y-3 text-[15px] leading-7 text-slate-600 md:text-[16px] md:leading-8">
          {(block.items || []).map((item, index) => (
            <li key={`${item}-${index}`} className="flex gap-3 md:text-justify">
              <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-[#22b8e8]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (block.type === "card") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        {block.title ? (
          <h3 className="text-xl font-bold text-slate-950">{block.title}</h3>
        ) : null}
        {splitContent(block.content).map((paragraph, index) => (
          <p
            key={index}
            className="mt-3 text-[14px] leading-7 text-slate-600 md:text-justify md:text-[15px]"
          >
            {paragraph}
          </p>
        ))}
      </div>
    );
  }

  if (block.type === "image" && block.imageUrl) {
    return (
      <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <img
          src={block.imageUrl}
          alt={block.title || "Contact page image"}
          className="w-full rounded-xl object-cover"
        />
        {block.title ? (
          <figcaption className="mt-3 text-center text-sm text-slate-500">
            {block.title}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  if (block.type === "pdf" && block.fileUrl) {
    return (
      <a
        href={block.fileUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center rounded-full bg-[#111433] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1b204a]"
      >
        {block.title || "Open Document"}
      </a>
    );
  }

  if (block.type === "button" && block.buttonUrl) {
    const isExternal = block.buttonUrl.startsWith("http");

    return (
      <a
        href={block.buttonUrl}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
        className="inline-flex items-center justify-center rounded-full bg-[#111433] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1b204a]"
      >
        {block.buttonLabel || block.title || "Learn More"}
      </a>
    );
  }

  return null;
}

export default async function ContactPage() {
  let cmsPage: PublicCmsPage | null = null;

  try {
    cmsPage = await getPublicPageByGroupAndSlug("about", "contact-us");
  } catch {
    cmsPage = null;
  }

  const title = cmsPage?.title || "Contact Us";
  const subtitle =
    cmsPage?.subtitle ||
    "For journal-related queries, publication information, and author support, please contact the editorial office.";
  const contentBlocks = [...(cmsPage?.contentBlocks || [])]
    .filter((block) => block.isActive)
    .sort((a, b) => a.order - b.order);

  return (
    <PublicLayout>
      <main className="bg-[#f7f8fb]">
        <section className="border-b border-slate-200 bg-white">
          <Container className="py-12 md:py-16">
            <p className="journal-subheading">Contact</p>

            <h1
              className="mt-4 text-[40px] font-semibold leading-tight tracking-tight text-slate-950 md:text-[56px]"
              style={{ fontFamily: "var(--font-source-serif)" }}
            >
              {title}
            </h1>

            <p className="mt-5 max-w-3xl text-[16px] leading-8 text-slate-600">
              {subtitle}
            </p>

            {cmsPage?.bannerImage ? (
              <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                <img
                  src={cmsPage.bannerImage}
                  alt={title}
                  className="max-h-[360px] w-full rounded-2xl object-cover"
                />
              </div>
            ) : null}
          </Container>
        </section>

        <Container className="py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-8">
              {contentBlocks.length > 0 ? (
                <div className="mb-8 space-y-6 border-b border-slate-200 pb-8">
                  {contentBlocks.map((block, index) => (
                    <ContactContentBlock
                      key={block._id || `${block.type}-${index}`}
                      block={block}
                    />
                  ))}
                </div>
              ) : null}

              <p className="journal-subheading">Editorial Office</p>

              <h2
                className="mt-3 text-[30px] font-semibold leading-tight text-slate-950"
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                BUP Faculty of Science & Technology Journal
              </h2>

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[13px] text-slate-500">Published By</p>
                  <p className="mt-2 text-[15px] font-medium leading-7 text-slate-900">
                    Faculty of Science & Technology
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[13px] text-slate-500">Institution</p>
                  <p className="mt-2 text-[15px] font-medium leading-7 text-slate-900">
                    Bangladesh University of Professionals
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[13px] text-slate-500">Address</p>
                  <p className="mt-2 text-[15px] font-medium leading-7 text-slate-900">
                    Mirpur Cantonment, Dhaka - 1216
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[13px] text-slate-500">Email</p>
                  <p className="mt-2 text-[15px] font-medium leading-7 text-slate-900">
                    editor.fstjournal@bup.edu.bd
                  </p>
                </div>
              </div>

              {cmsPage?.buttonLabel && cmsPage.buttonUrl ? (
                <a
                  href={cmsPage.buttonUrl}
                  target={cmsPage.buttonUrl.startsWith("http") ? "_blank" : undefined}
                  rel={cmsPage.buttonUrl.startsWith("http") ? "noreferrer" : undefined}
                  className="mt-7 inline-flex items-center justify-center rounded-full bg-[#111433] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1b204a]"
                >
                  {cmsPage.buttonLabel}
                </a>
              ) : null}
            </section>

            <aside className="rounded-3xl border border-slate-200 bg-[#111433] p-7 text-white shadow-sm">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">
                Office Note
              </p>

              <h2
                className="mt-3 text-[30px] font-semibold leading-tight"
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                Author Support
              </h2>

              <p className="mt-4 text-[15px] leading-8 text-white/80">
                Authors are requested to review the submission guidelines before
                contacting the editorial office regarding manuscript preparation,
                formatting, or publication queries.
              </p>
            </aside>
          </div>
        </Container>
      </main>
    </PublicLayout>
  );
}
