import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";
import Link from "next/link";
import { notFound } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getArticleDownloadUrl(issueSlug: string, articleSlug: string) {
  return `${API_URL}/issues/${issueSlug}/articles/${articleSlug}/download`;
}

async function getArticleDetails(slug: string, articleSlug: string) {
  try {
    const res = await fetch(
      `${API_URL}/issues/${slug}/articles/${articleSlug}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Article details fetch error:", error);
    return null;
  }
}

export default async function ArticleDetailsPage({
  params,
}: {
  params: Promise<{
    slug: string;
    articleSlug: string;
  }>;
}) {
  const { slug, articleSlug } = await params;

  const details = await getArticleDetails(slug, articleSlug);

  if (!details) {
    notFound();
  }

  const { issue, article } = details;

  return (
    <PublicLayout>
      <main className="bg-[#f7f8fb]">
        <Container className="py-10 md:py-12">
          {/* Breadcrumb */}
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[14px] text-slate-600 shadow-sm">
            <Link href="/" className="font-medium text-[#111433] hover:underline">
              Home
            </Link>
            <span className="mx-2">/</span>

            <Link
              href={`/issues/${issue.slug}`}
              className="font-medium text-[#111433] hover:underline"
            >
              {issue.title}, Volume {issue.volume}, Issue {issue.issueNumber}
            </Link>

            <span className="mx-2">/</span>
            <span>Article Details</span>
          </div>

          {/* Article Title */}
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <p className="journal-subheading">{article.articleType || "Research Article"}</p>

            <h1
              className="mt-4 text-[28px] font-semibold leading-tight text-slate-950 md:text-[38px]"
              style={{ fontFamily: "var(--font-source-serif)" }}
            >
              {article.title}
            </h1>

            <div className="mt-5 h-[2px] w-full bg-[#22b8e8]" />

            <p className="mt-5 text-[15px] leading-7 text-slate-600">
              <span className="font-semibold text-slate-950">Author(s): </span>
              {article.authors?.join(", ") || "Not available"}
            </p>
          </section>

          {/* Main Content */}
          <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            {/* Left */}
            <div className="space-y-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <h2 className="text-[20px] font-bold text-slate-950">
                  Article Information
                </h2>

                <div className="mt-5 space-y-3 text-[15px] leading-7 text-slate-700">
                  <InfoLine
                    label="Article Info"
                    value={`${issue.title}, ISSN: ${issue.issn}, Volume - ${issue.volume}, Issue - ${issue.issueNumber}, ${issue.publishDateLabel}, Article #${article.order || "-"}`}
                  />

                  <InfoLine
                    label="Publish Date"
                    value={article.publishDate || "-"}
                  />

                  <InfoLine
                    label="Author(s)"
                    value={article.authors?.join(", ") || "-"}
                  />

                  {article.doi ? (
                    <div>
                      <span className="font-bold text-slate-950">DOI: </span>
                      <a
                        href={article.doi}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-words text-[#111433] hover:text-[#22b8e8] hover:underline"
                      >
                        {article.doi}
                      </a>
                    </div>
                  ) : (
                    <InfoLine label="DOI" value="-" />
                  )}

                  <InfoLine
                    label="Keywords"
                    value={
                      article.keywords?.length > 0
                        ? article.keywords.join(", ")
                        : "Keywords have not been added yet."
                    }
                  />

                  <InfoLine
                    label="User Activity"
                    value={`Views: ${article.views ?? "-"}, Downloads: ${
                      article.downloads ?? "-"
                    }`}
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <h2 className="text-[20px] font-bold text-slate-950">
                  Abstract
                </h2>

                {article.abstract ? (
<p className="mt-4 text-justify text-[15px] italic leading-8 text-slate-700">
  {article.abstract}
</p>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-[14px] leading-7 text-slate-500">
                    Abstract has not been added yet.
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <h2 className="text-[20px] font-bold text-slate-950">
                  Citation Information
                </h2>

                <div className="mt-5 space-y-3 text-[15px] leading-7 text-slate-700">
<p className="text-justify">
  {article.authors?.join(", ") || "Author(s)"}. (
  {article.publishDate || issue.publishDateLabel}).{" "}
  <span className="font-medium">{article.title}</span>.{" "}
  <span className="italic">{issue.title}</span>, Volume{" "}
  {issue.volume}, Issue {issue.issueNumber}
  {article.pages ? `, ${article.pages}` : ""}.
</p>

                  {article.doi ? (
                    <p>
                      <span className="font-semibold text-slate-950">DOI:</span>{" "}
                      <a
                        href={article.doi}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-words text-[#111433] hover:text-[#22b8e8] hover:underline"
                      >
                        {article.doi}
                      </a>
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-[106px] lg:self-start">
              <div className="rounded-3xl bg-[#1f6fb2] p-6 text-white shadow-sm">
                <h3 className="text-[18px] font-bold">Article Download</h3>

                <p className="mt-3 text-[14px] leading-6 text-white/90">
                  Access the full paper using the official PDF link.
                </p>

                {article.pdfUrl ? (
                  <a
                    href={getArticleDownloadUrl(issue.slug, article.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-white px-5 text-[14px] font-bold text-[#111433] transition hover:bg-slate-100"
                  >
                    PDF
                  </a>
                ) : (
                  <div className="mt-5 rounded-full bg-white/20 px-5 py-3 text-center text-[14px] font-semibold">
                    PDF Not Available
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="journal-subheading">Issue</p>

                <h3 className="mt-4 text-[18px] font-bold leading-6 text-slate-950">
                  {issue.title}
                </h3>

                <p className="mt-3 text-[14px] leading-6 text-slate-600">
                  Volume {issue.volume}, Issue {issue.issueNumber}
                </p>

                <p className="mt-1 text-[14px] text-slate-500">
                  {issue.publishDateLabel}
                </p>

                <Link
                  href={`/issues/${issue.slug}`}
                  className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-[14px] font-semibold text-[#111433] transition hover:bg-slate-50"
                >
                  View Issue
                </Link>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="journal-subheading">Quick Info</p>

                <div className="mt-5 divide-y divide-slate-100">
                  <SideInfo label="Article ID" value={article.articleId || "-"} />
                  <SideInfo label="Pages" value={article.pages || "-"} />
                  <SideInfo
                    label="Views"
                    value={String(article.views ?? "-")}
                  />
                  <SideInfo
                    label="Downloads"
                    value={String(article.downloads ?? "-")}
                  />
                </div>
              </div>

              {article.articleUrl ? (
                <a
                  href={article.articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-[14px] font-semibold text-[#111433] shadow-sm transition hover:bg-slate-50"
                >
                  Original Article Page
                </a>
              ) : null}
            </aside>
          </section>
        </Container>
      </main>
    </PublicLayout>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-bold text-slate-950">{label}: </span>
      {value}
    </p>
  );
}

function SideInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3">
      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-[14px] font-semibold text-slate-800">{value}</p>
    </div>
  );
}