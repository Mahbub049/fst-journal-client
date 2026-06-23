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
    homepage || null,
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
    <section className="relative isolate overflow-hidden bg-[#061426] text-white">
      <div className="absolute inset-0 journal-gradient" />
      <div className="absolute inset-0 journal-hero-grid" />
      <div className="absolute inset-0 journal-network-bg opacity-70" />
      <HeroNetworkLines />
      <div className="absolute -left-28 top-6 h-80 w-80 rounded-full bg-[#10d6e9]/18 blur-3xl" />
      <div className="absolute left-[42%] top-[-180px] h-96 w-96 rounded-full bg-[#2f8cff]/10 blur-3xl" />
      <div className="absolute right-[-130px] top-[-110px] h-96 w-96 rounded-full bg-[#f5c84b]/12 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#7de4ee]/55 to-transparent" />

      <Container className="relative pt-10 pb-6 md:pt-14 md:pb-8">
        <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)_250px] lg:items-center">
          <div className="relative mx-auto w-[200px] lg:mx-0">
            <div className="absolute -inset-4 rounded-[2.2rem] bg-[#7de4ee]/15 blur-2xl" />
            <div className="absolute -inset-2 rounded-[1.9rem] border border-[#7de4ee]/16" />
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
            <h1
              className="max-w-5xl text-[38px] font-semibold leading-[1.07] tracking-tight text-white md:text-[56px]"
              style={{ fontFamily: "var(--font-source-serif)" }}
            >
              {heroTitle}
            </h1>

            {heroSubtitle ? (
              <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-8 text-white/78 lg:mx-0 md:text-[16px]">
                {heroSubtitle}
              </p>
            ) : null}

            <div className="mt-7 grid gap-3 sm:grid-cols-3 md:max-w-4xl">
              <InfoCard label="Publishing Model" value={publishingModel} />
              <InfoCard label="Electronic ISSN" value={issnOnline} />
              <InfoCard label="Print ISSN" value={issnPrint} />
            </div>
          </div>

          <div className="rounded-[1.45rem] border border-white/14 bg-white/9 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl">
            <p className="px-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#7de4ee]">
              Journal Metrics
            </p>

            <div className="mt-3 grid gap-3">
              {metrics.map((metric, index) => (
                <div
                  key={`${metric.label}-${metric.value}-${index}`}
                  className="rounded-3xl border border-white/12 bg-white/10 px-5 py-5"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7de4ee]">
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

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="h-full min-h-[92px] rounded-3xl border border-white/12 bg-white/9 p-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7de4ee]">
        {label}
      </p>
      <p className="mt-2 text-[21px] font-extrabold text-white">{value}</p>
    </div>
  );
}

function HeroNetworkLines() {
  const nodes: Array<[number, number, string]> = [
    [92, 154, "#7de4ee"],
    [230, 54, "#7de4ee"],
    [378, 132, "#f5c84b"],
    [520, 48, "#7de4ee"],
    [696, 112, "#7de4ee"],
    [842, 246, "#f5c84b"],
    [992, 158, "#7de4ee"],
    [1160, 246, "#7de4ee"],
    [1332, 126, "#f5c84b"],
    [284, 190, "#7de4ee"],
    [566, 92, "#7de4ee"],
    [898, 86, "#7de4ee"],
    [1084, 178, "#7de4ee"],
  ];

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-55"
      viewBox="0 0 1440 360"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="heroLineCyan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7de4ee" stopOpacity="0" />
          <stop offset="42%" stopColor="#7de4ee" stopOpacity="0.48" />
          <stop offset="100%" stopColor="#f5c84b" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="heroLineGold" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5c84b" stopOpacity="0" />
          <stop offset="48%" stopColor="#f5c84b" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#7de4ee" stopOpacity="0.14" />
        </linearGradient>
      </defs>

      <path
        d="M0 246 C112 182 186 222 286 154 S454 58 596 132 818 280 1010 198 1260 78 1440 114"
        fill="none"
        stroke="url(#heroLineCyan)"
        strokeWidth="1.1"
      />
      <path
        d="M16 80 C150 128 236 26 346 86 S558 252 704 194 926 52 1088 106 1286 268 1440 210"
        fill="none"
        stroke="url(#heroLineGold)"
        strokeWidth="1"
      />
      <path
        d="M166 340 L284 190 L420 232 L566 92 L748 178 L898 86 L1084 178 L1274 72"
        fill="none"
        stroke="#7de4ee"
        strokeOpacity="0.16"
        strokeWidth="1"
      />
      <path
        d="M92 154 L230 54 L378 132 L520 48 L696 112 L842 246 L992 158 L1160 246 L1332 126"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.07"
        strokeWidth="1"
      />

      {nodes.map(([cx, cy, fill]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="2.2"
          fill={fill}
          opacity="0.76"
        />
      ))}
    </svg>
  );
}
