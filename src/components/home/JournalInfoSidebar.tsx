const journalInfo = [
  ["Abbr.", "Int. J. Comput. Adv."],
  ["ISSN Print", "2754-8813"],
  ["ISSN Online", "2754-8821"],
  ["Frequency", "Bimonthly"],
  ["Founded", "January 2014"],
  ["Language", "English"],
  ["Publisher", "Academic Press International"],
];

export default function JournalInfoSidebar() {
  return (
    <aside className="overflow-hidden rounded-none border border-slate-200 bg-white">
      <div className="bg-[#123D6B] px-5 py-4">
        <h3 className="text-[18px] font-bold text-white">Journal Information</h3>
      </div>

      <div>
        {journalInfo.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[90px_1fr] border-b border-slate-200 px-4 py-4 text-[13px] last:border-b-0"
          >
            <span className="text-slate-500">{label}</span>
            <span className="font-medium text-slate-800">{value}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}