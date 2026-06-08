"use client";

import Link from "next/link";

export type DropdownMenuItem = {
  label: string;
  href: string;
  isExternal?: boolean;
  openInNewTab?: boolean;
};

type Props = {
  label: string;
  items: DropdownMenuItem[];
};

function MenuAnchor({ item }: { item: DropdownMenuItem }) {
  const target = item.openInNewTab ? "_blank" : undefined;
  const rel = item.openInNewTab ? "noopener noreferrer" : undefined;

  if (item.isExternal) {
    return (
      <a
        href={item.href}
        target={target}
        rel={rel}
        className="block rounded-xl px-4 py-3 text-[14px] font-semibold text-[#26364d] transition-all duration-200 hover:bg-[#071a33] hover:text-white"
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      scroll={item.href.includes("#")}
      className="block rounded-xl px-4 py-3 text-[14px] font-semibold text-[#26364d] transition-all duration-200 hover:bg-[#071a33] hover:text-white"
    >
      {item.label}
    </Link>
  );
}

export default function JournalDropdownMenu({ label, items }: Props) {
  return (
    <div className="group relative">
      <button type="button" className="nav-link inline-flex items-center gap-1.5">
        <span>{label}</span>
<span
  aria-hidden="true"
  className="journal-dropdown-arrow mt-[3px] h-0 w-0 border-x-[4px] border-t-[5px] border-x-transparent border-t-slate-500 transition group-hover:border-t-[#1e2557]"
/>
      </button>

      <div className="invisible absolute left-0 top-full z-50 mt-3 w-[290px] translate-y-2 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-[0_12px_40px_rgba(15,23,42,0.12)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        {items.map((item) => (
          <MenuAnchor key={`${item.label}-${item.href}`} item={item} />
        ))}
      </div>
    </div>
  );
}
