import Image from "next/image";
import Link from "next/link";
import Container from "@/components/common/Container";

export default function PublicFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#07162b] text-white">
      <div className="absolute inset-0 journal-dark-panel" />
      <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#0ea5b7]/10 blur-3xl" />
      <div className="absolute right-[-90px] bottom-[-120px] h-80 w-80 rounded-full bg-[#c7a159]/10 blur-3xl" />

      <Container className="relative py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-4">
              <Link href="/" className="flex min-w-0 items-center gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
                  <Image
                    src="/images/bup.png"
                    alt="Bangladesh University of Professionals"
                    fill
                    className="object-contain p-1"
                    priority
                  />
                </div>
              </Link>

              <div>
                <h3
                  className="text-[26px] font-semibold leading-none text-white"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  Journal of FST
                </h3>
                <p className="pt-1 text-[13px] font-medium text-white/60">
                  Bangladesh University of Professionals
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-md text-[15px] leading-7 text-white/66">
              A scholarly journal platform dedicated to publishing quality
              research in science, technology, engineering, and related
              interdisciplinary fields.
            </p>

            <div className="mt-6 rounded-3xl border border-white/12 bg-white/8 p-5 backdrop-blur-md">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#7de4ee]">
                Publisher
              </p>
              <p className="mt-2 text-[15px] font-bold text-white">
                Faculty of Science & Technology, BUP
              </p>
            </div>
          </div>

          <FooterColumn
            title="Journal"
            links={[
              ["About the Journal", "/about/about-the-journal"],
              ["Aims & Scope", "/about/aims-scope"],
              ["Editorial Board", "/editorial-board"],
              ["Contact", "/contact"],
            ]}
          />

          <FooterColumn
            title="For Authors"
            links={[
              ["Author Guidelines", "/for-authors/author-guidelines"],
              ["Submission Guidelines", "/for-authors/submission-guidelines"],
              ["Peer Review Process", "/for-authors/peer-review-process"],
              ["Templates", "/for-authors/templates"],
            ]}
          />

          <FooterColumn
            title="Browse"
            links={[
              ["Current Issue", "/issues/current"],
              ["Archive", "/issues/archive"],
              ["Most Cited", "/issues/most-cited"],
              ["Most Read", "/issues/most-read"],
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-[13px] text-white/52 md:flex-row md:items-center md:justify-between">
          <p>Copyright © 2026 Journal of FST. All rights reserved.</p>
          <p>Designed for academic publishing and research visibility.</p>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h4
        className="text-[21px] font-semibold text-white"
        style={{ fontFamily: "var(--font-source-serif)" }}
      >
        {title}
      </h4>
      <div className="mt-3 h-[3px] w-12 rounded-full bg-[#0ea5b7]" />
      <ul className="mt-5 space-y-3">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="footer-link">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
