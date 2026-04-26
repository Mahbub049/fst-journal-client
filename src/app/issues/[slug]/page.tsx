import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";
import Link from "next/link";

const issuePages: Record<
  string,
  {
    title: string;
    subtitle: string;
  }
> = {
  current: {
    title: "Current Issue",
    subtitle:
      "Explore the latest published issue of BUP Faculty of Science & Technology Journal.",
  },
  archive: {
    title: "All Issues / Archive",
    subtitle:
      "Browse previous volumes and issues published by the journal.",
  },
  special: {
    title: "Special Issues",
    subtitle:
      "Special issues focus on selected themes, emerging research areas, and invited academic topics.",
  },
  "most-cited": {
    title: "Most Cited",
    subtitle:
      "A collection of highly cited articles published in the journal.",
  },
  "most-read": {
    title: "Most Read",
    subtitle:
      "A collection of frequently viewed and widely read journal articles.",
  },
};

const sideLinks = [
  { label: "Current Issue", href: "/issues/current" },
  { label: "All Issues / Archive", href: "/issues/archive" },
  { label: "Special Issues", href: "/issues/special" },
  { label: "Most Cited", href: "/issues/most-cited" },
  { label: "Most Read", href: "/issues/most-read" },
];

const sampleIssues = [
  {
    title: "Journal of FST",
    volume: "03",
    issue: "01",
    year: "July 2025",
    issn: "2959-4812",
  },
  {
    title: "Journal of FST",
    volume: "02",
    issue: "01",
    year: "July 2023",
    issn: "2959-4812",
  },
  {
    title: "Journal of FST",
    volume: "01",
    issue: "01",
    year: "July 2022",
    issn: "2959-4812",
  },
];

export default async function IssuesInnerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = issuePages[slug] || issuePages.current;

  return (
    <PublicLayout>
      <main className="bg-[#f7f8fb]">
        <section className="border-b border-slate-200 bg-white">
          <Container className="py-12 md:py-16">
            <p className="journal-subheading">Issues</p>

            <h1
              className="mt-4 text-[40px] font-semibold leading-tight tracking-tight text-slate-950 md:text-[56px]"
              style={{ fontFamily: "var(--font-source-serif)" }}
            >
              {data.title}
            </h1>

            <p className="mt-5 max-w-3xl text-[16px] leading-8 text-slate-600">
              {data.subtitle}
            </p>
          </Container>
        </section>

        <Container className="py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-28">
              <p className="px-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#111433]">
                Issues Menu
              </p>

              <div className="mt-4 grid gap-2">
                {sideLinks.map((link) => (
<Link
  key={link.href}
  href={link.href}
  scroll={false}
  className={`rounded-2xl px-4 py-3 text-[14px] font-medium ${
    link.href.endsWith(slug)
      ? "bg-[#111433] text-white"
      : "text-slate-600 hover:bg-[#eef8fc] hover:text-[#22b8e8]"
  }`}
>
  {link.label}
</Link>
                ))}
              </div>
            </aside>

            <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-8">
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="journal-subheading">Published Issues</p>

                  <h2
                    className="mt-3 text-[30px] font-semibold leading-tight text-slate-950"
                    style={{ fontFamily: "var(--font-source-serif)" }}
                  >
                    {data.title}
                  </h2>
                </div>

                <button className="inline-flex h-11 w-fit items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-[14px] font-medium text-slate-700 hover:border-[#111433]/30 hover:text-[#111433]">
                  Filter Issues
                </button>
              </div>

              <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {sampleIssues.map((issue) => (
                  <article
                    key={`${issue.volume}-${issue.issue}`}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-[#fbfcfd] transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex aspect-[0.8] items-center justify-center bg-slate-100 p-6">
                      <div className="flex h-full w-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-center">
                        <div>
                          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#111433]">
                            BUP FST Journal
                          </p>

                          <p
                            className="mt-5 text-[32px] font-semibold text-slate-950"
                            style={{ fontFamily: "var(--font-source-serif)" }}
                          >
                            Vol. {issue.volume}
                          </p>

                          <p className="mt-2 text-[15px] text-slate-500">
                            Issue {issue.issue}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#111433]">
                        ISSN {issue.issn}
                      </p>

                      <h3 className="mt-3 text-[17px] font-semibold leading-7 text-slate-950">
                        {issue.title}, Volume {issue.volume}, Issue{" "}
                        {issue.issue}
                      </h3>

                      <p className="mt-2 text-[14px] text-slate-500">
                        {issue.year}
                      </p>

                      <button className="mt-5 text-[14px] font-medium text-[#111433] hover:text-slate-950">
                        View issue →
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </Container>
      </main>
    </PublicLayout>
  );
}