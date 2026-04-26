import Image from "next/image";
import Link from "next/link";
import Container from "@/components/common/Container";
import JournalDropdownMenu from "@/components/common/JournalDropdownMenu";

export default function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <Container>
        <nav className="flex min-h-[78px] items-center justify-between gap-6">
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
                BUP FST Journal
              </h2> */}

              {/* <p className="truncate pt-1 text-[13px] text-slate-500">
                Bangladesh University of Professionals
              </p> */}
            </div>
          </Link>

          <div className="hidden items-center gap-1 xl:flex">
            <Link href="/" className="nav-link">
              Home
            </Link>

            <JournalDropdownMenu
              label="About"
              items={[
                { label: "About the Journal", href: "/about/about-the-journal" },
                { label: "Aims & Scope", href: "/about/aims-scope" },
                { label: "Policies & Ethics", href: "/about/policies-ethics" },
                { label: "Open Access Statement", href: "/about/open-access-statement" },
                { label: "Abstracting & Indexing", href: "/about/abstracting-indexing" },
                { label: "Contact Us", href: "/contact" },
              ]}
            />

            <JournalDropdownMenu
              label="Issues"
              items={[
                { label: "Current Issue", href: "/issues/current" },
                { label: "All Issues / Archive", href: "/issues/archive" },
                { label: "Special Issues", href: "/issues/special" },
                { label: "Most Cited", href: "/issues/most-cited" },
                { label: "Most Read", href: "/issues/most-read" },
              ]}
            />

            <JournalDropdownMenu
              label="For Authors"
              items={[
                { label: "Author Guidelines", href: "/for-authors/author-guidelines" },
                { label: "Submission Guidelines", href: "/for-authors/submission-guidelines" },
                { label: "Peer Review Process", href: "/for-authors/peer-review-process" },
                { label: "Article Processing Charge", href: "/for-authors/article-processing-charge" },
                { label: "Copyright & Licensing", href: "/for-authors/copyright-licensing" },
                { label: "Templates", href: "/for-authors/templates" },
              ]}
            />

            <Link href="/editorial-board" className="nav-link">
              Editorial Board
            </Link>

<Link
  href="/call-for-papers"
  className="inline-flex items-center rounded-full border border-[#111433] bg-[#111433] px-4 py-2 text-[14px] font-semibold text-white hover:border-[#f5c84b] hover:bg-[#f5c84b] hover:text-[#111433]"
>
              Call for Papers
            </Link>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <form className="flex h-11 w-[250px] overflow-hidden rounded-full border border-slate-200 bg-slate-50 focus-within:border-[#22b8e8]">
              <input
                placeholder="Search journal"
                className="min-w-0 flex-1 bg-transparent px-4 text-[14px] text-slate-700 outline-none placeholder:text-slate-400"
              />

              <button
                type="submit"
                className="px-4 text-[13px] font-medium text-[#111433] hover:text-[#22b8e8]"
              >
                Search
              </button>
            </form>

            <Link
              href="/for-authors/submission-guidelines"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#111433] px-5 text-[14px] font-semibold text-white shadow-sm hover:bg-[#1e2557]"
            >
              Submit Manuscript
            </Link>
          </div>
        </nav>
      </Container>
    </header>
  );
}