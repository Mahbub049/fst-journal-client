const articles = [
  {
    type: "Research article",
    title:
      "Treatment and resource recovery of wastewater using membrane technologies",
    authors: "A. Ahmed, S. Rahman",
    date: "June 2024",
  },
  {
    type: "Review article",
    title:
      "A review of the effect of welding parameters on thermal properties",
    authors: "M. Karim, A. Chowdhury",
    date: "June 2024",
  },
  {
    type: "Review article",
    title:
      "A review on microstructure and tribological properties of composites",
    authors: "M. Singh, A. Kumar",
    date: "June 2024",
  },
  {
    type: "Review article",
    title:
      "Characteristics of raw dredged sediments and thermal durability overview",
    authors: "P. Karmokar",
    date: "June 2024",
  },
  {
    type: "Research article",
    title:
      "Engineering oriented-defined metal-oxide networks for tumor therapy",
    authors: "Ying Zhu, Hongli Chu",
    date: "June 2024",
  },
  {
    type: "Review article",
    title:
      "Edge cutting and AI-driven strategies for semiconductor devices",
    authors: "U. Das, S. Muborak",
    date: "June 2024",
  },
];

export default function ArticlesSection() {
  return (
    <section className="rounded-none bg-white px-6 py-6">
      <div className="border-b border-slate-300 pb-4">
        <h2 className="text-[24px] font-bold text-slate-900">Articles</h2>

        <div className="mt-4 flex flex-wrap gap-5 text-[12px] font-medium text-slate-600">
          <span className="border-b-2 border-[#B63B96] pb-1 text-slate-900">
            Latest published
          </span>
          <span>Articles in press</span>
          <span>Top cited</span>
          <span>Most downloaded</span>
          <span>Most popular</span>
        </div>
      </div>

      <div className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article, index) => (
          <article key={index} className="text-[12px] leading-6 text-slate-700">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {article.type} • Open access
            </p>

            <h3 className="mt-3 text-[16px] font-semibold leading-7 text-slate-900">
              {article.title}
            </h3>

            <p className="mt-3 text-slate-600">{article.authors}</p>
            <p className="mt-2 text-slate-500">{article.date}</p>

            <button className="mt-3 text-[12px] font-semibold text-[#1DA9D6]">
              View PDF
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}