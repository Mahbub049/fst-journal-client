"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  KeyRound,
  LogOut,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import api from "@/lib/api";
import { getAdminUser, logoutAdmin } from "@/lib/auth";

export default function AdminTopbar() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const admin = getAdminUser();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Session may already be expired. Clear local admin data either way.
    } finally {
      logoutAdmin();
      window.location.href = "/admin/login";
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Content Management System
          </p>
          <h2 className="truncate text-xl font-bold text-slate-900">
            Journal Admin Dashboard
          </h2>
        </div>

        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 sm:px-4"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#005A78] text-xs font-black text-white">
              {(admin?.name || "A").charAt(0).toUpperCase()}
            </span>
            <span className="hidden sm:inline">{admin?.name || "Admin"}</span>
            <ChevronDown size={16} />
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
              <div className="border-b border-slate-100 px-4 py-4">
                <p className="font-bold text-slate-950">
                  {admin?.name || "Admin"}
                </p>
                <p className="mt-1 truncate text-xs font-medium text-slate-500">
                  {admin?.email || "admin"}
                </p>
                <span className="mt-3 inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-[#005A78]">
                  {admin?.role === "super_admin" ? "Super Admin" : "Admin"}
                </span>
              </div>

              <div className="p-2">
                <Link
                  href="/admin/account"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#005A78]"
                >
                  <UserCircle2 size={18} />
                  Profile & Security
                </Link>

                <Link
                  href="/admin/account"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#005A78]"
                >
                  <KeyRound size={18} />
                  Change Password
                </Link>

                {admin?.role === "super_admin" && (
                  <Link
                    href="/admin/admin-access"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#005A78]"
                  >
                    <ShieldCheck size={18} />
                    Admin Access Control
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
