const articles = [
  {
    type: "Research Article",
    title:
      "AI-assisted academic systems for outcome-based education and assessment",
    authors: "A. Rahman, S. Akter",
    date: "July 2026",
  },
  {
    type: "Review Article",
    title:
      "Emerging trends in cybersecurity education and institutional readiness",
    authors: "M. Hasan, N. Chowdhury",
    date: "July 2026",
  },
  {
    type: "Research Article",
    title:
      "Machine learning based decision support for sustainable technology systems",
    authors: "T. Islam, R. Ahmed",
    date: "July 2026",
  },
  {
    type: "Technical Article",
    title:
      "Modern web-based information systems for academic process automation",
    authors: "F. Karim",
    date: "July 2026",
  },
  {
    type: "Review Article",
    title:
      "Data-driven approaches in applied science and interdisciplinary research",
    authors: "S. Hossain, M. Rahman",
    date: "July 2026",
  },
  {
    type: "Research Article",
    title:
      "Explainable artificial intelligence for educational and healthcare applications",
    authors: "J. Mahbub, A. Islam",
    date: "July 2026",
  },
];

const tabs = [
  "Latest published",
  "Articles in press",
  "Top cited",
  "Most downloaded",
  "Most popular",
];

export default function ArticlesSection() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-8">
      <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="journal-subheading">Research Publications</p>
          <h2 className="journal-heading mt-3">Articles</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition ${
                index === 0
                  ? "bg-[#1e2557] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article, index) => (
          <article
            key={index}
            className="rounded-2xl border border-slate-200 bg-[#fbfcfd] p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
          >
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#1e2557]">
              {article.type} · Open Access
            </p>

            <h3 className="mt-4 text-[17px] font-semibold leading-7 text-slate-950">
              {article.title}
            </h3>

            <p className="mt-4 text-[14px] text-slate-600">
              {article.authors}
            </p>

            <p className="mt-2 text-[13px] text-slate-500">{article.date}</p>

            <button className="mt-5 text-[14px] font-medium text-[#1e2557] hover:text-slate-950">
              View article →
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}