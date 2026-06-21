import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f7f8fb]">
      <div className="h-1.5 w-full overflow-hidden bg-[#e6edf2]">
        <div className="h-full w-1/3 animate-[loadingBar_1.2s_ease-in-out_infinite] rounded-full bg-[#0b1f3a]" />
      </div>

      <div className="flex min-h-[calc(100vh-6px)] items-center justify-center px-5">
        <div className="w-full max-w-sm rounded-[2rem] border border-[#d9e4ea] bg-white p-8 text-center shadow-[0_22px_70px_rgba(11,31,58,0.10)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#d9e4ea] bg-[#f8fbfc] shadow-sm">
            <Image
              src="/images/bup.png"
              alt="BUP Logo"
              width={54}
              height={54}
              priority
              className="h-[54px] w-[54px] object-contain"
            />
          </div>

          <p className="mt-6 text-[12px] font-black uppercase tracking-[0.28em] text-[#0a7180]">
            Journal of FST
          </p>

          <h1
            className="mt-3 text-[26px] font-semibold text-[#0b1f3a]"
            style={{ fontFamily: "var(--font-source-serif)" }}
          >
            Loading journal content
          </h1>

          <p className="mt-3 text-[14px] leading-6 text-slate-500">
            Please wait while the latest journal information is being prepared.
          </p>

          <div className="mt-7 flex justify-center gap-2">
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#0b1f3a]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#0ea5b7] [animation-delay:120ms]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#c7a159] [animation-delay:240ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}