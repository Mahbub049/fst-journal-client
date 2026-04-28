"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Container from "@/components/common/Container";
import {
  getPublicHomepage,
  PublicHomepageContent,
} from "@/services/publicHomepageService";

type Props = {
  homepage?: PublicHomepageContent | null;
};

const fallbackMetrics = [
  {
    label: "Cite Score",
    value: "0.0",
    description: "Citation performance indicator",
    order: 1,
    isActive: true,
  },
  {
    label: "Impact Factor",
    value: "0.0",
    description: "Journal impact indicator",
    order: 2,
    isActive: true,
  },
];

export default function JournalHero({ homepage }: Props) {
  const [heroData, setHeroData] = useState<PublicHomepageContent | null>(
    homepage || null
  );

  useEffect(() => {
    if (homepage) {
      setHeroData(homepage);
      return;
    }

    const loadHomepageData = async () => {
      try {
        const data = await getPublicHomepage();
        setHeroData(data);
      } catch {
        setHeroData(null);
      }
    };

    loadHomepageData();
  }, [homepage]);

  const heroTitle = heroData?.heroTitle || "Journal of FST";
  const heroSubtitle = heroData?.heroSubtitle || "";
  const journalCoverImage = heroData?.journalCoverImage || "/images/cover.jpg";
  const publishingModel = heroData?.publishingModel || "Hybrid";
  const issnOnline = heroData?.issnOnline || "2959-4812";
  const issnPrint = heroData?.issnPrint || "3134-7339";

  const metrics =
    heroData?.metrics?.filter((metric) => metric.isActive).length
      ? heroData.metrics
          .filter((metric) => metric.isActive)
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .slice(0, 2)
      : fallbackMetrics;

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-[#f5f7fb]">
      <div className="absolute inset-x-0 top-0 h-[190px] journal-gradient" />

      <Container className="relative py-8 md:py-10">
        <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-white shadow-[0_22px_70px_rgba(17,20,51,0.14)]">
          <div className="h-2 bg-gradient-to-r from-[#22b8e8] via-[#1e2557] to-[#f5c84b]" />

          <div className="grid gap-6 p-6 md:p-7 lg:grid-cols-[130px_minmax(0,1fr)_250px] lg:items-center lg:p-8">
            <div className="flex justify-center lg:justify-start">
              <div className="relative h-[170px] w-[120px] overflow-hidden rounded-xl border border-slate-200 bg-[#111433] shadow-xl">
                <Image
                  src={journalCoverImage}
                  alt="Journal of FST cover"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            <div className="text-center lg:text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#1e2557]">
                Bangladesh University of Professionals
              </p>

              <h1
                className="mt-3 max-w-4xl text-[34px] font-semibold leading-[1.08] tracking-tight text-[#111433] md:text-[46px]"
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                {heroTitle}
              </h1>

              {heroSubtitle ? (
                <p className="mt-4 max-w-3xl text-[14px] leading-7 text-slate-600 md:text-[15px]">
                  {heroSubtitle}
                </p>
              ) : null}

              <div className="mt-6 grid gap-3 md:max-w-2xl md:grid-cols-[1fr_1.4fr]">
                <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Publishing Model
                  </p>
                  <p className="mt-2 text-[18px] font-semibold text-[#111433]">
                    {publishingModel}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Electronic ISSN
                    </p>
                    <p className="mt-2 text-[18px] font-semibold text-[#111433]">
                      {issnOnline}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Print ISSN
                    </p>
                    <p className="mt-2 text-[18px] font-semibold text-[#111433]">
                      {issnPrint}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1e2557]">
                Journal Metrics
              </p>

              <div className="mt-3 grid gap-3">
                {metrics.map((metric, index) => (
                  <div
                    key={`${metric.label}-${metric.value}-${index}`}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {metric.label}
                    </p>

                    <p className="mt-2 text-[30px] font-semibold leading-none text-[#111433]">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}