import Image from "next/image";
import Link from "next/link";
import Container from "@/components/common/Container";

export default function JournalHero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-[#f5f7fb]">
      <div className="absolute inset-x-0 top-0 h-[230px] journal-gradient" />

      <Container className="relative py-10 md:py-14">
        <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-white shadow-[0_28px_90px_rgba(17,20,51,0.18)]">
          <div className="h-2 bg-gradient-to-r from-[#22b8e8] via-[#1e2557] to-[#f5c84b]" />

          <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[155px_minmax(0,1fr)_245px] lg:items-center lg:p-10">
            <div className="flex justify-center lg:justify-start">
              <div className="relative h-[220px] w-[156px] overflow-hidden rounded-xl border border-slate-200 bg-[#111433] shadow-2xl">
                <Image
                  src="/images/cover.jpg"
                  alt="BUP FST Journal cover"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            <div className="text-center lg:text-left">
              <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#1e2557]">
                Bangladesh University of Professionals
              </p>

              <h1
                className="mt-4 max-w-4xl text-[36px] font-semibold leading-[1.08] tracking-tight text-[#111433] md:text-[52px]"
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                Journal of FST
              </h1>

              {/* <p className="mt-5 max-w-3xl text-[15px] leading-8 text-slate-600 md:text-[16px]">
                A scholarly platform for publishing peer-reviewed research in
                science, technology, engineering, computing, and emerging
                interdisciplinary fields.
              </p> */}

              <div className="mt-7 grid gap-3 md:max-w-2xl md:grid-cols-[1fr_1.4fr]">
                <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Publishing Model
                  </p>
                  <p className="mt-2 text-[20px] font-semibold text-[#111433]">
                    Open Access
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Electronic ISSN
                    </p>
                    <p className="mt-2 text-[20px] font-semibold text-[#111433]">
                      2959-4812
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Print ISSN
                    </p>
                    <p className="mt-2 text-[20px] font-semibold text-[#111433]">
                      2959-4812
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#1e2557]">
                Current Issue
              </p>

              <h3
                className="mt-3 text-[28px] font-semibold leading-tight text-[#111433]"
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                Vol. 3, Issue 1
              </h3>

              <p className="mt-1 text-[13px] text-slate-500">July 2025</p>

              <div className="mt-5 grid gap-3">
                <Link
                  href="/call-for-papers"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[#111433] px-5 text-[14px] font-medium text-white shadow-sm hover:bg-[#1e2557]"
                >
                  Call for Papers
                </Link>

                <Link
                  href="/for-authors/author-guidelines"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-[14px] font-medium text-[#111433] hover:border-[#22b8e8]/60 hover:text-[#1e2557]"
                >
                  Author Guidelines
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}