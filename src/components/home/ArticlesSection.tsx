"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MotionSection from "@/components/common/MotionSection";
import { getHomeArticles } from "@/services/issues.service";
import { Article } from "@/types/issue";
import { PublicHomepageContent } from "@/services/publicHomepageService";

type Props = {
  homepage?: PublicHomepageContent | null;
  initialArticles?: Article[];
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

const contentMotion = {
  initial: {
    opacity: 0,
    y: 14,
    scale: 0.985,
    filter: "blur(3px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.99,
    filter: "blur(3px)",
  },
};

export default function ArticlesSection({ homepage, initialArticles }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("latest");
  const [articles, setArticles] = useState<Article[]>(initialArticles || []);
  const [loading, setLoading] = useState(!initialArticles);

  useEffect(() => {
    if (activeTab === "latest" && initialArticles) {
      setArticles(initialArticles);
      setLoading(false);
      return;
    }

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
  }, [activeTab, initialArticles]);

  return (
    <MotionSection>
      <section className="journal-surface relative overflow-hidden p-5 md:p-8">
        <div className="absolute right-[-110px] top-[-130px] h-72 w-72 rounded-full bg-[#0ea5b7]/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 border-b border-[#e4edf1] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="journal-subheading">
              {homepage?.articlesSectionSubtitle || "Research Publications"}
            </p>

            <h2
              className="mt-3 text-[26px] font-semibold leading-tight text-[#0b1f3a] md:text-[42px]"
              style={{ fontFamily: "var(--font-source-serif)" }}
            >
              {homepage?.articlesSectionTitle || "Articles"}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.value;

              return (
                <motion.button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    if (!isActive) {
                      setActiveTab(tab.value);
                    }
                  }}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className={`cursor-pointer rounded-full px-5 py-2 text-[13px] font-extrabold outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#0ea5b7]/45 focus-visible:ring-offset-2 ${
                    isActive
                      ? "bg-[#0b1f3a] text-white shadow-[0_10px_24px_rgba(11,31,58,0.16)]"
                      : "border border-[#d9e4ea] bg-white/85 text-slate-600 hover:border-[#0ea5b7]/50 hover:bg-[#e6f7f9] hover:text-[#0a7180]"
                  }`}
                >
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key={`loading-${activeTab}`}
              {...contentMotion}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <ArticleCardsSkeleton />
            </motion.div>
          ) : articles.length === 0 ? (
            <motion.div
              key={`empty-${activeTab}`}
              {...contentMotion}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="relative mt-6 rounded-3xl border border-dashed border-[#d9e4ea] bg-white/80 p-8 text-center"
            >
              <p className="text-[14px] text-slate-500">
                No articles found for this tab.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`articles-${activeTab}`}
              {...contentMotion}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
            >
              {articles.map((article, index) => {
                const issue = getIssue(article);

                return (
                  <motion.article
                    key={article._id}
                    initial={{ opacity: 0, y: 16, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: Math.min(index * 0.045, 0.2),
                      ease: "easeOut",
                    }}
                    whileHover={{ y: -5 }}
                    onClick={() => {
                      if (issue) {
                        router.push(`/issues/${issue.slug}/articles/${article.slug}`);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (!issue) {
                        return;
                      }

                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(`/issues/${issue.slug}/articles/${article.slug}`);
                      }
                    }}
                    role={issue ? "link" : undefined}
                    tabIndex={issue ? 0 : undefined}
                    className={`group flex flex-col rounded-3xl border border-[#d9e4ea] bg-white/92 p-5 shadow-[0_14px_40px_rgba(17,20,51,0.05)] backdrop-blur-xl transition-colors duration-300 hover:border-[#0ea5b7]/45 hover:shadow-[0_22px_60px_rgba(11,31,58,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5b7]/45 focus-visible:ring-offset-2 md:min-h-[285px] ${
                      issue ? "cursor-pointer" : "cursor-default"
                    }`}
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

                    <h3 className="mt-5 text-[18px] font-bold leading-7 text-slate-950 transition-colors duration-300 group-hover:text-[#0a7180] md:text-[19px] md:leading-8">
                      {article.title}
                    </h3>

                    <p className="mt-4 text-[13px] leading-6 text-slate-600 md:text-[14px]">
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
                          prefetch={false}
                          className="inline-flex cursor-pointer rounded-full bg-[#0b1f3a] px-4 py-2 text-[13px] font-extrabold text-white transition-all duration-300 hover:bg-[#0ea5b7] hover:shadow-[0_10px_24px_rgba(14,165,183,0.24)]"
                        >
                          View article →
                        </Link>
                      ) : (
                        <span className="text-[14px] font-semibold text-slate-400">
                          Issue link unavailable
                        </span>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </MotionSection>
  );
}

function ArticleCardsSkeleton() {
  return (
    <div className="relative mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-3xl border border-[#d9e4ea] bg-white/92 p-5 shadow-[0_14px_40px_rgba(17,20,51,0.05)]"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="h-3 w-32 rounded-full bg-slate-200" />
            <div className="h-3 w-3 rounded-full bg-slate-200" />
          </div>

          <div className="mt-6 h-5 w-full rounded-full bg-slate-200" />
          <div className="mt-3 h-5 w-4/5 rounded-full bg-slate-200" />

          <div className="mt-6 h-4 w-2/3 rounded-full bg-slate-200" />
          <div className="mt-3 h-4 w-1/2 rounded-full bg-slate-200" />

          <div className="mt-6 flex gap-2">
            <div className="h-7 w-20 rounded-full bg-slate-200" />
            <div className="h-7 w-24 rounded-full bg-slate-200" />
          </div>

          <div className="mt-8 h-9 w-32 rounded-full bg-slate-200" />
        </div>
      ))}
    </div>
  );
}
