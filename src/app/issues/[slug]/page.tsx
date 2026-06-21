import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBrowserApiBaseUrl, getServerApiBaseUrl } from "@/lib/apiBase";

const API_URL = getServerApiBaseUrl();
const BROWSER_API_URL = getBrowserApiBaseUrl();

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

type PopulatedIssue = {
  _id: string;
  title: string;
  slug: string;
  volume?: string;
  issueNumber?: string;
  publishDateLabel?: string;
  issn?: string;
  category?: string;
};

type Article = {
  _id: string;
  issueId?: string | PopulatedIssue;
  title: string;
  slug: string;
  authors?: string[];
  abstract?: string;
  keywords?: string[];
  pages?: string;
  pdfUrl?: string;
  articleId?: string;
  articleUrl?: string;
  doi?: string;
  publishDate?: string;
  views?: number;
  downloads?: number;
  citations?: number;
  status?: "published" | "inPress";
  articleType?: string;
  accessType?: string;
};

type IssueDetails = {
  issue: Issue;
  articles: Article[];
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

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    return json?.data ?? null;
  } catch (error) {
    console.error("Public issue fetch error:", error);
    return null;
  }
}

async function getCurrentIssueDetails(): Promise<IssueDetails | null> {
  return fetchJson<IssueDetails>(`${API_URL}/issues/current`);
}

async function getPublicIssues(): Promise<Issue[]> {
  const data = await fetchJson<Issue[]>(`${API_URL}/issues/public/all`);
  return Array.isArray(data) ? data : [];
}

async function getIssueDetails(slug: string): Promise<IssueDetails | null> {
  return fetchJson<IssueDetails>(`${API_URL}/issues/${slug}`);
}

function getArticleDownloadUrl(issueSlug: string, articleSlug: string) {
  return `${BROWSER_API_URL}/issues/${issueSlug}/articles/${articleSlug}/download`;
}

async function getPublicArticles(tab: string): Promise<Article[]> {
  const data = await fetchJson<Article[]>(
    `${API_URL}/issues/articles/home?tab=${tab}&limit=20`
  );

  return Array.isArray(data) ? data : [];
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <h3 className="text-lg font-semibold text-slate-800">No content found</h3>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </div>
  );
}

function IssueCard({ issue }: { issue: Issue }) {
  return (
    <Link
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
          Volume {issue.volume || "-"}, Issue {issue.issueNumber || "-"}
          {issue.publishDateLabel ? `, ${issue.publishDateLabel}` : ""}
        </p>

        <span className="mt-5 inline-flex text-[14px] font-medium text-[#111433] hover:text-slate-950">
          View issue →
        </span>
      </div>
    </Link>
  );
}

function IssueListPage({
  title,
  subtitle,
  issues,
  emptyMessage,
}: {
  title: string;
  subtitle: string;
  issues: Issue[];
  emptyMessage: string;
}) {
  return (
    <PublicLayout>
      <main className="bg-[#f7f8fb]">
        <Container className="py-8 md:py-10">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
            <div className="mb-8">
              <p className="journal-subheading">Published Issues</p>

              <h2
                className="mt-3 text-[24px] font-semibold leading-tight text-slate-950 md:text-[30px]"
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                {title}
              </h2>

              <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600">
                {subtitle}
              </p>
            </div>

            {issues.length === 0 ? (
              <EmptyState message={emptyMessage} />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {issues.map((issue) => (
                  <IssueCard key={issue._id} issue={issue} />
                ))}
              </div>
            )}
          </section>
        </Container>
      </main>
    </PublicLayout>
  );
}

function getArticleIssue(article: Article): PopulatedIssue | null {
  if (article.issueId && typeof article.issueId === "object") {
    return article.issueId;
  }

  return null;
}

function ArticleListPage({
  title,
  subtitle,
  articles,
  emptyMessage,
}: {
  title: string;
  subtitle: string;
  articles: Article[];
  emptyMessage: string;
}) {
  return (
    <PublicLayout>
      <main className="bg-[#f7f8fb]">
        <Container className="py-8 md:py-10">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
            <div className="mb-8">
              <p className="journal-subheading">Published Articles</p>

              <h2
                className="mt-3 text-[24px] font-semibold leading-tight text-slate-950 md:text-[30px]"
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                {title}
              </h2>

              <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600">
                {subtitle}
              </p>
            </div>

            {articles.length === 0 ? (
              <EmptyState message={emptyMessage} />
            ) : (
              <div className="space-y-5">
                {articles.map((article, index) => {
                  const issue = getArticleIssue(article);
                  const detailsHref = issue?.slug
                    ? `/issues/${issue.slug}/articles/${article.slug}`
                    : "#";

                  return (
                    <article
                      key={article._id}
                      className="rounded-3xl border border-slate-200 bg-[#fbfcfd] p-5 transition hover:border-[#111433]/30 hover:bg-white hover:shadow-md md:p-6"
                    >
                      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Article {index + 1}
                        {article.articleType ? ` · ${article.articleType}` : ""}
                      </p>

                      <h3 className="mt-3 text-[18px] font-semibold leading-7 text-slate-950 md:text-[22px] md:leading-8">
                        {article.title}
                      </h3>

                      {article.authors?.length ? (
                        <p className="mt-3 text-[14px] leading-6 text-slate-600">
                          {article.authors.join(", ")}
                        </p>
                      ) : null}

                      <div className="mt-3 flex flex-wrap gap-2 text-[12px] font-semibold text-slate-600">
                        {issue ? (
                          <span className="rounded-full bg-white px-3 py-1">
                            Vol. {issue.volume || "-"}, Issue {issue.issueNumber || "-"}
                          </span>
                        ) : null}
                        {article.citations !== undefined ? (
                          <span className="rounded-full bg-white px-3 py-1">
                            Citations: {article.citations}
                          </span>
                        ) : null}
                        {article.views !== undefined ? (
                          <span className="rounded-full bg-white px-3 py-1">
                            Views: {article.views}
                          </span>
                        ) : null}
                        {article.downloads !== undefined ? (
                          <span className="rounded-full bg-white px-3 py-1">
                            Downloads: {article.downloads}
                          </span>
                        ) : null}
                      </div>

                      {article.abstract ? (
                        <p className="mt-4 line-clamp-3 text-[14px] leading-7 text-slate-600">
                          {article.abstract}
                        </p>
                      ) : null}

                      <div className="mt-5 flex flex-wrap gap-3">
                        {issue ? (
                          <Link
                            href={detailsHref}
                            prefetch={false}
                            className="inline-flex h-10 items-center justify-center rounded-full bg-[#111433] px-5 text-[14px] font-semibold text-white hover:bg-[#1e2557]"
                          >
                            View Details
                          </Link>
                        ) : null}

                        {/* {article.pdfUrl && issue ? (
                          <a
                            href={getArticleDownloadUrl(issue.slug, article.slug)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-[14px] font-semibold text-[#111433] hover:bg-slate-50"
                          >
                            View PDF
                          </a>
                        ) : null} */}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </Container>
      </main>
    </PublicLayout>
  );
}

function IssueDetailsPage({
  details,
  pageLabel = "Published Issue",
}: {
  details: IssueDetails;
  pageLabel?: string;
}) {
  const { issue, articles } = details;

  return (
    <PublicLayout>
      <main className="bg-[#f7f8fb]">
        <Container className="py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-[106px]">
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
                  Volume {issue.volume || "-"}, Issue {issue.issueNumber || "-"}
                </h2>

                {issue.publishDateLabel ? (
                  <p className="mt-2 text-[14px] leading-6 text-slate-600">
                    Published: {issue.publishDateLabel}
                  </p>
                ) : null}

                {issue.issn ? (
                  <p className="mt-1 text-[14px] leading-6 text-slate-600">
                    ISSN: {issue.issn}
                  </p>
                ) : null}

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

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
              {/* <div className="border-b border-slate-200 pb-6">
                <p className="journal-subheading">{pageLabel}</p>

                <h1
                  className="mt-3 text-[32px] font-semibold leading-tight text-slate-950 md:text-[42px]"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  {issue.title}
                </h1>

                <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600">
                  Volume {issue.volume || "-"}, Issue {issue.issueNumber || "-"}
                  {issue.publishDateLabel ? `, ${issue.publishDateLabel}` : ""}
                </p>
              </div> */}

              <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="journal-subheading">Table of Contents</p>

                  <h2
                    className="mt-3 text-[24px] font-semibold leading-tight text-slate-950 md:text-[30px]"
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
                  articles.map((article, index) => (
                    <article
                      key={article._id}
                      className="rounded-3xl border border-slate-200 bg-[#fbfcfd] p-5 transition hover:border-[#111433]/30 hover:bg-white hover:shadow-md md:p-6"
                    >
                      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Article {index + 1}
                      </p>

                      <h3 className="mt-3 text-[18px] font-semibold leading-7 text-slate-950 md:text-[22px] md:leading-8">
                        {article.title}
                      </h3>

                      {article.authors?.length ? (
                        <p className="mt-3 text-[14px] leading-6 text-slate-600">
                          {article.authors.join(", ")}
                        </p>
                      ) : null}

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
                          prefetch={false}
                          className="inline-flex h-10 items-center justify-center rounded-full bg-[#111433] px-5 text-[14px] font-semibold text-white hover:bg-[#1e2557]"
                        >
                          View Details
                        </Link>

                        {/* {article.pdfUrl ? (
                          <a
                            href={getArticleDownloadUrl(issue.slug, article.slug)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-[14px] font-semibold text-[#111433] hover:bg-slate-50"
                          >
                            View PDF
                          </a>
                        ) : null} */}
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

export default async function IssuesInnerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug === "current") {
    const details = await getCurrentIssueDetails();

    if (!details) {
      return (
        <IssueListPage
          title={issuePages.current.title}
          subtitle={issuePages.current.subtitle}
          issues={[]}
          emptyMessage="Mark one published issue as recent from the admin panel to show it as the current issue."
        />
      );
    }

    return <IssueDetailsPage details={details} pageLabel="Current Issue" />;
  }

  if (slug === "archive") {
    const issues = await getPublicIssues();

    return (
      <IssueListPage
        title={issuePages.archive.title}
        subtitle={issuePages.archive.subtitle}
        issues={issues}
        emptyMessage="Add published issues from the admin panel to show them in the archive."
      />
    );
  }

  if (slug === "special") {
    const issues = (await getPublicIssues()).filter((issue) =>
      String(issue.category || "").toLowerCase().includes("special")
    );

    return (
      <IssueListPage
        title={issuePages.special.title}
        subtitle={issuePages.special.subtitle}
        issues={issues}
        emptyMessage="Create a published issue with category containing Special to show it here."
      />
    );
  }

  if (slug === "most-cited") {
    const articles = await getPublicArticles("topCited");

    return (
      <ArticleListPage
        title={issuePages["most-cited"].title}
        subtitle={issuePages["most-cited"].subtitle}
        articles={articles}
        emptyMessage="Add published articles with citation values from the admin panel."
      />
    );
  }

  if (slug === "most-read") {
    const articles = await getPublicArticles("mostPopular");

    return (
      <ArticleListPage
        title={issuePages["most-read"].title}
        subtitle={issuePages["most-read"].subtitle}
        articles={articles}
        emptyMessage="Add published articles with view values from the admin panel."
      />
    );
  }

  const details = await getIssueDetails(slug);

  if (!details) {
    notFound();
  }

  return <IssueDetailsPage details={details} />;
}
