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
  const heroSubtitle =
    heroData?.heroSubtitle ||
    "Faculty of Science and Technology, Bangladesh University of Professionals";
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
    <section className="relative overflow-hidden bg-[#07162b] text-white">
      <div className="absolute inset-0 journal-gradient" />
      <div className="absolute inset-0 journal-cover-lines opacity-60" />
      <div className="absolute -left-28 top-8 h-80 w-80 rounded-full bg-[#0ea5b7]/16 blur-3xl" />
      <div className="absolute right-[-130px] top-[-110px] h-96 w-96 rounded-full bg-[#c7a159]/13 blur-3xl" />

      <Container className="relative py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)_250px] lg:items-center">
          <div className="relative mx-auto w-[200px] lg:mx-0">
            <div className="absolute -inset-3 rounded-[2rem] bg-[#0ea5b7]/14 blur-xl" />
            <div className="relative overflow-hidden rounded-[1.55rem] border border-white/16 bg-white/10 p-3 shadow-[0_28px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl">
              <div className="relative aspect-[0.72] overflow-hidden rounded-[1.05rem] bg-[#0b1f3a]">
                <Image
                  src={journalCoverImage}
                  alt="Journal of FST cover"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          <div className="text-center lg:text-left">
            {/* <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/78 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#c7a159]" />
              Bangladesh University of Professionals
            </div> */}

            <h1
              className=" max-w-5xl text-[38px] font-semibold leading-[1.07] tracking-tight text-white md:text-[56px]"
              style={{ fontFamily: "var(--font-source-serif)" }}
            >
              {heroTitle}
            </h1>

            {heroSubtitle ? (
              <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-8 text-white/76 lg:mx-0 md:text-[16px]">
                {heroSubtitle}
              </p>
            ) : null}

            <div className="mt-7 grid gap-3 md:max-w-3xl md:grid-cols-[1fr_1.5fr]">
              <InfoCard label="Publishing Model" value={publishingModel} />

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoCard label="Electronic ISSN" value={issnOnline} accent="teal" />
                <InfoCard label="Print ISSN" value={issnPrint} accent="gold" />
              </div>
            </div>
          </div>

          <div className="rounded-[1.45rem] border border-white/14 bg-white/9 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl">
            <p className="px-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/72">
              Journal Metrics
            </p>

            <div className="mt-3 grid gap-3">
              {metrics.map((metric, index) => (
                <div
                  key={`${metric.label}-${metric.value}-${index}`}
                  className="rounded-3xl border border-white/12 bg-white/10 px-5 py-5"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/58">
                    {metric.label}
                  </p>

                  <p className="mt-2 text-[34px] font-black leading-none text-white">
                    {metric.value}
                  </p>

                  <div className="mt-4 h-[3px] rounded-full bg-[#0ea5b7]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function InfoCard({
  label,
  value,
  accent = "navy",
}: {
  label: string;
  value: string;
  accent?: "navy" | "teal" | "gold";
}) {
  const valueClass =
    accent === "teal"
      ? "text-[#7de4ee]"
      : accent === "gold"
        ? "text-[#e5c77d]"
        : "text-white";

  return (
    <div className="rounded-3xl border border-white/12 bg-white/9 p-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/56">
        {label}
      </p>
      <p className={`mt-2 text-[21px] font-extrabold `}>{value}</p>
    </div>
  );
}
