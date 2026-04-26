const journalInfo = [
  ["Abbreviation", "BUP FST Journal"],
  ["ISSN Print", "2959-4812"],
  ["ISSN Online", "Pending"],
  ["Frequency", "Annual"],
  ["Language", "English"],
  ["Publisher", "Faculty of Science & Technology, BUP"],
  ["Access Type", "Open Access"],
];

export default function JournalInfoSidebar() {
  return (
    <aside className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-[#f8fafc] px-6 py-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#1e2557]">
          Quick Facts
        </p>

        <h3
          className="mt-2 text-[24px] font-semibold text-slate-950"
          style={{ fontFamily: "var(--font-source-serif)" }}
        >
          Journal Information
        </h3>
      </div>

      <div className="divide-y divide-slate-200">
        {journalInfo.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[120px_1fr] gap-4 px-6 py-4 text-[14px]"
          >
            <span className="text-slate-500">{label}</span>
            <span className="font-medium leading-6 text-slate-800">
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 bg-[#f8fafc] px-6 py-5">
        <p className="text-[13px] leading-6 text-slate-600">
          For manuscript preparation, authors should follow the latest journal
          guidelines before submission.
        </p>
      </div>
    </aside>
  );
}