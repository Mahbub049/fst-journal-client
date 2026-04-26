"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getRecentIssues } from "@/services/issues.service";
import { Issue } from "@/types/issue";

export default function RecentIssuesSection() {
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
    <section className="rounded-none border border-slate-200 bg-white px-5 py-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-bold uppercase text-slate-900">
          Recent Issues
        </h2>

        <button className="text-[12px] font-semibold text-[#E5334F]">
          View Archive
        </button>
      </div>

      {loading ? (
        <div className="mt-5 text-sm text-slate-500">Loading recent issues...</div>
      ) : issues.length === 0 ? (
        <div className="mt-5 text-sm text-slate-500">No recent issues found.</div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {issues.map((issue) => (
            <Link
              key={issue._id}
              href={issue.pdfUrl || "#"}
              className="block border border-slate-200 bg-white transition hover:shadow-md"
            >
              <div className="relative aspect-[0.72] w-full bg-slate-100">
                <Image
                  src={issue.coverImage}
                  alt={issue.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="px-4 py-4 text-center">
                <p className="text-[12px] text-slate-500">
                  {issue.category} (ISSN: {issue.issn})
                </p>

                <h3 className="mt-3 text-[14px] leading-7 text-slate-800">
                  {issue.title}, ISSN: {issue.issn}, Volume - {issue.volume},
                  Issue - {issue.issueNumber}, {issue.publishDateLabel}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}