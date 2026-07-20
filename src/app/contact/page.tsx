import CmsContentRenderer from "@/components/common/CmsContentRenderer";
import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";
import {
  EditorialBoardPageSettings,
  getPublicEditorialBoardConfig,
} from "@/services/editorialBoardService";
import {
  getPublicPageByGroupAndSlug,
  PublicCmsPage,
} from "@/services/publicPageService";

export const dynamic = "force-dynamic";

const fallbackOffice: Pick<
  EditorialBoardPageSettings,
  | "editorialOfficeTitle"
  | "editorialOfficeDescription"
  | "editorialOfficePublisher"
  | "editorialOfficeInstitution"
  | "editorialOfficeAddress"
  | "editorialOfficeEmail"
  | "editorialOfficePhone"
> = {
  editorialOfficeTitle: "Editorial Office",
  editorialOfficeDescription:
    "For journal-related queries, manuscript preparation, publication information, and author support, please contact the editorial office.",
  editorialOfficePublisher: "Faculty of Science & Technology",
  editorialOfficeInstitution: "Bangladesh University of Professionals",
  editorialOfficeAddress: "Mirpur Cantonment, Dhaka - 1216",
  editorialOfficeEmail: "editor.fstjournal@bup.edu.bd",
  editorialOfficePhone: "",
};

export default async function ContactPage() {
  let cmsPage: PublicCmsPage | null = null;
  let office = fallbackOffice;

  try {
    const [pageResult, officeResult] = await Promise.allSettled([
      getPublicPageByGroupAndSlug("about", "contact-us"),
      getPublicEditorialBoardConfig(),
    ]);

    if (pageResult.status === "fulfilled") cmsPage = pageResult.value;
    if (officeResult.status === "fulfilled") {
      office = { ...fallbackOffice, ...officeResult.value };
    }
  } catch {
    cmsPage = null;
  }

  const title = cmsPage?.title || "Contact Us";
  const subtitle =
    cmsPage?.subtitle ||
    "For journal-related queries, publication information, and author support, please contact the editorial office.";
  const contentBlocks = [...(cmsPage?.contentBlocks || [])]
    .filter((block) => block.isActive)
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

  const officeItems = [
    { label: "Published By", value: office.editorialOfficePublisher },
    { label: "Institution", value: office.editorialOfficeInstitution },
    { label: "Address", value: office.editorialOfficeAddress },
    { label: "Email", value: office.editorialOfficeEmail, type: "email" },
    { label: "Phone", value: office.editorialOfficePhone, type: "phone" },
  ].filter((item) => item.value?.trim());

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
                <div className="mb-8 border-b border-slate-200 pb-8">
                  <CmsContentRenderer blocks={contentBlocks} variant="contact" />
                </div>
              ) : null}

              <p className="journal-subheading">Editorial Office</p>

              <h2
                className="mt-3 text-[30px] font-semibold leading-tight text-slate-950"
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                {office.editorialOfficeTitle}
              </h2>

              {office.editorialOfficeDescription ? (
                <p className="mt-4 max-w-3xl text-[15px] leading-8 text-slate-600">
                  {office.editorialOfficeDescription}
                </p>
              ) : null}

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                {officeItems.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <p className="text-[13px] text-slate-500">{item.label}</p>
                    {item.type === "email" ? (
                      <a
                        href={`mailto:${item.value}`}
                        className="mt-2 block break-words text-[15px] font-medium leading-7 text-slate-900 hover:text-[#005A78]"
                      >
                        {item.value}
                      </a>
                    ) : item.type === "phone" ? (
                      <a
                        href={`tel:${item.value}`}
                        className="mt-2 block text-[15px] font-medium leading-7 text-slate-900 hover:text-[#005A78]"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-2 text-[15px] font-medium leading-7 text-slate-900">
                        {item.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {cmsPage?.buttonLabel && cmsPage.buttonUrl ? (
                <a
                  href={cmsPage.buttonUrl}
                  target={
                    cmsPage.buttonUrl.startsWith("http") ? "_blank" : undefined
                  }
                  rel={
                    cmsPage.buttonUrl.startsWith("http")
                      ? "noreferrer"
                      : undefined
                  }
                  className="mt-7 inline-flex items-center justify-center rounded-full bg-[#111433] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1b204a]"
                >
                  {cmsPage.buttonLabel}
                </a>
              ) : null}
            </section>

            <aside className="h-fit rounded-3xl border border-slate-200 bg-[#111433] p-7 text-white shadow-sm lg:sticky lg:top-[106px]">
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
                {office.editorialOfficeDescription ||
                  "Please review the submission guidelines before contacting the editorial office."}
              </p>

              {office.editorialOfficeEmail ? (
                <a
                  href={`mailto:${office.editorialOfficeEmail}`}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#111433] hover:bg-slate-100"
                >
                  Email Editorial Office
                </a>
              ) : null}
            </aside>
          </div>
        </Container>
      </main>
    </PublicLayout>
  );
}
