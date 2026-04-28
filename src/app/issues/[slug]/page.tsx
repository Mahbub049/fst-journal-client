import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Issue = {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  issn?: string;
  volume?: string;
  issueNumber?: string;
  publishDateLabel?: string;
  coverImage?: string;
  pdfUrl?: string;
  isRecent?: boolean;
  isPublished?: boolean;
  order?: number;
};

const issuePages: Record<
  string,
  {
    title: string;
    subtitle: string;
  }
> = {
  current: {
    title: "Current Issue",
    subtitle:
      "Explore the latest published issue of BUP Faculty of Science & Technology Journal.",
  },
  archive: {
    title: "All Issues / Archive",
    subtitle: "Browse previous volumes and issues published by the journal.",
  },
  special: {
    title: "Special Issues",
    subtitle:
      "Special issues focus on selected themes, emerging research areas, and invited academic topics.",
  },
  "most-cited": {
    title: "Most Cited",
    subtitle: "A collection of highly cited articles published in the journal.",
  },
  "most-read": {
    title: "Most Read",
    subtitle:
      "A collection of frequently viewed and widely read journal articles.",
  },
};

async function getPublicIssues(): Promise<Issue[]> {
  try {
    const res = await fetch(`${API_URL}/issues/recent`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch (error) {
    console.error("Public issues fetch error:", error);
    return [];
  }
}

async function getIssueDetails(slug: string) {
  try {
    const res = await fetch(`${API_URL}/issues/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Issue details fetch error:", error);
    return null;
  }
}

export default async function IssuesInnerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (issuePages[slug]) {
    const data = issuePages[slug];
    const issues = await getPublicIssues();

    return (
      <PublicLayout>
        <main className="bg-[#f7f8fb]">
          <Container className="py-8 md:py-10">
            <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-8">
              <div className="mb-8">
                <p className="journal-subheading">Published Issues</p>

                <h2
                  className="mt-3 text-[30px] font-semibold leading-tight text-slate-950"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  {data.title}
                </h2>
              </div>
              {issues.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <h3 className="text-lg font-semibold text-slate-800">
                    No issues found
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Add published and recent issues from the admin panel.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {issues.map((issue) => (
                    <Link
                      key={issue._id}
                      href={`/issues/${issue.slug}`}
                      className="block overflow-hidden rounded-3xl border border-slate-200 bg-[#fbfcfd] transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
                    >
                      <div className="relative aspect-[0.72] overflow-hidden bg-slate-100">
                        <Image
                          src={issue.coverImage || "/images/journal-cover.jpg"}
                          alt={issue.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>

                      <div className="p-5">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#111433]">
                          {issue.category || "Science & Technology"}
                          {issue.issn ? ` · ISSN ${issue.issn}` : ""}
                        </p>

                        <h3 className="mt-3 text-[17px] font-semibold leading-7 text-slate-950">
                          {issue.title}
                        </h3>

                        <p className="mt-2 text-[14px] text-slate-500">
                          Volume {issue.volume}, Issue {issue.issueNumber}
                          {issue.publishDateLabel ? `, ${issue.publishDateLabel}` : ""}
                        </p>

                        <span className="mt-5 inline-flex text-[14px] font-medium text-[#111433] hover:text-slate-950">
                          View issue →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </Container>
        </main>
      </PublicLayout>
    );
  }

  const details = await getIssueDetails(slug);

  if (!details) {
    notFound();
  }

  const { issue, articles } = details;

  return (
    <PublicLayout>
      <main className="bg-[#f7f8fb]">
        <section className="border-b border-slate-200 bg-white">
          <Container className="py-12 md:py-16">
            <p className="journal-subheading">Published Issue</p>

            <h1
              className="mt-4 text-[38px] font-semibold leading-tight tracking-tight text-slate-950 md:text-[52px]"
              style={{ fontFamily: "var(--font-source-serif)" }}
            >
              {issue.title}
            </h1>

            <p className="mt-5 max-w-3xl text-[16px] leading-8 text-slate-600">
              Volume {issue.volume}, Issue {issue.issueNumber},{" "}
              {issue.publishDateLabel}
            </p>

            <p className="mt-2 text-[14px] font-semibold text-[#111433]">
              ISSN {issue.issn}
            </p>
          </Container>
        </section>

        <Container className="py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-28">
              <div className="relative aspect-[0.72] overflow-hidden rounded-2xl bg-slate-100">
                <Image
                  src={issue.coverImage || "/images/journal-cover.jpg"}
                  alt={issue.title}
                  fill
                  sizes="320px"
                  className="object-cover"
                />
              </div>

              <div className="mt-5">
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#111433]">
                  Issue Information
                </p>

                <h2 className="mt-3 text-[20px] font-semibold text-slate-950">
                  Volume {issue.volume}, Issue {issue.issueNumber}
                </h2>

                <p className="mt-2 text-[14px] leading-6 text-slate-600">
                  Published: {issue.publishDateLabel}
                </p>

                {issue.pdfUrl ? (
                  <a
                    href={issue.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-[#111433] px-5 text-[14px] font-semibold text-white hover:bg-[#1e2557]"
                  >
                    Open Full Issue PDF
                  </a>
                ) : null}
              </div>
            </aside>

            <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-8">
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="journal-subheading">Table of Contents</p>

                  <h2
                    className="mt-3 text-[30px] font-semibold leading-tight text-slate-950"
                    style={{ fontFamily: "var(--font-source-serif)" }}
                  >
                    Articles in this Issue
                  </h2>
                </div>

                <span className="inline-flex h-11 w-fit items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-[14px] font-medium text-slate-700">
                  {articles.length} Articles
                </span>
              </div>

              <div className="mt-7 space-y-5">
                {articles.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-[14px] text-slate-500">
                    No articles have been added for this issue yet.
                  </div>
                ) : (
                  articles.map((article: any, index: number) => (
                    <article
                      key={article._id}
                      className="rounded-3xl border border-slate-200 bg-[#fbfcfd] p-6 transition hover:border-[#111433]/30 hover:bg-white hover:shadow-md"
                    >
                      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Article {index + 1}
                      </p>

                      <h3 className="mt-3 text-[22px] font-semibold leading-8 text-slate-950">
                        {article.title}
                      </h3>

                      <p className="mt-3 text-[14px] leading-6 text-slate-600">
                        {article.authors?.join(", ")}
                      </p>

                      {article.pages ? (
                        <p className="mt-2 text-[13px] text-slate-500">
                          Pages: {article.pages}
                        </p>
                      ) : null}

                      {article.abstract ? (
                        <p className="mt-4 line-clamp-3 text-[14px] leading-7 text-slate-600">
                          {article.abstract}
                        </p>
                      ) : null}

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                          href={`/issues/${issue.slug}/articles/${article.slug}`}
                          className="inline-flex h-10 items-center justify-center rounded-full bg-[#111433] px-5 text-[14px] font-semibold text-white hover:bg-[#1e2557]"
                        >
                          View Details
                        </Link>

                        <a
                          href={article.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-[14px] font-semibold text-[#111433] hover:bg-slate-50"
                        >
                          View PDF
                        </a>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        </Container>
      </main>
    </PublicLayout>
  );
}