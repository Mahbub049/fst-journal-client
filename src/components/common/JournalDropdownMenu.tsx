"use client";

import Link from "next/link";

type MenuItem = {
  label: string;
  href: string;
};

type Props = {
  label: string;
  items: MenuItem[];
};

export default function JournalDropdownMenu({ label, items }: Props) {
  return (
    <div className="group relative">
      <button className="nav-link inline-flex items-center gap-1.5">
        <span>{label}</span>
        <span className="text-[10px] text-slate-400 transition group-hover:text-slate-700">
          ▼
        </span>
      </button>

      <div className="invisible absolute left-0 top-full z-50 mt-3 w-[290px] translate-y-2 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-[0_12px_40px_rgba(15,23,42,0.12)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        {items.map((item) => (
<Link
  key={item.href}
  href={item.href}
  scroll={false}
  className="block rounded-xl px-4 py-3 text-[14px] font-medium text-slate-600 hover:bg-[#eef8fc] hover:text-[#22b8e8]"
>
  {item.label}
</Link>
        ))}
      </div>
    </div>
  );
}