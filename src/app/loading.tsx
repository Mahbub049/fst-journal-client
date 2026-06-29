import Image from "next/image";

export default function Loading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07162d] px-6">
      <div className="journal-loading-bg absolute inset-0" />

      <div className="absolute inset-x-0 top-0 h-[3px] overflow-hidden bg-white/10">
        <div className="h-full w-1/3 animate-[loadingBar_1.35s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-transparent via-[#7de4ee] to-transparent" />
      </div>

      <section className="relative w-full max-w-[380px] rounded-[2rem] border border-white/15 bg-white/[0.08] p-[1px] shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
        <div className="rounded-[calc(2rem-1px)] bg-[#07162d]/75 px-8 py-9 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="relative mx-auto h-[96px] w-[96px]">
            <div className="absolute inset-0 animate-[journalSealPulse_1.8s_ease-in-out_infinite] rounded-full border border-[#7de4ee]/35" />

            <div className="absolute inset-[9px] flex items-center justify-center rounded-full border border-white/20 bg-white shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
              <Image
                src="/images/bup.png"
                alt="BUP Logo"
                width={58}
                height={58}
                priority
                className="h-[58px] w-[58px] object-contain"
              />
            </div>
          </div>

          <p className="mt-7 text-[11px] font-black uppercase tracking-[0.36em] text-[#7de4ee]">
            Journal of FST
          </p>

          <h1
            className="mt-3 text-[29px] font-semibold leading-tight text-white"
            style={{ fontFamily: "var(--font-source-serif)" }}
          >
            Preparing page
          </h1>

          <div className="mx-auto mt-5 h-px w-28 bg-gradient-to-r from-transparent via-[#f5c84b] to-transparent" />

          <div className="mx-auto mt-7 h-1.5 w-44 overflow-hidden rounded-full bg-white/12">
            <div className="h-full w-1/2 animate-[journalLoadingSlide_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-[#7de4ee] via-white to-[#f5c84b]" />
          </div>

          <span className="sr-only">Loading journal page</span>
        </div>
      </section>
    </main>
  );
}