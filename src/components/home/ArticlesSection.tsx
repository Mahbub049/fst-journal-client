"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MotionSection from "@/components/common/MotionSection";
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
    <MotionSection>
      <section className="journal-surface relative overflow-hidden p-7 md:p-8">
        <div className="absolute right-[-110px] top-[-130px] h-72 w-72 rounded-full bg-[#0ea5b7]/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 border-b border-[#e4edf1] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="journal-subheading">
              {homepage?.articlesSectionSubtitle || "Research Publications"}
            </p>

            <h2
              className="mt-3 text-[34px] font-semibold leading-tight text-[#0b1f3a] md:text-[42px]"
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
                className={`rounded-full px-5 py-2 text-[13px] font-extrabold transition ${
                  activeTab === tab.value
                    ? "bg-[#0b1f3a] text-white shadow-[0_10px_24px_rgba(11,31,58,0.16)]"
                    : "border border-[#d9e4ea] bg-white/85 text-slate-600 hover:border-[#0ea5b7]/50 hover:bg-[#e6f7f9] hover:text-[#0a7180]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="relative mt-6 rounded-3xl border border-[#d9e4ea] bg-[#f1fafb] p-6 text-[14px] font-medium text-slate-600">
            Loading articles...
          </div>
        ) : articles.length === 0 ? (
          <div className="relative mt-6 rounded-3xl border border-dashed border-[#d9e4ea] bg-white/80 p-8 text-center">
            <p className="text-[14px] text-slate-500">
              No articles found for this tab.
            </p>
          </div>
        ) : (
          <div className="relative mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article, index) => {
              const issue = getIssue(article);

              return (
                <article
                  key={article._id}
                  className="group flex min-h-[285px] flex-col rounded-3xl border border-[#d9e4ea] bg-white/92 p-5 shadow-[0_14px_40px_rgba(17,20,51,0.05)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#0ea5b7]/45 hover:shadow-[0_22px_60px_rgba(11,31,58,0.1)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0a7180]">
                      {article.articleType || "Research Article"}
                    </p>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        index % 2 === 0 ? "bg-[#0ea5b7]" : "bg-[#c7a159]"
                      }`}
                    />
                  </div>

                  <h3 className="mt-5 text-[19px] font-bold leading-8 text-slate-950 group-hover:text-[#0a7180]">
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
                      {issue.title}, Vol. {issue.volume}, Issue {issue.issueNumber}
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2 text-[12px] font-bold text-slate-600">
                    {typeof article.views === "number" ? (
                      <span className="rounded-full bg-[#e6f7f9] px-3 py-1 text-[#0a7180]">
                        Views: {article.views}
                      </span>
                    ) : null}

                    {typeof article.downloads === "number" ? (
                      <span className="rounded-full bg-[#f8f0dd] px-3 py-1 text-[#8a6b28]">
                        Downloads: {article.downloads}
                      </span>
                    ) : null}

                    {typeof article.citations === "number" ? (
                      <span className="rounded-full bg-[#eef3f6] px-3 py-1 text-slate-600">
                        Citations: {article.citations}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-auto pt-5">
                    {issue ? (
                      <Link
                        href={`/issues/${issue.slug}/articles/${article.slug}`}
                        className="inline-flex rounded-full bg-[#0b1f3a] px-4 py-2 text-[13px] font-extrabold text-white hover:bg-[#0ea5b7]"
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
    </MotionSection>
  );
}
