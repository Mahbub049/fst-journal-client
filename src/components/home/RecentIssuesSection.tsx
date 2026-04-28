"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getRecentIssues } from "@/services/issues.service";
import { Issue } from "@/types/issue";
import { PublicHomepageContent } from "@/services/publicHomepageService";

type Props = {
  homepage?: PublicHomepageContent | null;
};

const DEFAULT_COVER = "/images/cover.jpg";

export default function RecentIssuesSection({ homepage }: Props) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIssues = async () => {
      try {
        const data = await getRecentIssues();
        setIssues(data);
      } catch (error) {
        console.error("Failed to load recent issues:", error);
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, []);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="journal-subheading">
            {homepage?.recentIssuesSubtitle || "Published Volumes"}
          </p>

          <h2 className="journal-heading mt-3">
            {homepage?.recentIssuesTitle || "Recent Issues"}
          </h2>
        </div>

        <Link
          href="/issues/archive"
          className="inline-flex h-11 w-fit items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-[14px] font-medium text-slate-700 hover:border-[#1e2557]/30 hover:text-[#1e2557]"
        >
          View Archive
        </Link>
      </div>

      {loading ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-[14px] text-slate-500">
          Loading recent issues...
        </div>
      ) : issues.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-[14px] text-slate-500">
          No recent issues found.
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {issues.map((issue) => (
            <Link
              key={issue._id}
              href={`/issues/${issue.slug}`}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-[#fbfcfd] transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
            >
              <div className="relative aspect-[0.72] w-full overflow-hidden bg-slate-100">
                <Image
                  src={issue.coverImage || DEFAULT_COVER}
                  alt={issue.title || "Journal of FST"}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  priority={false}
                />
              </div>

              <div className="p-5">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#1e2557]">
                  Science & Technology · ISSN {issue.issn || "2959-4812"}
                </p>

                <h3 className="mt-3 text-[17px] font-semibold leading-7 text-slate-950">
                  {issue.title || "Journal of FST"}
                </h3>

                <p className="mt-2 text-[14px] leading-6 text-slate-600">
                  Volume {issue.volume}, Issue {issue.issueNumber},{" "}
                  {issue.publishDateLabel}
                </p>

                <span className="mt-5 inline-flex text-[14px] font-medium text-[#1e2557]">
                  View issue →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}