import Image from "next/image";
import Link from "next/link";
import Container from "@/components/common/Container";

export default function PublicFooter() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-[#fbfcfd]">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-4">
              <Link href="/" className="flex min-w-0 items-center gap-4">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full  bg-white shadow-sm ">
                  <Image
                    src="/images/bup.png"
                    alt="Bangladesh University of Professionals"
                    fill
                    className="object-contain p-1"
                    priority
                  />
                </div>

                <div className="min-w-0">
                  {/* <h2
                className="truncate text-[22px] leading-none text-[#111433]"
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                Journal of FST
              </h2> */}

                  {/* <p className="truncate pt-1 text-[13px] text-slate-500">
                Bangladesh University of Professionals
              </p> */}
                </div>
              </Link>

              <div>
                <h3
                  className="text-[24px] leading-none text-slate-900"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  Journal of FST
                </h3>
                <p className="pt-1 text-[13px] text-slate-500">
                  Bangladesh University of Professionals
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-md text-[15px] leading-7 text-slate-600">
              A scholarly journal platform dedicated to publishing quality
              research in science, technology, engineering, and related
              interdisciplinary fields.
            </p>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Publisher
              </p>
              <p className="mt-2 text-[15px] font-medium text-slate-800">
                Faculty of Science & Technology, BUP
              </p>
            </div>
          </div>

          <div>
            <h4
              className="text-[20px] text-slate-900"
              style={{ fontFamily: "var(--font-source-serif)" }}
            >
              Journal
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/about/about-the-journal" className="footer-link">
                  About the Journal
                </Link>
              </li>
              <li>
                <Link href="/about/aims-scope" className="footer-link">
                  Aims & Scope
                </Link>
              </li>
              <li>
                <Link href="/editorial-board" className="footer-link">
                  Editorial Board
                </Link>
              </li>
              <li>
                <Link href="/contact" className="footer-link">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className="text-[20px] text-slate-900"
              style={{ fontFamily: "var(--font-source-serif)" }}
            >
              For Authors
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/for-authors/author-guidelines" className="footer-link">
                  Author Guidelines
                </Link>
              </li>
              <li>
                <Link href="/for-authors/submission-guidelines" className="footer-link">
                  Submission Guidelines
                </Link>
              </li>
              <li>
                <Link href="/for-authors/peer-review-process" className="footer-link">
                  Peer Review Process
                </Link>
              </li>
              <li>
                <Link href="/for-authors/templates" className="footer-link">
                  Templates
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className="text-[20px] text-slate-900"
              style={{ fontFamily: "var(--font-source-serif)" }}
            >
              Browse
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/issues/current" className="footer-link">
                  Current Issue
                </Link>
              </li>
              <li>
                <Link href="/issues/archive" className="footer-link">
                  Archive
                </Link>
              </li>
              <li>
                <Link href="/issues/most-cited" className="footer-link">
                  Most Cited
                </Link>
              </li>
              <li>
                <Link href="/issues/most-read" className="footer-link">
                  Most Read
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 text-[13px] text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>Copyright © 2026 Journal of FST. All rights reserved.</p>
          <p>Designed for academic publishing and research visibility.</p>
        </div>
      </Container>
    </footer>
  );
}