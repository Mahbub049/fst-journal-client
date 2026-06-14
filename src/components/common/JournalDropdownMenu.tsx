"use client";

import { MouseEvent } from "react";
import Link from "next/link";

export type DropdownMenuItem = {
  label: string;
  href: string;
  isExternal?: boolean;
  openInNewTab?: boolean;
};

type Props = {
  label: string;
  href?: string;
  isExternal?: boolean;
  openInNewTab?: boolean;
  items: DropdownMenuItem[];
};

const isAbsoluteUrl = (href: string) => {
  return /^(https?:\/\/|mailto:|tel:)/i.test(href);
};

const handleSamePageNavigationClick = (
  event: MouseEvent<HTMLAnchorElement>,
  href: string,
) => {
  if (typeof window === "undefined") return;

  const targetUrl = new URL(href, window.location.origin);
  const currentUrl = new URL(window.location.href);
  const isSamePage =
    targetUrl.origin === currentUrl.origin &&
    targetUrl.pathname === currentUrl.pathname &&
    targetUrl.search === currentUrl.search;

  if (!isSamePage) return;

  event.preventDefault();

  window.history.pushState(
    null,
    "",
    `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`,
  );

  if (targetUrl.hash) {
    window.dispatchEvent(new Event("hashchange"));
    return;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
};

function MenuAnchor({ item }: { item: DropdownMenuItem }) {
  const target = item.openInNewTab ? "_blank" : undefined;
  const rel = item.openInNewTab ? "noopener noreferrer" : undefined;
  const shouldUseAnchor = item.isExternal || isAbsoluteUrl(item.href);

  if (shouldUseAnchor) {
    return (
      <a
        href={item.href}
        target={target}
        rel={rel}
        onClick={(event) => handleSamePageNavigationClick(event, item.href)}
        className="block rounded-xl px-4 py-3 text-[14px] font-semibold text-[#26364d] transition-all duration-200 hover:bg-[#071a33] hover:text-white"
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      scroll={!item.href.includes("#")}
      onClick={(event) => handleSamePageNavigationClick(event, item.href)}
      className="block rounded-xl px-4 py-3 text-[14px] font-semibold text-[#26364d] transition-all duration-200 hover:bg-[#071a33] hover:text-white"
    >
      {item.label}
    </Link>
  );
}

function ParentLabel({
  label,
  href,
  isExternal,
  openInNewTab,
}: {
  label: string;
  href: string;
  isExternal?: boolean;
  openInNewTab?: boolean;
}) {
  const target = openInNewTab ? "_blank" : undefined;
  const rel = openInNewTab ? "noopener noreferrer" : undefined;
  const shouldUseAnchor = isExternal || isAbsoluteUrl(href);
  const content = (
    <>
      <span>{label}</span>
      <span
        aria-hidden="true"
        className="journal-dropdown-arrow mt-[3px] h-0 w-0 border-x-[4px] border-t-[5px] border-x-transparent border-t-slate-500 transition group-hover:border-t-[#1e2557]"
      />
    </>
  );

  if (!href || href === "#") {
    return (
      <button
        type="button"
        className="nav-link inline-flex items-center gap-1.5 whitespace-nowrap"
      >
        {content}
      </button>
    );
  }

  if (shouldUseAnchor) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        onClick={(event) => handleSamePageNavigationClick(event, href)}
        className="nav-link inline-flex items-center gap-1.5 whitespace-nowrap"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      scroll={!href.includes("#")}
      onClick={(event) => handleSamePageNavigationClick(event, href)}
      className="nav-link inline-flex items-center gap-1.5 whitespace-nowrap"
    >
      {content}
    </Link>
  );
}

export default function JournalDropdownMenu({
  label,
  href = "#",
  isExternal,
  openInNewTab,
  items,
}: Props) {
  return (
    <div className="group relative">
      <ParentLabel
        label={label}
        href={href}
        isExternal={isExternal}
        openInNewTab={openInNewTab}
      />

      <div className="invisible absolute left-0 top-full z-50 mt-3 w-[290px] translate-y-2 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-[0_12px_40px_rgba(15,23,42,0.12)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        {items.map((item) => (
          <MenuAnchor key={`${item.label}-${item.href}`} item={item} />
        ))}
      </div>
    </div>
  );
}
