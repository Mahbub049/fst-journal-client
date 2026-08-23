import { ReactNode } from "react";
import JournalHero from "./JournalHero";
import PublicNavbar from "./PublicNavbar";
import JournalAnnouncement from "./JournalAnnouncement";
import PublicFooter from "./PublicFooter";
import { PublicHomepageContent } from "@/services/publicHomepageService";

type PublicLayoutProps = {
  children: ReactNode;
  homepage?: PublicHomepageContent | null;
  showHero?: boolean;
};

export default function PublicLayout({
  children,
  homepage,
  showHero,
}: PublicLayoutProps) {
  /*
    Required behavior:
    - Desktop/tablet: show the journal hero on every public page.
    - Mobile: show the journal hero only on the homepage.

    The homepage passes the `homepage` prop. Inner pages do not pass it.
    So `homepage !== undefined` is used only for mobile visibility.
  */
  const isHomepage = homepage !== undefined;
  const showMobileHero = showHero === true || isHomepage;

  return (
    <>
      {/* Desktop/tablet: always show hero on all public pages */}
      <div className="hidden md:block">
        <JournalHero homepage={homepage} />
      </div>

      {/* Mobile: show hero only on homepage */}
      {showMobileHero ? (
        <div className="block md:hidden">
          <JournalHero homepage={homepage} />
        </div>
      ) : null}

      <JournalAnnouncement />
      <PublicNavbar />
      {children}
      <PublicFooter />
    </>
  );
}
