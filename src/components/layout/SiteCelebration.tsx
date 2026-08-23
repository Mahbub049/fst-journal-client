"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import {
  getPublicHomepage,
  PublicHomepageContent,
} from "@/services/publicHomepageService";

const SESSION_KEY = "jfst_celebration_seen_session";

const isWithinSchedule = (startAt?: string | null, endAt?: string | null) => {
  const now = Date.now();
  const start = startAt ? new Date(startAt).getTime() : null;
  const end = endAt ? new Date(endAt).getTime() : null;

  if (start && Number.isFinite(start) && now < start) return false;
  if (end && Number.isFinite(end) && now > end) return false;
  return true;
};

const palette = ["#f5c84b", "#22b8e8", "#ffffff", "#77d9b2", "#ffad72"];

const seeded = (index: number, salt: number) => {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

type Props = {
  homepage?: PublicHomepageContent | null;
};

export default function SiteCelebration({ homepage }: Props) {
  const [resolvedHomepage, setResolvedHomepage] =
    useState<PublicHomepageContent | null>(homepage || null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (homepage) {
      setResolvedHomepage(homepage);
      return;
    }

    let mounted = true;
    void getPublicHomepage()
      .then((data) => {
        if (mounted) setResolvedHomepage(data);
      })
      .catch(() => {
        // The celebration is decorative. A settings fetch failure should never
        // affect the public site itself.
      });

    return () => {
      mounted = false;
    };
  }, [homepage]);

  const config = useMemo(
    () => ({
      enabled: resolvedHomepage?.celebrationEnabled ?? false,
      style: resolvedHomepage?.celebrationStyle || "both",
      duration: Math.min(
        Math.max(Number(resolvedHomepage?.celebrationDurationSeconds) || 8, 2),
        30,
      ),
      frequency:
        resolvedHomepage?.celebrationFrequency || "once-per-session",
      startAt: resolvedHomepage?.celebrationStartAt || null,
      endAt: resolvedHomepage?.celebrationEndAt || null,
    }),
    [resolvedHomepage],
  );

  useEffect(() => {
    if (!config.enabled || !isWithinSchedule(config.startAt, config.endAt)) {
      setActive(false);
      return;
    }

    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    try {
      if (
        config.frequency === "once-per-session" &&
        sessionStorage.getItem(SESSION_KEY) === "1"
      ) {
        return;
      }

      if (config.frequency === "once-per-session") {
        sessionStorage.setItem(SESSION_KEY, "1");
      }
    } catch {
      // If storage is unavailable, simply allow the visual effect.
    }

    const startTimer = window.setTimeout(() => setActive(true), 180);
    const stopTimer = window.setTimeout(
      () => setActive(false),
      config.duration * 1000 + 350,
    );

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(stopTimer);
      setActive(false);
    };
  }, [
    config.duration,
    config.enabled,
    config.endAt,
    config.frequency,
    config.startAt,
  ]);

  if (!active) return null;

  const showConfetti = config.style === "confetti" || config.style === "both";
  const showFireworks = config.style === "fireworks" || config.style === "both";

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[950] overflow-hidden"
      aria-hidden="true"
    >
      {showConfetti ? <Confetti duration={config.duration} /> : null}
      {showFireworks ? <Fireworks duration={config.duration} /> : null}

      <style>{`
        @keyframes jfstConfettiFall {
          0% {
            transform: translate3d(0, -12vh, 0) rotate(0deg);
            opacity: 0;
          }
          8% { opacity: 0.95; }
          85% { opacity: 0.9; }
          100% {
            transform: translate3d(var(--drift), 112vh, 0) rotate(var(--spin));
            opacity: 0;
          }
        }

        @keyframes jfstFireworkParticle {
          0%, 7% {
            transform: translate(-50%, -50%) scale(0.25);
            opacity: 0;
          }
          12% { opacity: 1; }
          45% {
            transform: translate(
              calc(-50% + var(--dx)),
              calc(-50% + var(--dy))
            ) scale(1);
            opacity: 0.95;
          }
          70%, 100% {
            transform: translate(
              calc(-50% + var(--dx2)),
              calc(-50% + var(--dy2))
            ) scale(0.35);
            opacity: 0;
          }
        }

        @keyframes jfstFireworkCore {
          0%, 8% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          13% { transform: translate(-50%, -50%) scale(1); opacity: 0.95; }
          34%, 100% { transform: translate(-50%, -50%) scale(2.4); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .jfst-celebration-particle { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function Confetti({ duration }: { duration: number }) {
  const pieces = useMemo(() => Array.from({ length: 54 }, (_, index) => index), []);

  return (
    <>
      {pieces.map((index) => {
        const left = seeded(index, 1) * 100;
        const width = 5 + seeded(index, 2) * 6;
        const height = 9 + seeded(index, 3) * 9;
        const delay = seeded(index, 4) * Math.min(2.8, duration * 0.35);
        const fallDuration = 3.8 + seeded(index, 5) * 3.2;
        const drift = (seeded(index, 6) - 0.5) * 180;
        const spin = 420 + seeded(index, 7) * 760;
        const rounded = seeded(index, 8) > 0.68 ? "999px" : "2px";

        const style = {
          left: `${left}%`,
          width: `${width}px`,
          height: `${height}px`,
          background: palette[index % palette.length],
          borderRadius: rounded,
          animationName: "jfstConfettiFall",
          animationDuration: `${fallDuration}s`,
          animationDelay: `${delay}s`,
          animationTimingFunction: "cubic-bezier(0.18,0.75,0.2,1)",
          animationIterationCount: duration > 8 ? "2" : "1",
          animationFillMode: "both",
          "--drift": `${drift}px`,
          "--spin": `${spin}deg`,
        } as CSSProperties & Record<string, string>;

        return (
          <span
            key={index}
            className="jfst-celebration-particle absolute -top-8 block shadow-[0_0_8px_rgba(255,255,255,0.18)]"
            style={style}
          />
        );
      })}
    </>
  );
}

function Fireworks({ duration }: { duration: number }) {
  const bursts = [
    { left: 13, top: 20, delay: 0.15 },
    { left: 83, top: 18, delay: 0.85 },
    { left: 72, top: 48, delay: 1.65 },
    { left: 28, top: 55, delay: 2.35 },
  ];

  return (
    <>
      {bursts.map((burst, burstIndex) => (
        <div
          key={burstIndex}
          className="absolute"
          style={{ left: `${burst.left}%`, top: `${burst.top}%` }}
        >
          <span
            className="jfst-celebration-particle absolute h-4 w-4 rounded-full border border-white/70"
            style={{
              boxShadow: `0 0 18px ${palette[burstIndex % palette.length]}`,
              animation: `jfstFireworkCore 3.1s ease-out ${burst.delay}s ${
                duration >= 9 ? "2" : "1"
              } both`,
            }}
          />

          {Array.from({ length: 14 }, (_, particleIndex) => {
            const angle = (particleIndex / 14) * Math.PI * 2;
            const distance = 46 + seeded(particleIndex + burstIndex * 20, 9) * 45;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            const style = {
              width: `${3 + seeded(particleIndex, burstIndex + 11) * 3}px`,
              height: `${3 + seeded(particleIndex, burstIndex + 13) * 3}px`,
              background: palette[(particleIndex + burstIndex) % palette.length],
              boxShadow: `0 0 10px ${palette[(particleIndex + burstIndex) % palette.length]}`,
              animationName: "jfstFireworkParticle",
              animationDuration: "3.1s",
              animationDelay: `${burst.delay}s`,
              animationTimingFunction: "cubic-bezier(0.12,0.72,0.2,1)",
              animationIterationCount: duration >= 9 ? "2" : "1",
              animationFillMode: "both",
              "--dx": `${dx}px`,
              "--dy": `${dy}px`,
              "--dx2": `${dx * 1.25}px`,
              "--dy2": `${dy * 1.25 + 24}px`,
            } as CSSProperties & Record<string, string>;

            return (
              <span
                key={particleIndex}
                className="jfst-celebration-particle absolute left-0 top-0 block rounded-full"
                style={style}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}
