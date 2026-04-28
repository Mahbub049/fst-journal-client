"use client";

import { getAdminUser } from "@/lib/auth";

export default function AdminTopbar() {
  const admin = getAdminUser();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Content Management System
          </p>
          <h2 className="text-xl font-bold text-slate-900">
            Journal Admin Dashboard
          </h2>
        </div>

        <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 sm:block">
          {admin?.name || "Admin"}
        </div>
      </div>
    </header>
  );
}