import Container from "@/components/common/Container";
import FooterBlock from "@/components/common/FooterBlock";

export default function PublicFooter() {
  return (
    <footer className="mt-16 bg-[#020739] py-12 text-white">
      <Container>
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-[18px] font-bold">
              Bangladesh University of Professionals
            </h3>
            <p className="mt-4 text-[12px] text-slate-300">
              BUP FST Journal public website footer block area.
            </p>
          </div>

          <FooterBlock
            title="For Authors"
            items={[
              { label: "Author Guidelines", href: "/for-authors/author-guidelines" },
              { label: "Submit Article", href: "/for-authors/submission-guidelines" },
            ]}
          />

          <FooterBlock
            title="Browse"
            items={[
              { label: "Browse Articles", href: "/issues/current" },
              { label: "Archive", href: "/issues/archive" },
            ]}
          />
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-[11px] text-slate-400">
          Copyright © 2025 BUP FST Journal. All Rights Reserved.
        </div>
      </Container>
    </footer>
  );
}