import {
  BadgeInfo,
  BookOpen,
  Building2,
  CalendarDays,
  Flag,
  Globe2,
  Languages,
  LockOpen,
} from "lucide-react";
import { PublicHomepageContent } from "@/services/publicHomepageService";

type Props = {
  homepage?: PublicHomepageContent | null;
  compact?: boolean;
};

type JournalInfoRow = {
  label: string;
  value: string;
};

const fallbackJournalInfo: JournalInfoRow[] = [
  { label: "Abbreviation", value: "Journal of FST" },
  { label: "ISSN Print", value: "2959-4812" },
  { label: "ISSN Online", value: "2959-4812" },
  { label: "Frequency", value: "Annual" },
  { label: "Language", value: "English" },
  { label: "Publisher", value: "Faculty of Science & Technology, BUP" },
  { label: "Access Type", value: "Open Access" },
];

function JournalInfoIcon({ label }: { label: string }) {
  const normalizedLabel = label.toLowerCase();
  const className = "h-[26px] w-[24px] md:h-[19px] md:w-[19px]";

  if (normalizedLabel.includes("publisher") || normalizedLabel.includes("institution")) {
    return <Building2 className={className} aria-hidden="true" />;
  }

  if (normalizedLabel.includes("issn") && normalizedLabel.includes("online")) {
    return <Globe2 className={className} aria-hidden="true" />;
  }

  if (normalizedLabel.includes("issn")) {
    return <BookOpen className={className} aria-hidden="true" />;
  }

  if (
    normalizedLabel.includes("frequency") ||
    normalizedLabel.includes("publication") ||
    normalizedLabel.includes("schedule")
  ) {
    return <CalendarDays className={className} aria-hidden="true" />;
  }

  if (normalizedLabel.includes("language")) {
    return <Languages className={className} aria-hidden="true" />;
  }

  if (normalizedLabel.includes("access") || normalizedLabel.includes("open")) {
    return <LockOpen className={className} aria-hidden="true" />;
  }

  if (
    normalizedLabel.includes("founded") ||
    normalizedLabel.includes("established") ||
    normalizedLabel.includes("year")
  ) {
    return <Flag className={className} aria-hidden="true" />;
  }

  return <BadgeInfo className={className} aria-hidden="true" />;
}

export default function JournalInfoSidebar({ homepage, compact = false }: Props) {
  const activeItems = homepage?.journalInfoItems
    ?.filter((item) => item.isActive)
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

  const journalInfo: JournalInfoRow[] = activeItems?.length
    ? activeItems.map((item) => ({ label: item.label, value: item.value }))
    : fallbackJournalInfo;

  return (
    <aside className={`flex h-full flex-col bg-white ${compact ? "min-h-0" : "min-h-[430px]"}`}>
      <div className={`border-b border-slate-200 px-6 ${compact ? "py-3.5 md:px-6 md:py-4" : "py-5 md:px-8 md:py-6"}`}>
        <h3
          className={`${compact ? "text-[22px] md:text-[24px]" : "text-[26px] md:text-[29px]"} font-semibold leading-tight text-[#0b1f3a]`}
          style={{ fontFamily: "var(--font-source-serif)" }}
        >
          {homepage?.journalInfoTitle || "Journal Information"}
        </h3>
      </div>

      <div className="flex-1 divide-y divide-slate-200">
        {journalInfo.map(({ label, value }, index) => {
          return (
            <div
              key={`${label}-${index}`}
              className={`grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4 px-4 text-[13.5px] md:grid-cols-[42px_minmax(100px,0.75fr)_1px_minmax(0,1.25fr)] md:gap-4 md:px-6 ${compact ? "py-3.5 md:py-[11px]" : "py-4 md:py-[17px]"}`}
            >
              <span className={`row-span-2 flex h-14 w-14 items-center justify-center self-center rounded-full bg-[#eaf5fb] text-[#0b1f3a] md:row-auto md:self-auto md:rounded-xl ${compact ? "md:h-10 md:w-10" : "md:h-11 md:w-11"}`}>
                <JournalInfoIcon label={label} />
              </span>

              <div className="min-w-0 self-center md:contents">
                <span
                  className={`${compact ? "leading-5" : "leading-6"} block text-[12px] font-medium text-slate-500 md:text-[13.5px] md:font-normal md:text-slate-600`}
                >
                  {label}
                </span>

                <span
                  className={`hidden w-px bg-slate-200 md:block ${compact ? "h-9" : "h-10"}`}
                  aria-hidden="true"
                />

                <span
                  className={`mt-0.5 block min-w-0 break-words font-semibold text-slate-900 md:mt-0 ${compact ? "leading-5" : "leading-6"}`}
                >
                  {value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
