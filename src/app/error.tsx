"use client";

import Image from "next/image";
import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="min-h-screen bg-[#F5F8FB] px-5 py-8 text-[#071D33]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(0,102,128,0.10),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(236,184,73,0.13),transparent_30%)]" />

      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <div className="w-full max-w-[560px] rounded-[30px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
            <Image
              src="/images/bup.png"
              alt="BUP Logo"
              width={46}
              height={46}
              className="object-contain"
              priority
            />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#006A82]">
            Journal of FST
          </p>

          <div className="mx-auto my-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#06152A] text-3xl font-black text-white shadow-lg shadow-slate-900/15">
            !
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#071D33] sm:text-4xl">
            Something went wrong
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-600">
            The page could not load properly. Please try again or return to the homepage.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#06152A] px-6 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-[#0B2340]"
            >
              Try Again
            </button>

            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-bold text-[#071D33] transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
