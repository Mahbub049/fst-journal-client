import HomepageCountdown from "@/components/home/HomepageCountdown";
import { PublicHomepageContent } from "@/services/publicHomepageService";

type Props = {
  homepage?: PublicHomepageContent | null;
};

type ContentDensity = "short" | "medium" | "dense";

function UnderlinedHeading({
  title,
  density,
}: {
  title: string;
  density: ContentDensity;
}) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  const firstWord = words[0] || "Welcome";
  const restOfTitle = words.slice(1).join(" ");

  const sizeClass =
    density === "dense"
      ? "text-[32px] md:text-[37px] xl:text-[40px]"
      : density === "medium"
        ? "text-[34px] md:text-[40px] xl:text-[43px]"
        : "text-[36px] md:text-[42px] xl:text-[46px]";

  return (
    <h2
      className={`${sizeClass} font-semibold leading-[1.12] tracking-[-0.025em] text-[#0b1f3a]`}
      style={{ fontFamily: "var(--font-source-serif)" }}
    >
      <span className="relative inline-block pb-3.5 after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:rounded-full after:bg-[#f5c84b]">
        {firstWord}
      </span>
      {restOfTitle ? ` ${restOfTitle}` : ""}
    </h2>
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

  const density: ContentDensity =
    contentLength > 1300
      ? "dense"
      : contentLength > 720
        ? "medium"
        : "short";

  const sectionPadding =
    density === "dense"
      ? "p-7 md:p-8 lg:p-9"
      : density === "medium"
        ? "p-7 md:p-9 lg:p-10"
        : "p-7 md:p-9 lg:p-10 xl:p-11";

  const bodyClass =
    density === "dense"
      ? "text-[14px] leading-7 md:text-[15px] md:leading-[1.85]"
      : density === "medium"
        ? "text-[14.5px] leading-7 md:text-[15.5px] md:leading-8"
        : "text-[15px] leading-8 md:text-[16px] md:leading-8";

  const bodyTopSpacing =
    density === "dense" ? "mt-5" : density === "medium" ? "mt-6" : "mt-7";

  const countdownTopSpacing =
    density === "dense" ? "mt-5" : density === "medium" ? "mt-6" : "mt-8";

  const verticalAlignment =
    density === "dense" ? "justify-start" : "justify-center";

  return (
    <section
      className={`relative flex h-full flex-col overflow-hidden bg-[linear-gradient(135deg,#ffffff_0%,#fbfdff_60%,#edf9ff_100%)] ${sectionPadding}`}
    >
      <div className="pointer-events-none absolute -left-24 bottom-[-120px] h-72 w-72 rounded-full border border-[#22b8e8]/10" />
      <div className="pointer-events-none absolute -left-12 bottom-[-88px] h-56 w-56 rounded-full border border-[#22b8e8]/10" />
      <div className="pointer-events-none absolute right-[-90px] top-[-100px] h-64 w-64 rounded-full bg-[#22b8e8]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-8 right-10 h-2.5 w-2.5 rounded-full bg-[#f5c84b]/80" />

      <div className={`relative z-10 flex min-h-0 flex-1 flex-col ${verticalAlignment}`}>
        <div className="max-w-4xl">
          <UnderlinedHeading title={title} density={density} />

          <div
            className={`${bodyTopSpacing} space-y-3.5 text-slate-700 ${bodyClass}`}
          >
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-left text-slate-700 md:text-justify">
                {paragraph}
              </p>
            ))}

            {paragraphs.length === 0 ? (
              <p className="text-slate-700">
                BUP Faculty of Science & Technology Journal publishes scholarly
                research in science, technology, engineering, and
                interdisciplinary areas.
              </p>
            ) : null}
          </div>
        </div>

        <div className={countdownTopSpacing}>
          <HomepageCountdown
            enabled={homepage?.countdownEnabled !== false}
            title={homepage?.countdownTitle}
            targetDate={homepage?.countdownTargetDate}
            expiredText={homepage?.countdownExpiredText}
            compact={density === "dense"}
          />
        </div>
      </div>
    </section>
  );
}
