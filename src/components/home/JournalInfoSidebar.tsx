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
  const className = "h-[19px] w-[19px]";

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

export default function JournalInfoSidebar({ homepage }: Props) {
  const activeItems = homepage?.journalInfoItems
    ?.filter((item) => item.isActive)
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

  const journalInfo: JournalInfoRow[] = activeItems?.length
    ? activeItems.map((item) => ({ label: item.label, value: item.value }))
    : fallbackJournalInfo;

  return (
    <aside className="flex h-full min-h-[430px] flex-col bg-white">
      <div className="border-b border-slate-200 px-6 py-5 md:px-8 md:py-6">
        <h3
          className="text-[26px] font-semibold leading-tight text-[#0b1f3a] md:text-[29px]"
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
              className="grid grid-cols-[42px_minmax(92px,0.75fr)_minmax(0,1.25fr)] items-center gap-4 px-5 py-4 text-[14px] md:grid-cols-[46px_minmax(105px,0.75fr)_1px_minmax(0,1.25fr)] md:gap-5 md:px-7 md:py-[17px]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf5fb] text-[#0b1f3a] md:h-11 md:w-11">
                <JournalInfoIcon label={label} />
              </span>

              <span className="leading-6 text-slate-600">{label}</span>

              <span
                className="hidden h-10 w-px bg-slate-200 md:block"
                aria-hidden="true"
              />

              <span className="col-span-2 break-words font-semibold leading-6 text-slate-900 md:col-span-1">
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
