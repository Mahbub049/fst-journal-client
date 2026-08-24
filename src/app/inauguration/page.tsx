"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Stage = "ready" | "launching" | "inaugurated" | "opening";

const REDIRECT_AFTER_MS = 8200;

export default function InaugurationPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("ready");
  const [countdown, setCountdown] = useState(4);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };

  useEffect(() => {
    return clearTimers;
  }, []);

  useEffect(() => {
    if (stage !== "opening") return;

    setCountdown(4);

    const interval = window.setInterval(() => {
      setCountdown((value) => {
        if (value <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [stage]);

  const ambientDots = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => ({
        id: index,
        left: `${6 + ((index * 31) % 88)}%`,
        top: `${9 + ((index * 47) % 78)}%`,
        delay: `${((index * 17) % 28) / 10}s`,
        duration: `${5.5 + ((index * 13) % 24) / 10}s`,
        size: 2 + (index % 3),
      })),
    [],
  );

  const orbitDots = useMemo(
    () =>
      Array.from({ length: 9 }, (_, index) => ({
        id: index,
        angle: `${index * 40}deg`,
        delay: `${index * -0.6}s`,
      })),
    [],
  );

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 92 }, (_, index) => {
        const angle = (index / 92) * Math.PI * 2;
        const radius = 230 + ((index * 47) % 320);

        return {
          id: index,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          delay: ((index * 17) % 36) / 100,
          duration: 1.45 + ((index * 11) % 12) / 10,
          rotate: (index * 53) % 360,
        };
      }),
    [],
  );

  const inaugurate = () => {
    if (stage !== "ready") return;

    clearTimers();
    setStage("launching");

    timers.current.push(
      window.setTimeout(() => setStage("inaugurated"), 2200),
      window.setTimeout(() => setStage("opening"), 4650),
      window.setTimeout(() => router.push("/"), REDIRECT_AFTER_MS),
    );
  };

  const isCelebrating = stage === "inaugurated" || stage === "opening";
  const isInMotion = stage !== "ready";

  return (
    <main
      className={[
        "relative min-h-screen overflow-hidden bg-[#041827] text-white selection:bg-[#d8b55b] selection:text-[#041827]",
        isInMotion ? "launch-active" : "",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(23,126,154,0.17),transparent_33%),radial-gradient(circle_at_88%_80%,rgba(211,177,84,0.13),transparent_30%)]" />

        <div className="absolute left-1/2 top-[47%] h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.025] animate-[slowSpin_32s_linear_infinite]" />
        <div className="absolute left-1/2 top-[47%] h-[590px] w-[590px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#6dd6ec]/[0.055] animate-[reverseSpin_24s_linear_infinite]" />
        <div className="absolute left-1/2 top-[47%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.045]" />

        <div className="absolute left-1/2 top-[47%] h-[700px] w-[2px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-[#72d9ee]/10 to-transparent blur-[1px] animate-[beamPulse_4.8s_ease-in-out_infinite]" />
        <div className="absolute left-1/2 top-[47%] h-[2px] w-[900px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#d8b55b]/10 to-transparent blur-[1px] animate-[beamPulse_5.4s_ease-in-out_infinite]" />

        {ambientDots.map((dot) => (
          <span
            key={dot.id}
            className="absolute rounded-full bg-white/25 shadow-[0_0_14px_rgba(120,217,237,0.35)] animate-[ambientDrift_ease-in-out_infinite]"
            style={{
              left: dot.left,
              top: dot.top,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
              animationDelay: dot.delay,
              animationDuration: dot.duration,
            }}
          />
        ))}

        <div className="absolute -left-24 top-[18%] h-[1px] w-[460px] rotate-[18deg] bg-gradient-to-r from-transparent via-[#72d9ee]/10 to-transparent animate-[scanLine_7s_ease-in-out_infinite]" />
        <div className="absolute -right-28 bottom-[25%] h-[1px] w-[520px] -rotate-[20deg] bg-gradient-to-r from-transparent via-[#d8b55b]/10 to-transparent animate-[scanLineReverse_8s_ease-in-out_infinite]" />

        <svg
          className="absolute inset-0 h-full w-full opacity-[0.042]"
          viewBox="0 0 1600 900"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M-90 740C281 530 472 611 746 670C1042 734 1272 627 1691 414"
            stroke="white"
          />
          <path
            d="M-90 787C281 577 472 658 746 717C1042 781 1272 674 1691 461"
            stroke="white"
          />
          <path
            d="M-80 835C260 640 485 695 763 747C1092 809 1345 686 1700 514"
            stroke="white"
          />
        </svg>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="mx-auto flex w-full max-w-[1480px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-full bg-white p-1 shadow-[0_10px_30px_rgba(0,0,0,0.18)] animate-[logoFloat_5s_ease-in-out_infinite] sm:h-12 sm:w-12">
              <Image
                src="/images/bup.png"
                alt="Bangladesh University of Professionals"
                fill
                className="object-contain p-1"
                priority
              />
            </div>

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#78d9ed] sm:text-[11px]">
                Bangladesh University of Professionals
              </p>
              <p className="mt-0.5 text-sm font-semibold text-white/80">
                Faculty of Science &amp; Technology
              </p>
            </div>
          </div>

          <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45 backdrop-blur-md sm:block">
            Digital Inauguration · 2026
          </div>
        </header>

        <section className="flex flex-1 items-center justify-center px-5 pb-16 pt-6 sm:px-8">
          <div className="relative mx-auto w-full max-w-6xl text-center">
            <div className="relative mx-auto mb-7 flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
              <div
                className={[
                  "absolute inset-0 rounded-full border border-[#6dd6ec]/25 transition-all duration-1000",
                  stage === "launching" ? "scale-[1.7] opacity-0" : "opacity-100",
                  isCelebrating ? "scale-[1.18] border-[#d8b55b]/35" : "",
                ].join(" ")}
              />

              <div className="absolute inset-[11px] rounded-full border border-white/[0.08] animate-[reverseSpin_13s_linear_infinite]" />

              {orbitDots.map((dot) => (
                <span
                  key={dot.id}
                  className="absolute left-1/2 top-1/2 h-[5px] w-[5px] rounded-full bg-[#7ee0f3] shadow-[0_0_10px_rgba(126,224,243,.85)] animate-[orbitDot_8s_linear_infinite]"
                  style={
                    {
                      "--angle": dot.angle,
                      animationDelay: dot.delay,
                    } as React.CSSProperties
                  }
                />
              ))}

              <div
                className={[
                  "relative h-20 w-20 overflow-hidden rounded-[1.45rem] border border-white/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.24)] transition-all duration-700 sm:h-24 sm:w-24",
                  stage === "launching"
                    ? "scale-110 shadow-[0_0_80px_rgba(120,217,237,0.25)]"
                    : "animate-[logoFloat_5s_ease-in-out_infinite]",
                  isCelebrating
                    ? "shadow-[0_0_90px_rgba(216,181,91,0.28)]"
                    : "",
                ].join(" ")}
              >
                <Image src="/images/bup.png" alt="" fill className="object-contain p-3" />
              </div>

              {stage === "launching" && (
                <>
                  <span className="absolute inset-[-35px] rounded-full border border-[#78d9ed]/35 animate-[launchRing_1.4s_ease-out_infinite]" />
                  <span className="absolute inset-[-70px] rounded-full border border-[#d8b55b]/20 animate-[launchRing_1.4s_ease-out_.35s_infinite]" />
                  <span className="absolute inset-[-105px] rounded-full border border-white/10 animate-[launchRing_1.4s_ease-out_.7s_infinite]" />
                </>
              )}
            </div>

            {stage === "ready" && (
              <div className="animate-[stageIn_.7s_ease-out_both]">
                <p className="text-[11px] font-black uppercase tracking-[0.34em] text-[#d8b55b] animate-[softGlow_3s_ease-in-out_infinite]">
                  Ceremonial Launch
                </p>

                <h1 className="mx-auto mt-5 max-w-5xl font-serif text-[clamp(3.2rem,7vw,7.6rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-white">
                  Journal of FST
                </h1>

                <p className="mx-auto mt-5 max-w-2xl text-sm font-semibold uppercase tracking-[0.2em] text-[#86dff0] sm:text-base">
                  Faculty of Science &amp; Technology
                </p>

                <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/55 sm:text-lg">
                  A renewed digital platform for research, scholarship, and academic
                  exchange.
                </p>

                <div className="mt-11">
                  <button
                    type="button"
                    onClick={inaugurate}
                    className="group relative inline-flex min-w-[250px] items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#d8b55b] px-9 py-4 text-sm font-black tracking-[0.01em] text-[#061827] shadow-[0_22px_65px_rgba(216,181,91,0.20)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#e4c66e] focus:outline-none focus:ring-4 focus:ring-[#d8b55b]/20 sm:min-w-[290px] sm:py-5 sm:text-base animate-[buttonBreathe_2.8s_ease-in-out_infinite]"
                  >
                    <span className="absolute inset-y-0 -left-20 w-12 rotate-12 bg-white/45 blur-md transition-all duration-700 group-hover:left-[120%] animate-[buttonSweep_3.8s_ease-in-out_infinite]" />
                    <Sparkles className="h-5 w-5" />
                    Launch Now
                  </button>
                </div>
              </div>
            )}

            {stage === "launching" && (
              <div className="animate-[stageIn_.55s_ease-out_both]">
                <div className="mx-auto flex h-12 w-12 items-center justify-center">
                  <span className="absolute h-12 w-12 rounded-full border border-[#78d9ed]/25 animate-ping [animation-duration:1.25s]" />
                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#d8b55b]" />
                </div>

                <p className="mt-8 text-[11px] font-black uppercase tracking-[0.32em] text-[#78d9ed] animate-[softGlow_1.8s_ease-in-out_infinite]">
                  Initiating Digital Launch
                </p>

                <h2 className="mx-auto mt-4 max-w-4xl font-serif text-[clamp(2.7rem,5vw,5.4rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-white">
                  Opening a New Chapter
                </h2>

                <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/45">
                  Journal of FST · Bangladesh University of Professionals
                </p>

                <div className="mx-auto mt-8 h-1 w-64 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-[#78d9ed] to-transparent animate-[loaderSweep_1.2s_ease-in-out_infinite]" />
                </div>
              </div>
            )}

            {stage === "inaugurated" && (
              <div className="animate-[stageIn_.7s_ease-out_both]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/25 bg-emerald-300/10 text-emerald-200 shadow-[0_0_70px_rgba(110,231,183,0.16)] animate-[successPulse_2s_ease-in-out_infinite]">
                  <Check className="h-8 w-8" strokeWidth={2.5} />
                </div>

                <p className="mt-7 text-[11px] font-black uppercase tracking-[0.32em] text-[#d8b55b]">
                  Officially Inaugurated
                </p>

                <h2 className="mx-auto mt-4 max-w-5xl font-serif text-[clamp(3rem,6vw,6.4rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-white">
                  The Journal of FST is Now Live
                </h2>

                <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/50 sm:text-lg">
                  Advancing research, accessibility, collaboration, and scholarly
                  communication.
                </p>
              </div>
            )}

            {stage === "opening" && (
              <div className="animate-[stageIn_.55s_ease-out_both]">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#d8b55b]/30 bg-[#d8b55b]/10 text-[#f2d887] animate-[successPulse_1.8s_ease-in-out_infinite]">
                  <Sparkles className="h-6 w-6" />
                </div>

                <p className="mt-7 text-[11px] font-black uppercase tracking-[0.32em] text-[#78d9ed]">
                  Launch Complete
                </p>

                <h2 className="mx-auto mt-4 max-w-4xl font-serif text-[clamp(2.8rem,5vw,5.4rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-white">
                  Welcome to the Journal
                </h2>

                <p className="mt-6 text-base font-semibold text-white/55">
                  Opening the website in {countdown}...
                </p>

                <div className="mx-auto mt-7 h-1 w-56 overflow-hidden rounded-full bg-white/10 sm:w-72">
                  <div className="h-full origin-left animate-[openingBar_3.9s_linear_forwards] rounded-full bg-gradient-to-r from-[#78d9ed] to-[#d8b55b]" />
                </div>
              </div>
            )}

            {isCelebrating && (
              <div className="pointer-events-none absolute left-1/2 top-[38%] h-1 w-1 -translate-x-1/2 -translate-y-1/2">
                {confettiPieces.map((piece) => (
                  <span
                    key={piece.id}
                    className={[
                      "absolute left-0 top-0 rounded-[1px]",
                      piece.id % 5 === 0 ? "h-3 w-1 bg-[#d8b55b]" : "",
                      piece.id % 5 === 1 ? "h-2 w-2 rounded-full bg-[#78d9ed]" : "",
                      piece.id % 5 === 2 ? "h-3 w-1 bg-white" : "",
                      piece.id % 5 === 3 ? "h-2.5 w-1.5 bg-[#e7afca]" : "",
                      piece.id % 5 === 4 ? "h-2 w-2 rotate-45 bg-[#9be7c4]" : "",
                    ].join(" ")}
                    style={
                      {
                        "--tx": `${piece.x}px`,
                        "--ty": `${piece.y}px`,
                        "--rot": `${piece.rotate}deg`,
                        animation: `ceremonyBurst ${piece.duration}s cubic-bezier(.16,.72,.26,1) ${piece.delay}s both`,
                      } as React.CSSProperties
                    }
                  />
                ))}

                <span className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d8b55b]/20 animate-[celebrationWave_2.4s_ease-out_infinite]" />
                <span className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#78d9ed]/15 animate-[celebrationWave_2.4s_ease-out_.8s_infinite]" />
              </div>
            )}
          </div>
        </section>

        <footer className="relative z-10 px-5 pb-5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white/22">
          Bangladesh University of Professionals · Journal of FST
        </footer>
      </div>

      <style jsx global>{`
        @keyframes stageIn {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.985);
            filter: blur(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
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

        @keyframes slowSpin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes reverseSpin {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes orbitDot {
          from {
            transform: rotate(var(--angle)) translateX(66px) rotate(calc(var(--angle) * -1));
            opacity: 0.25;
          }
          50% {
            opacity: 0.9;
          }
          to {
            transform: rotate(calc(var(--angle) + 360deg)) translateX(66px)
              rotate(calc((var(--angle) + 360deg) * -1));
            opacity: 0.25;
          }
        }

        @keyframes ambientDrift {
          0%,
          100% {
            opacity: 0.12;
            transform: translate3d(0, 0, 0) scale(0.85);
          }
          50% {
            opacity: 0.5;
            transform: translate3d(0, -15px, 0) scale(1.15);
          }
        }

        @keyframes softGlow {
          0%,
          100% {
            text-shadow: 0 0 0 rgba(216, 181, 91, 0);
          }
          50% {
            text-shadow: 0 0 18px rgba(216, 181, 91, 0.22);
          }
        }

        @keyframes beamPulse {
          0%,
          100% {
            opacity: 0.2;
            transform: translate(-50%, -50%) scaleY(0.8);
          }
          50% {
            opacity: 0.75;
            transform: translate(-50%, -50%) scaleY(1.08);
          }
        }

        @keyframes scanLine {
          0%,
          100% {
            transform: translateX(-22%) rotate(18deg);
            opacity: 0;
          }
          50% {
            transform: translateX(80%) rotate(18deg);
            opacity: 0.55;
          }
        }

        @keyframes scanLineReverse {
          0%,
          100% {
            transform: translateX(18%) rotate(-20deg);
            opacity: 0;
          }
          50% {
            transform: translateX(-78%) rotate(-20deg);
            opacity: 0.45;
          }
        }

        @keyframes buttonBreathe {
          0%,
          100% {
            box-shadow: 0 22px 65px rgba(216, 181, 91, 0.18);
          }
          50% {
            box-shadow:
              0 24px 75px rgba(216, 181, 91, 0.28),
              0 0 0 7px rgba(216, 181, 91, 0.045);
          }
        }

        @keyframes buttonSweep {
          0%,
          58% {
            left: -5rem;
            opacity: 0;
          }
          66% {
            opacity: 0.65;
          }
          84% {
            left: 120%;
            opacity: 0;
          }
          100% {
            left: 120%;
            opacity: 0;
          }
        }

        @keyframes launchRing {
          from {
            opacity: 0.7;
            transform: scale(0.55);
          }
          to {
            opacity: 0;
            transform: scale(1.45);
          }
        }

        @keyframes loaderSweep {
          0% {
            transform: translateX(-130%);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: translateX(400%);
            opacity: 0;
          }
        }

        @keyframes successPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
        }

        @keyframes ceremonyBurst {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.2) rotate(0deg);
          }
          10% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(
                calc(-50% + var(--tx)),
                calc(-50% + var(--ty))
              )
              scale(1) rotate(var(--rot));
          }
        }

        @keyframes celebrationWave {
          0% {
            opacity: 0.7;
            transform: translate(-50%, -50%) scale(0.25);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(3.1);
          }
        }

        @keyframes openingBar {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        .launch-active::after {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 4;
          background:
            radial-gradient(circle at 50% 45%, rgba(126, 224, 243, 0.09), transparent 27%),
            linear-gradient(120deg, transparent 35%, rgba(255, 255, 255, 0.025) 50%, transparent 65%);
          animation: launchAtmosphere 2.8s ease-in-out infinite;
        }

        @keyframes launchAtmosphere {
          0%,
          100% {
            opacity: 0.35;
          }
          50% {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </main>
  );
}
