"use client";

import type { ReactNode, KeyboardEvent } from "react";

export function AdminSectionTabs<T extends string>({ prefix, label, tabs, activeTab, onChange }: {
  prefix: string;
  label: string;
  tabs: readonly { id: T; label: string }[];
  activeTab: T;
  onChange: (tab: T) => void;
}) {
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index - 1 + tabs.length) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault();
    const tab = tabs[next];
    onChange(tab.id);
    document.getElementById(`${prefix}-tab-${tab.id}`)?.focus();
  }
  return (
    <nav aria-label={label} className="sticky top-[72px] z-20 min-w-0 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur-xl">
      <div role="tablist" aria-label={label} className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
        {tabs.map((tab, index) => (
          <button key={tab.id} type="button" role="tab" id={`${prefix}-tab-${tab.id}`} aria-selected={activeTab === tab.id} aria-controls={`${prefix}-panel-${tab.id}`} tabIndex={activeTab === tab.id ? 0 : -1} onClick={() => onChange(tab.id)} onKeyDown={event => handleKeyDown(event, index)} className={`inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005A78] ${activeTab === tab.id ? "bg-[#005A78] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-[#005A78]"}`}>
            <span className={`text-[11px] ${activeTab === tab.id ? "text-cyan-100" : "text-slate-400"}`}>{String(index + 1).padStart(2, "0")}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

export function AdminSectionPanel({ prefix, id, activeTab, children }: { prefix: string; id: string; activeTab: string; children: ReactNode }) {
  // Keep mounted so independent editors and pending uploads retain their state.
  return <div id={`${prefix}-panel-${id}`} role="tabpanel" aria-labelledby={`${prefix}-tab-${id}`} data-admin-panel={id} className={activeTab === id ? "min-w-0" : "hidden"} hidden={activeTab !== id}>{children}</div>;
}
