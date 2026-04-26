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
    <div className="group relative h-[64px]">
      <button className="flex h-[64px] items-center gap-1 whitespace-nowrap border-b-[3px] border-transparent px-[18px] text-[13px] font-bold text-white transition hover:border-[#d99a20] hover:bg-white/10">
        {label}
        <span className="text-[9px]">▼</span>
      </button>

      <div className="absolute left-0 top-[64px] z-50 hidden w-[290px] overflow-hidden rounded-b-md border-t-[3px] border-[#d99a20] bg-white shadow-xl group-hover:block">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block border-b border-slate-200 px-5 py-4 text-[14px] font-medium text-slate-600 hover:bg-[#eef3f7] hover:text-[#061f33]"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}