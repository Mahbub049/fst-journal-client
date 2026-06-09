"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import MotionSection from "@/components/common/MotionSection";
import { getRecentIssues } from "@/services/issues.service";
import { Issue } from "@/types/issue";
import { PublicHomepageContent } from "@/services/publicHomepageService";

type Props = {
  homepage?: PublicHomepageContent | null;
};

const DEFAULT_COVER = "/images/cover.jpg";
const HOME_ISSUE_LIMIT = 3;

export default function RecentIssuesSection({ homepage }: Props) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIssues = async () => {
      try {
        const data = await getRecentIssues();
        setIssues(Array.isArray(data) ? data.slice(0, HOME_ISSUE_LIMIT) : []);
      } catch (error) {
        console.error("Failed to load recent issues:", error);
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, []);

  return (
    <MotionSection delay={0.08}>
      <section className="journal-surface relative overflow-hidden p-7 md:p-8">
        <div className="absolute left-[-120px] top-[-140px] h-80 w-80 rounded-full bg-[#c7a159]/10 blur-3xl" />
        <div className="absolute right-[-120px] bottom-[-140px] h-80 w-80 rounded-full bg-[#0ea5b7]/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="journal-subheading">
              {homepage?.recentIssuesSubtitle || "Published Volumes"}
            </p>

            <h2
              className="mt-3 text-[34px] font-semibold text-[#0b1f3a] md:text-[42px]"
              style={{ fontFamily: "var(--font-source-serif)" }}
            >
              {homepage?.recentIssuesTitle || "Recent Issues"}
            </h2>
          </div>

          <Link
            href="/issues/archive"
            className="inline-flex h-11 w-fit items-center justify-center rounded-full bg-[#0b1f3a] px-5 text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(11,31,58,0.16)] hover:bg-[#0ea5b7]"
          >
            View All Issues
          </Link>
        </div>

        {loading ? (
          <div className="relative mt-8 rounded-3xl border border-[#d9e4ea] bg-[#f1fafb] p-6 text-[14px] font-medium text-slate-600">
            Loading recent issues...
          </div>
        ) : issues.length === 0 ? (
          <div className="relative mt-8 rounded-3xl border border-[#d9e4ea] bg-white/80 p-6 text-[14px] text-slate-500">
            No recent issues found.
          </div>
        ) : (
          <div className="relative mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {issues.map((issue, index) => (
              <Link
                key={issue._id}
                href={`/issues/${issue.slug}`}
                className="group overflow-hidden rounded-[1.7rem] border border-[#d9e4ea] bg-white/94 shadow-[0_18px_50px_rgba(17,20,51,0.06)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#0ea5b7]/45 hover:shadow-[0_22px_60px_rgba(11,31,58,0.1)]"
              >
                <div className="relative aspect-[0.72] w-full overflow-hidden bg-slate-100">
                  <Image
                    src={issue.coverImage || DEFAULT_COVER}
                    alt={issue.title || "Journal of FST"}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.05]"
                    priority={false}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#07162b]/80 to-transparent" />
                  <span
                    className={`absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#0b1f3a] ${
                      index % 2 === 0 ? "bg-[#0ea5b7] text-white" : "bg-[#c7a159]"
                    }`}
                  >
                    Issue
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0a7180]">
                    Science & Technology · ISSN {issue.issn || "2959-4812"}
                  </p>

                  <h3 className="mt-3 text-[18px] font-bold leading-7 text-slate-950 group-hover:text-[#0a7180]">
                    {issue.title || "Journal of FST"}
                  </h3>

                  <p className="mt-2 text-[14px] leading-6 text-slate-600">
                    Volume {issue.volume}, Issue {issue.issueNumber},{" "}
                    {issue.publishDateLabel}
                  </p>

                  <span className="mt-5 inline-flex rounded-full bg-[#0b1f3a] px-4 py-2 text-[13px] font-extrabold text-white group-hover:bg-[#0ea5b7]">
                    View issue →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </MotionSection>
  );
}
