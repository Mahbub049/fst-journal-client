import Container from "@/components/common/Container";
import JournalDropdownMenu from "@/components/common/JournalDropdownMenu";

export default function PublicNavbar() {
  return (
    <div className="bg-[#061f33] shadow-md">
      <Container>
        <nav className="flex h-[64px] items-center justify-between gap-5">
          <div className="flex h-full shrink-0 items-center">
            <a href="/" className="navLink navActive">Home</a>

            <JournalDropdownMenu label="About" items={[
              { label: "About the Journal", href: "/about/about-the-journal" },
              { label: "Aims & Scope", href: "/about/aims-scope" },
              { label: "Policies & Ethics", href: "/about/policies-ethics" },
              { label: "Open Access Statement", href: "/about/open-access-statement" },
              { label: "Abstracting & Indexing", href: "/about/abstracting-indexing" },
              { label: "Contact Us", href: "/contact" },
            ]} />

            <a href="/call-for-papers" className="navLink navCall">
              Call for Papers
            </a>

            <JournalDropdownMenu label="Issues" items={[
              { label: "Current Issue (Vol.12, No.3)", href: "/issues/current" },
              { label: "All Issues / Archive", href: "/issues/archive" },
              { label: "Special Issues", href: "/issues/special" },
              { label: "Most Cited", href: "/issues/most-cited" },
              { label: "Most Read", href: "/issues/most-read" },
            ]} />

            <JournalDropdownMenu label="For Authors" items={[
              { label: "Author Guidelines", href: "/for-authors/author-guidelines" },
              { label: "Submission Guidelines", href: "/for-authors/submission-guidelines" },
              { label: "Peer Review Process", href: "/for-authors/peer-review-process" },
              { label: "Article Processing Charge", href: "/for-authors/article-processing-charge" },
              { label: "Copyright & Licensing", href: "/for-authors/copyright-licensing" },
              { label: "Templates", href: "/for-authors/templates" },
            ]} />
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
            <form className="flex h-[40px] w-full max-w-[330px] overflow-hidden rounded-md border border-white/15 bg-white">
              <input
                placeholder="Search in this journal"
                className="min-w-0 flex-1 px-4 text-[13px] text-slate-700 outline-none"
              />
              <button
                type="submit"
                className="bg-[#0a7fa8] px-4 text-[12px] font-bold text-white hover:bg-[#08698b]"
              >
                Search
              </button>
            </form>

            <a
              href="/submit"
              className="flex h-[40px] shrink-0 items-center justify-center rounded-md bg-[#d7193f] px-5 text-[13px] font-bold text-white shadow-sm hover:bg-[#bb1535]"
            >
              Submit Manuscript
            </a>
          </div>
        </nav>
      </Container>

      <style>{`
        .navLink {
          height: 64px;
          display: flex;
          align-items: center;
          padding: 0 18px;
          color: white;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
          border-bottom: 3px solid transparent;
          transition: all 0.2s ease;
        }

        .navLink:hover {
          background: rgba(255,255,255,0.08);
          border-bottom-color: #d99a20;
        }

        .navActive {
          border-bottom-color: #d99a20;
        }

        .navCall {
          background: #15a6d4;
          border-bottom-color: #d99a20;
        }

        .navCall:hover {
          background: #0f91bb;
        }
      `}</style>
    </div>
  );
}