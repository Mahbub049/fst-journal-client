"use client";

import { CSSProperties, useEffect, useState } from "react";
import Image from "next/image";
import Container from "@/components/common/Container";
import {
  getPublicHomepage,
  PublicHomepageContent,
} from "@/services/publicHomepageService";
import { getRecentIssues } from "@/services/issues.service";

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

const orbitDots = Array.from({ length: 9 }, (_, index) => ({
  id: index,
  angle: `${index * 40}deg`,
  delay: `${index * -0.6}s`,
}));

type Props = {
  homepage?: PublicHomepageContent | null;
};

export default function JournalHero({ homepage }: Props) {
  const [heroData, setHeroData] = useState<PublicHomepageContent | null>(
    homepage || null,
  );
  const [latestIssueCover, setLatestIssueCover] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadHeroData = async () => {
      const [homepageResult, issuesResult] = await Promise.allSettled([
        homepage ? Promise.resolve(homepage) : getPublicHomepage(),
        getRecentIssues(),
      ]);

      if (!mounted) return;

      if (homepageResult.status === "fulfilled") {
        setHeroData(homepageResult.value || null);
      } else if (!homepage) {
        setHeroData(null);
      }

      if (issuesResult.status === "fulfilled") {
        const cover =
          issuesResult.value.find((issue) => issue.isRecent && issue.coverImage)
            ?.coverImage ||
          issuesResult.value.find((issue) => issue.coverImage)?.coverImage ||
          "";
        setLatestIssueCover(cover);
      }
    };

    void loadHeroData();

    return () => {
      mounted = false;
    };
  }, [homepage]);

  const heroTitle = heroData?.heroTitle || "Journal of FST";
  const heroSubtitle =
    heroData?.heroSubtitle || "Bangladesh University of Professionals (BUP)";
  const journalCoverImage =
    latestIssueCover || heroData?.journalCoverImage || "/images/cover.jpg";
  const publishingModel = heroData?.publishingModel || "Hybrid";
  const issnOnline = heroData?.issnOnline || "3134-7339";
  const issnPrint = heroData?.issnPrint || "2959-4812";

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

      <Container className="relative pt-7 pb-5 md:pt-9 md:pb-6">
        <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)_250px] lg:items-end">
          <div className="relative mx-auto w-[200px] lg:mx-0">
            <div className="absolute -inset-4 rounded-[2.2rem] bg-[#7de4ee]/15 blur-2xl" />
            <div className="absolute -inset-2 rounded-[1.9rem] border border-[#7de4ee]/16" />
            <div className="relative overflow-hidden rounded-[1.55rem] border border-white/16 bg-white/10 p-3 shadow-[0_28px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl">
              <div className="relative aspect-[0.72] overflow-hidden rounded-[1.05rem] bg-[#0b1f3a]">
                <Image
                  src={journalCoverImage}
                  alt="Latest Journal of FST issue cover"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          <div className="text-center">
            <JournalOrbitLogo />

            <h1
              className="mx-auto mt-2 max-w-5xl text-[38px] font-semibold leading-[1.05] tracking-tight text-white md:text-[56px]"
              style={{ fontFamily: "var(--font-source-serif)" }}
            >
              {heroTitle}
            </h1>

            {heroSubtitle ? (
              <p className="mx-auto mt-2 max-w-3xl text-[15px] leading-7 text-white/78 md:text-[16px]">
                {heroSubtitle}
              </p>
            ) : null}

            <div className="mt-4 grid gap-3 sm:grid-cols-3 md:max-w-4xl">
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

function JournalOrbitLogo() {
  return (
    <div className="relative mx-auto mb-1 flex h-32 w-32 items-center justify-center sm:h-36 sm:w-36">
      <div className="absolute inset-0 rounded-full border border-[#6dd6ec]/25" />
      <div className="absolute inset-[11px] rounded-full border border-white/[0.08] animate-[reverseSpin_13s_linear_infinite]" />

      {orbitDots.map((dot) => (
        <span
          key={dot.id}
          className="absolute left-1/2 top-1/2 h-[5px] w-[5px] rounded-full bg-[#7ee0f3] shadow-[0_0_10px_rgba(126,224,243,.85)] animate-[orbitDot_8s_linear_infinite]"
          style={
            {
              "--angle": dot.angle,
              animationDelay: dot.delay,
            } as CSSProperties
          }
        />
      ))}

      <div className="relative h-32 w-32 overflow-hidden rounded-full border border-white/10 bg-white shadow-[0_22px_68px_rgba(0,0,0,0.26)] animate-[logoFloat_5s_ease-in-out_infinite] sm:h-36 sm:w-36">
        <Image
          src="/images/journal-of-fst-logo.svg"
          alt="Journal of FST logo"
          fill
          className="object-contain p-0.5 sm:p-1"
          priority
        />
      </div>

      <style jsx>{`
        @keyframes orbitDot {
          0% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-72px);
          }
          100% {
            transform: translate(-50%, -50%) rotate(calc(var(--angle) + 360deg))
              translateY(-72px);
          }
        }

        @keyframes logoFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @media (min-width: 640px) {
          @keyframes orbitDot {
            0% {
              transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-80px);
            }
            100% {
              transform: translate(-50%, -50%) rotate(calc(var(--angle) + 360deg))
                translateY(-80px);
            }
          }
        }
      `}</style>
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
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.2" fill={fill} opacity="0.76" />
      ))}
    </svg>
  );
}
