import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";
import Link from "next/link";

const pageData: Record<
  string,
  {
    title: string;
    subtitle: string;
    sections: { heading: string; body: string }[];
  }
> = {
  "author-guidelines": {
    title: "Author Guidelines",
    subtitle:
      "Instructions for preparing manuscripts for BUP Faculty of Science & Technology Journal.",
    sections: [
      {
        heading: "Manuscript Preparation",
        body: "Authors should prepare manuscripts clearly, following academic writing standards, proper formatting, and the journal template where applicable.",
      },
      {
        heading: "Originality",
        body: "Submitted manuscripts must be original and should not be under review or published elsewhere at the time of submission.",
      },
      {
        heading: "Citation and Referencing",
        body: "All sources should be properly cited. Authors must follow the reference style recommended by the journal.",
      },
    ],
  },
  "submission-guidelines": {
    title: "Submission Guidelines",
    subtitle:
      "Steps and requirements for submitting manuscripts to the journal.",
    sections: [
      {
        heading: "Before Submission",
        body: "Authors should check the journal scope, formatting requirements, ethical guidelines, and author declaration before submission.",
      },
      {
        heading: "Submission Process",
        body: "The manuscript should be submitted with all required information, including title, abstract, keywords, author details, and supporting files where necessary.",
      },
      {
        heading: "Review Readiness",
        body: "Manuscripts should be carefully proofread before submission to reduce formatting, language, and structural issues.",
      },
    ],
  },
  "peer-review-process": {
    title: "Peer Review Process",
    subtitle:
      "The journal follows an academic peer-review process to maintain publication quality.",
    sections: [
      {
        heading: "Initial Screening",
        body: "Submitted manuscripts are first checked for scope, completeness, formatting, and basic publication requirements.",
      },
      {
        heading: "Reviewer Evaluation",
        body: "Suitable manuscripts are sent to reviewers for academic evaluation based on originality, methodology, clarity, contribution, and relevance.",
      },
      {
        heading: "Editorial Decision",
        body: "Based on reviewer comments, the editorial team may accept, request revision, or reject the manuscript.",
      },
    ],
  },
  "article-processing-charge": {
    title: "Article Processing Charge",
    subtitle:
      "Information regarding publication fees or processing charges.",
    sections: [
      {
        heading: "Current Policy",
        body: "Article processing charge information will be announced by the journal authority. Authors should check the latest notice before submission.",
      },
      {
        heading: "Transparency",
        body: "Any applicable charge will be communicated clearly to authors before final publication.",
      },
    ],
  },
  "copyright-licensing": {
    title: "Copyright & Licensing",
    subtitle:
      "Guidelines regarding author rights, copyright, and publication permission.",
    sections: [
      {
        heading: "Author Responsibility",
        body: "Authors are responsible for ensuring that submitted work does not violate copyright, permission, or intellectual property rules.",
      },
      {
        heading: "Licensing",
        body: "The licensing model will follow the policy approved by the journal authority and will be clearly mentioned with published articles.",
      },
    ],
  },
  templates: {
    title: "Templates",
    subtitle:
      "Downloadable templates and formatting resources for authors.",
    sections: [
      {
        heading: "Manuscript Template",
        body: "Authors should use the recommended manuscript template once it is provided by the journal authority.",
      },
      {
        heading: "Formatting Support",
        body: "Templates help maintain consistent structure, formatting, citation style, and overall presentation of submitted manuscripts.",
      },
    ],
  },
};

const sideLinks = [
  { label: "Author Guidelines", href: "/for-authors/author-guidelines" },
  { label: "Submission Guidelines", href: "/for-authors/submission-guidelines" },
  { label: "Peer Review Process", href: "/for-authors/peer-review-process" },
  { label: "Article Processing Charge", href: "/for-authors/article-processing-charge" },
  { label: "Copyright & Licensing", href: "/for-authors/copyright-licensing" },
  { label: "Templates", href: "/for-authors/templates" },
];

export default async function ForAuthorsInnerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = pageData[slug] || pageData["author-guidelines"];

  return (
    <PublicLayout>
      <main className="bg-[#f7f8fb]">
        <section className="border-b border-slate-200 bg-white">
          <Container className="py-12 md:py-16">
            <p className="journal-subheading">For Authors</p>

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
                Author Menu
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

            <section className="space-y-5">
              {data.sections.map((section) => (
                <article
                  key={section.heading}
                  className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-8"
                >
                  <h2
                    className="text-[28px] font-semibold leading-tight text-slate-950"
                    style={{ fontFamily: "var(--font-source-serif)" }}
                  >
                    {section.heading}
                  </h2>

                  <p className="mt-4 text-[16px] leading-8 text-slate-600">
                    {section.body}
                  </p>
                </article>
              ))}

              <div className="rounded-3xl border border-slate-200 bg-[#111433] p-7 text-white shadow-sm">
                <h2
                  className="text-[28px] font-semibold leading-tight"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  Need help preparing your manuscript?
                </h2>

                <p className="mt-4 text-[15px] leading-7 text-white/80">
                  Please review the author guidelines and call for papers page
                  before final submission.
                </p>

                <Link
                  href="/call-for-papers"
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-[14px] font-medium text-[#111433] hover:bg-slate-100"
                >
                  View Call for Papers
                </Link>
              </div>
            </section>
          </div>
        </Container>
      </main>
    </PublicLayout>
  );
}