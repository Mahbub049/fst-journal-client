import { PublicHomepageContent } from "@/services/publicHomepageService";
import MotionSection from "@/components/common/MotionSection";

type Props = {
  homepage?: PublicHomepageContent | null;
};

export default function OverviewSection({ homepage }: Props) {
  const title = homepage?.overviewTitle || "Overview";

  const content =
    homepage?.overviewContent ||
    "BUP Faculty of Science & Technology Journal is a peer-reviewed academic publication dedicated to research in computing, engineering, applied science, technology, and interdisciplinary innovation.";

  const paragraphs = content
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <MotionSection direction="left">
      <section className="journal-surface relative overflow-hidden p-7 md:p-8">
        <div className="absolute right-[-110px] top-[-110px] h-64 w-64 rounded-full bg-[#0ea5b7]/10 blur-3xl" />

        <div className="relative max-w-4xl">
          <div className="inline-flex rounded-full border border-[#d9e4ea] bg-[#f8fbfc] px-4 py-2">
            <p className="journal-subheading">About the Journal</p>
          </div>

          <h2
            className="mt-5 text-[34px] font-semibold leading-tight text-[#0b1f3a] md:text-[42px]"
            style={{ fontFamily: "var(--font-source-serif)" }}
          >
            {title}
          </h2>

          <div className="mt-4 journal-gold-line" />

          <div className="mt-7 space-y-5 text-[15px] leading-8 text-slate-700">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-justify text-slate-700">
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
        </div>
      </section>
    </MotionSection>
  );
}
