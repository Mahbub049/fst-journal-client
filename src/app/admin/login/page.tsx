"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { setAdminToken, setAdminUser } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@bupfstjournal.com");
  const [password, setPassword] = useState("admin12345");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      setAdminToken(data.token);
      setAdminUser(data.admin);

      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-[#F4F7FA] lg:grid-cols-[1fr_520px]">
      <section className="hidden bg-[#005A78] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="mb-8 flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full bg-white p-2">
              <Image
                src="/images/bup.png"
                alt="BUP Logo"
                fill
                className="object-contain p-2"
                priority
              />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                Journal of FST
              </p>
              <h1 className="text-2xl font-bold">Admin CMS</h1>
            </div>
          </div>

          <h2 className="max-w-xl text-4xl font-bold leading-tight">
            Manage journal website content, issues, articles, editors, images,
            and PDFs from one place.
          </h2>

          <p className="mt-6 max-w-xl text-base leading-8 text-white/80">
            This admin panel will control all editable website sections except
            the fixed journal name and BUP logo.
          </p>
        </div>

        <p className="text-sm text-white/60">
          Bangladesh University of Professionals
        </p>
      </section>

      <section className="flex items-center justify-center p-5">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="relative mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-white">
              <Image
                src="/images/bup.png"
                alt="BUP Logo"
                fill
                className="object-contain p-2"
                priority
              />
            </div>

            <h1 className="text-3xl font-bold text-[#003B5C]">
              Admin Login
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to manage journal CMS content.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#005A78] focus:ring-4 focus:ring-[#005A78]/10"
                placeholder="admin@bupfstjournal.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#005A78] focus:ring-4 focus:ring-[#005A78]/10"
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-[#005A78] text-sm font-bold text-white transition hover:bg-[#00465d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}