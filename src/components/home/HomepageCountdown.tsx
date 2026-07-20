"use client";

import { Clock3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Props = {
  enabled?: boolean;
  title?: string;
  targetDate?: string | null;
  expiredText?: string;
  compact?: boolean;
};

type RemainingTime = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
  validTarget: boolean;
};

const EMPTY_TIME: RemainingTime = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  expired: false,
  validTarget: false,
};

function calculateRemaining(targetDate: string | null | undefined, now: number): RemainingTime {
  if (!targetDate) return EMPTY_TIME;

  const target = new Date(targetDate).getTime();
  if (!Number.isFinite(target)) return EMPTY_TIME;

  const difference = target - now;
  if (difference <= 0) {
    return {
      ...EMPTY_TIME,
      expired: true,
      validTarget: true,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    expired: false,
    validTarget: true,
  };
}

function TimerValue({
  value,
  label,
  compact = false,
}: {
  value: number | null;
  label: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:px-4 ${
        compact ? "py-3" : "py-4"
      }`}
    >
      <span
        className={`${
          compact
            ? "text-[25px] sm:text-[29px] lg:text-[32px]"
            : "text-[28px] sm:text-[34px] lg:text-[38px]"
        } font-extrabold tabular-nums leading-none tracking-[0.04em] text-[#baf4f6]`}
      >
        {value === null ? "--" : String(value).padStart(2, "0")}
      </span>
      <span className="mt-2 text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-100/65 sm:text-[10px]">
        {label}
      </span>
    </div>
  );
}

export default function HomepageCountdown({
  enabled = true,
  title = "Countdown to the Next Journal Milestone",
  targetDate,
  expiredText = "The scheduled date has arrived",
  compact = false,
}: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const remaining = useMemo(
    () => calculateRemaining(targetDate, now),
    [now, targetDate],
  );

  const statusText = useMemo(() => {
    if (!remaining.validTarget) return "SCHEDULE PENDING";
    if (remaining.expired) return "DATE REACHED";
    return "LIVE TIMER";
  }, [remaining.expired, remaining.validTarget]);

  if (!enabled) return null;

  return (
    <div
      className={`overflow-hidden rounded-[24px] border border-[#163d58] bg-[linear-gradient(115deg,#071d35_0%,#0d2845_52%,#11143a_100%)] shadow-[0_18px_38px_rgba(7,29,53,0.18)] ${
        compact ? "p-4 sm:p-5" : "p-5 sm:p-6"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#22b8e8,#58d5c3)] text-[#071d35] shadow-[0_8px_20px_rgba(34,184,232,0.28)]">
            <Clock3 className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="text-[15px] font-bold leading-6 text-white sm:text-[17px]">
            {title || "Countdown"}
          </h3>
        </div>

        <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100/60">
          <span className="h-2 w-2 rounded-full bg-[#f5c84b] shadow-[0_0_12px_rgba(245,200,75,0.8)]" />
          {statusText}
        </span>
      </div>

      {remaining.expired && remaining.validTarget ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.055] px-5 py-6 text-center text-sm font-bold text-cyan-50">
          {expiredText || "The scheduled date has arrived"}
        </div>
      ) : (
        <div
          className={`${compact ? "mt-4" : "mt-5"} grid grid-cols-2 gap-3 sm:grid-cols-4`}
        >
          <TimerValue
            value={remaining.validTarget ? remaining.days : null}
            label="Days"
            compact={compact}
          />
          <TimerValue
            value={remaining.validTarget ? remaining.hours : null}
            label="Hours"
            compact={compact}
          />
          <TimerValue
            value={remaining.validTarget ? remaining.minutes : null}
            label="Minutes"
            compact={compact}
          />
          <TimerValue
            value={remaining.validTarget ? remaining.seconds : null}
            label="Seconds"
            compact={compact}
          />
        </div>
      )}
    </div>
  );
}
