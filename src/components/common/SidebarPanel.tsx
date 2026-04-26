import { ReactNode } from "react";

type SidebarPanelProps = {
  title: string;
  children: ReactNode;
};

export default function SidebarPanel({
  title,
  children,
}: SidebarPanelProps) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-[#003B5C]">{title}</h3>
      <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
        {children}
      </div>
    </aside>
  );
}