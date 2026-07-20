import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FileText,
  Megaphone,
  Send,
  Users,
} from "lucide-react";
import {
  HomepageButton,
  PublicHomepageContent,
} from "@/services/publicHomepageService";

type Props = {
  homepage?: PublicHomepageContent | null;
};

const fallbackButtons: HomepageButton[] = [
  {
    label: "About the Journal",
    url: "/about/about-the-journal",
    variant: "primary",
    order: 1,
    isActive: true,
  },
  {
    label: "Latest Issues",
    url: "/issues/current",
    variant: "secondary",
    order: 2,
    isActive: true,
  },
];

function HomepageActionIcon({ button }: { button: HomepageButton }) {
  const searchableText = `${button.label} ${button.url}`.toLowerCase();
  const className = "h-[18px] w-[18px] shrink-0";

  if (searchableText.includes("about")) {
    return <BookOpen className={className} aria-hidden="true" />;
  }

  if (searchableText.includes("issue") || searchableText.includes("archive")) {
    return <FileText className={className} aria-hidden="true" />;
  }

  if (searchableText.includes("call") || searchableText.includes("paper")) {
    return <Megaphone className={className} aria-hidden="true" />;
  }

  if (searchableText.includes("submit")) {
    return <Send className={className} aria-hidden="true" />;
  }

  if (searchableText.includes("editor")) {
    return <Users className={className} aria-hidden="true" />;
  }

  return <ArrowRight className={className} aria-hidden="true" />;
}

const isExternalUrl = (url: string) => /^https?:\/\//i.test(url);

function OverviewButton({ button }: { button: HomepageButton }) {
  const isPrimary = button.variant === "primary";

  const className = [
    "group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border px-5 py-3 text-sm font-bold transition duration-200",
    isPrimary
      ? "border-[#10163f] bg-[#10163f] text-white shadow-[0_10px_28px_rgba(16,22,63,0.18)] hover:-translate-y-0.5 hover:bg-[#172054]"
      : "border-slate-200 bg-white text-[#111a35] shadow-sm hover:-translate-y-0.5 hover:border-[#9fb7c8] hover:bg-slate-50",
  ].join(" ");

  const contents = (
    <>
      <HomepageActionIcon button={button} />
      <span>{button.label}</span>
    </>
  );

  if (isExternalUrl(button.url)) {
    return (
      <a
        href={button.url}
        target="_blank"
        rel="noreferrer"
        className={className}
      >
        {contents}
      </a>
    );
  }

  return (
    <Link href={button.url || "#"} className={className}>
      {contents}
    </Link>
  );
}

export default function OverviewSection({ homepage }: Props) {
  const title = homepage?.overviewTitle || "Overview";

  const content =
    homepage?.overviewContent ||
    "BUP Faculty of Science & Technology Journal is a peer-reviewed academic publication dedicated to research in computing, engineering, applied science, technology, and interdisciplinary innovation.";

  const paragraphs = content
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const contentLength = paragraphs.join(" ").length;
  const isCompactContent = contentLength < 520;
  const isDenseContent = contentLength > 1200;

  const titleClass = isDenseContent
    ? "text-[34px] md:text-[40px]"
    : isCompactContent
      ? "text-[38px] md:text-[48px]"
      : "text-[36px] md:text-[44px]";

  const bodyClass = isDenseContent
    ? "text-[14px] leading-7 md:text-[15px] md:leading-8"
    : isCompactContent
      ? "text-[16px] leading-8 md:text-[17px] md:leading-9"
      : "text-[15px] leading-8 md:text-[16px] md:leading-8";

  const activeButtons = homepage?.buttons
    ?.filter((button) => button.isActive && button.label.trim() && button.url.trim())
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

  const buttons = activeButtons?.length ? activeButtons : fallbackButtons;

  return (
    <section className="relative flex h-full min-h-[430px] flex-col justify-center overflow-hidden bg-[linear-gradient(135deg,#ffffff_0%,#fbfdff_58%,#eefaff_100%)] p-7 md:p-10 lg:p-12">
      <div className="pointer-events-none absolute -left-24 bottom-[-120px] h-72 w-72 rounded-full border border-[#22b8e8]/10" />
      <div className="pointer-events-none absolute -left-12 bottom-[-88px] h-56 w-56 rounded-full border border-[#22b8e8]/10" />
      <div className="pointer-events-none absolute right-[-90px] top-[-100px] h-64 w-64 rounded-full bg-[#22b8e8]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-8 right-10 h-2.5 w-2.5 rounded-full bg-[#f5c84b]/80" />

      <div className="relative max-w-4xl">
        <h2
          className={`${titleClass} font-semibold leading-[1.08] tracking-[-0.02em] text-[#0b1f3a]`}
          style={{ fontFamily: "var(--font-source-serif)" }}
        >
          {title}
        </h2>

        <div className="mt-5 journal-gold-line" />

        <div className={`mt-8 space-y-5 text-slate-700 ${bodyClass}`}>
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-left text-slate-700 md:text-justify">
              {paragraph}
            </p>
          ))}

          {paragraphs.length === 0 ? (
            <p className="text-slate-700">
              BUP Faculty of Science & Technology Journal publishes scholarly
              research in science, technology, engineering, and interdisciplinary
              areas.
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {buttons.map((button, index) => (
            <OverviewButton
              key={`${button.label}-${button.url}-${index}`}
              button={button}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
