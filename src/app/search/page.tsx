import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";
import Link from "next/link";
import { Article, Issue, PopulatedIssue } from "@/types/issue";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type SearchPageItem = {
  _id: string;
  title: string;
  slug: string;
  group: "about" | "for-authors" | "issues" | "custom";
  subtitle?: string;
  shortDescription?: string;
};

type EditorialMember = {
  _id: string;
  category: string;
  editorialArea: string;
  name: string;
  designation?: string;
  institution?: string;
  department?: string;
  expertise?: string[];
  profileImage?: string;
  bio?: string;
  email?: string;
};

type CallForPaperItem = {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  publisherInfo?: string;
};

type SearchData = {
  articles: Article[];
  issues: Issue[];
  pages: SearchPageItem[];
  editorialMembers: EditorialMember[];
  callForPapers: CallForPaperItem[];
};

async function getSearchResults(query: string): Promise<SearchData> {
  const emptyData: SearchData = {
    articles: [],
    issues: [],
    pages: [],
    editorialMembers: [],
    callForPapers: [],
  };

  if (!query.trim()) {
    return emptyData;
  }

  try {
    const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return emptyData;
    }

    const json = await res.json();

    return {
      articles: json.data?.articles || [],
      issues: json.data?.issues || [],
      pages: json.data?.pages || [],
      editorialMembers: json.data?.editorialMembers || [],
      callForPapers: json.data?.callForPapers || [],
    };
  } catch (error) {
    console.error("Search fetch error:", error);
    return emptyData;
  }
}

function getPageHref(page: SearchPageItem) {
  if (page.group === "about") return `/about/${page.slug}`;
  if (page.group === "for-authors") return `/for-authors/${page.slug}`;
  if (page.group === "issues") return `/issues/${page.slug}`;
  return `/${page.slug}`;
}

function getArticleHref(article: Article) {
  const issue = article.issueId as PopulatedIssue;

  if (issue?.slug) {
    return `/issues/${issue.slug}/articles/${article.slug}`;
  }

  return "#";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";

  const results = await getSearchResults(query);

  const totalResults =
    results.articles.length +
    results.issues.length +
    results.pages.length +
    results.editorialMembers.length +
    results.callForPapers.length;

  return (
    <PublicLayout>
      <main className="bg-[#f7f8fb]">
        <Container className="py-10 md:py-12">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <p className="journal-subheading">Search Journal</p>

            <h1
              className="mt-3 text-[30px] font-bold text-[#111433] md:text-[42px]"
              style={{ fontFamily: "var(--font-source-serif)" }}
            >
              Search Results
            </h1>

            {query ? (
              <p className="mt-3 text-[15px] text-slate-600">
                Showing results for{" "}
                <span className="font-semibold text-[#111433]">“{query}”</span>
              </p>
            ) : (
              <p className="mt-3 text-[15px] text-slate-600">
                Please type something in the search box.
              </p>
            )}

            {query && (
              <p className="mt-2 text-[14px] text-slate-500">
                Total results found: {totalResults}
              </p>
            )}
          </section>

          {query && totalResults === 0 && (
            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h2 className="text-[22px] font-bold text-[#111433]">
                No result found
              </h2>
              <p className="mt-2 text-[15px] text-slate-600">
                Try searching with article title, author name, issue title,
                editorial member name, designation, page title, or call for
                papers content.
              </p>
            </section>
          )}

          {results.articles.length > 0 && (
            <section className="mt-8">
              <h2 className="text-[24px] font-bold text-[#111433]">
                Articles
              </h2>

              <div className="mt-4 grid gap-4">
                {results.articles.map((article) => {
                  const issue = article.issueId as PopulatedIssue;

                  return (
                    <Link
                      key={article._id}
                      href={getArticleHref(article)}
                      className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#22b8e8] hover:shadow-md"
                    >
                      <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-[#22b8e8]">
                        Article
                      </p>

                      <h3
                        className="mt-2 text-[22px] font-bold text-[#111433]"
                        style={{ fontFamily: "var(--font-source-serif)" }}
                      >
                        {article.title}
                      </h3>

                      <p className="mt-3 text-[14px] leading-6 text-slate-600">
                        {article.authors?.join(", ") || "Author not available"}
                      </p>

                      {issue?.title && (
                        <p className="mt-2 text-[13px] text-slate-500">
                          {issue.title}, Volume {issue.volume}, Issue{" "}
                          {issue.issueNumber}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {results.issues.length > 0 && (
            <section className="mt-10">
              <h2 className="text-[24px] font-bold text-[#111433]">Issues</h2>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {results.issues.map((issue) => (
                  <Link
                    key={issue._id}
                    href={`/issues/${issue.slug}`}
                    className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#22b8e8] hover:shadow-md"
                  >
                    <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-[#22b8e8]">
                      Issue
                    </p>

                    <h3
                      className="mt-2 text-[22px] font-bold text-[#111433]"
                      style={{ fontFamily: "var(--font-source-serif)" }}
                    >
                      {issue.title}
                    </h3>

                    <p className="mt-3 text-[14px] text-slate-600">
                      Volume {issue.volume}, Issue {issue.issueNumber}
                    </p>

                    <p className="mt-1 text-[13px] text-slate-500">
                      {issue.publishDateLabel}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.editorialMembers.length > 0 && (
            <section className="mt-10">
              <h2 className="text-[24px] font-bold text-[#111433]">
                Editorial Board Members
              </h2>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {results.editorialMembers.map((member) => (
                  <Link
                    key={member._id}
                    href={`/editorial-board#member-${member._id}`}
                    className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#22b8e8] hover:shadow-md"
                  >
                    <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-[#22b8e8]">
                      {member.category || "Editorial Board"}
                    </p>

                    <h3
                      className="mt-2 text-[22px] font-bold text-[#111433]"
                      style={{ fontFamily: "var(--font-source-serif)" }}
                    >
                      {member.name}
                    </h3>

                    {member.designation && (
                      <p className="mt-3 text-[14px] font-medium text-slate-700">
                        {member.designation}
                      </p>
                    )}

                    {member.institution && (
                      <p className="mt-1 text-[14px] text-slate-600">
                        {member.institution}
                      </p>
                    )}

                    {member.department && (
                      <p className="mt-1 text-[13px] text-slate-500">
                        {member.department}
                      </p>
                    )}

                    {member.expertise && member.expertise.length > 0 && (
                      <p className="mt-3 line-clamp-2 text-[13px] text-slate-500">
                        Expertise: {member.expertise.join(", ")}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.pages.length > 0 && (
            <section className="mt-10">
              <h2 className="text-[24px] font-bold text-[#111433]">Pages</h2>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {results.pages.map((page) => (
                  <Link
                    key={page._id}
                    href={getPageHref(page)}
                    className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#22b8e8] hover:shadow-md"
                  >
                    <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-[#22b8e8]">
                      {page.group.replace("-", " ")}
                    </p>

                    <h3
                      className="mt-2 text-[22px] font-bold text-[#111433]"
                      style={{ fontFamily: "var(--font-source-serif)" }}
                    >
                      {page.title}
                    </h3>

                    {page.shortDescription && (
                      <p className="mt-3 line-clamp-2 text-[14px] leading-6 text-slate-600">
                        {page.shortDescription}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.callForPapers.length > 0 && (
            <section className="mt-10">
              <h2 className="text-[24px] font-bold text-[#111433]">
                Call for Papers
              </h2>

              <div className="mt-4 grid gap-4">
                {results.callForPapers.map((item) => (
                  <Link
                    key={item._id}
                    href="/call-for-papers"
                    className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#22b8e8] hover:shadow-md"
                  >
                    <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-[#22b8e8]">
                      Call for Papers
                    </p>

                    <h3
                      className="mt-2 text-[22px] font-bold text-[#111433]"
                      style={{ fontFamily: "var(--font-source-serif)" }}
                    >
                      {item.title}
                    </h3>

                    {item.subtitle && (
                      <p className="mt-3 text-[14px] font-medium text-slate-700">
                        {item.subtitle}
                      </p>
                    )}

                    {item.description && (
                      <p className="mt-2 line-clamp-3 text-[14px] leading-6 text-slate-600">
                        {item.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </Container>
      </main>
    </PublicLayout>
  );
}