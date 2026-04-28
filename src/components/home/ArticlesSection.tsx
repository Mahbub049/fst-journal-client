"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getHomeArticles } from "@/services/issues.service";
import { Article } from "@/types/issue";
import { PublicHomepageContent } from "@/services/publicHomepageService";

type Props = {
  homepage?: PublicHomepageContent | null;
};

const tabs = [
  { label: "Latest published", value: "latest" },
  { label: "Articles in press", value: "inPress" },
  { label: "Top cited", value: "topCited" },
  { label: "Most downloaded", value: "mostDownloaded" },
  { label: "Most popular", value: "mostPopular" },
];

function getIssue(article: Article) {
  if (!article.issueId || typeof article.issueId === "string") {
    return null;
  }

  return article.issueId;
}

export default function ArticlesSection({ homepage }: Props) {
  const [activeTab, setActiveTab] = useState("latest");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        const data = await getHomeArticles(activeTab);
        setArticles(data);
      } catch (error) {
        console.error("Failed to load homepage articles:", error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [activeTab]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-8">
      <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="journal-subheading">
            {homepage?.articlesSectionSubtitle || "Research Publications"}
          </p>

          <h2
            className="mt-3 text-[30px] font-semibold leading-tight text-slate-950"
            style={{ fontFamily: "var(--font-source-serif)" }}
          >
            {homepage?.articlesSectionTitle || "Articles"}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-full px-5 py-2 text-[14px] font-medium transition ${
                activeTab === tab.value
                  ? "bg-[#111433] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-[14px] text-slate-500">
          Loading articles...
        </div>
      ) : articles.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-[14px] text-slate-500">
            No articles found for this tab.
          </p>
        </div>
      ) : (
        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => {
            const issue = getIssue(article);

            return (
              <article
                key={article._id}
                className="flex min-h-[270px] flex-col rounded-3xl border border-slate-200 bg-[#fbfcfd] p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
              >
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#111433]">
                  {article.articleType || "Research Article"} ·{" "}
                  {article.accessType || "Open Access"}
                </p>

                <h3 className="mt-5 text-[19px] font-semibold leading-8 text-slate-950">
                  {article.title}
                </h3>

                <p className="mt-4 text-[14px] leading-6 text-slate-600">
                  {article.authors?.join(", ") ||
                    "Author information unavailable"}
                </p>

                <p className="mt-2 text-[14px] leading-6 text-slate-500">
                  {article.publishDate ||
                    issue?.publishDateLabel ||
                    "Publish date unavailable"}
                </p>

                {issue ? (
                  <p className="mt-2 text-[13px] leading-6 text-slate-500">
                    {issue.title}, Vol. {issue.volume}, Issue{" "}
                    {issue.issueNumber}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2 text-[12px] font-medium text-slate-500">
                  {typeof article.views === "number" ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      Views: {article.views}
                    </span>
                  ) : null}

                  {typeof article.downloads === "number" ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      Downloads: {article.downloads}
                    </span>
                  ) : null}

                  {typeof article.citations === "number" ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      Citations: {article.citations}
                    </span>
                  ) : null}
                </div>

                <div className="mt-auto pt-5">
                  {issue ? (
                    <Link
                      href={`/issues/${issue.slug}/articles/${article.slug}`}
                      className="text-[14px] font-semibold text-[#111433] hover:text-[#22b8e8]"
                    >
                      View article →
                    </Link>
                  ) : (
                    <span className="text-[14px] font-semibold text-slate-400">
                      Issue link unavailable
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}