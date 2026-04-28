import { PublicHomepageContent } from "@/services/publicHomepageService";

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
    <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-8">
      <div className="max-w-3xl">
        <p className="journal-subheading">About the Journal</p>

        <h2 className="journal-heading mt-3">{title}</h2>

        <div className="mt-6 space-y-5 text-[15px] leading-8 text-slate-600">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}

          {paragraphs.length === 0 ? (
            <p>
              BUP Faculty of Science & Technology Journal publishes scholarly
              research in science, technology, engineering, and interdisciplinary
              areas.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}