import { ReactNode } from "react";
import JournalHero from "./JournalHero";
import PublicNavbar from "./PublicNavbar";
import JournalAnnouncement from "./JournalAnnouncement";
import PublicFooter from "./PublicFooter";
import SiteCelebration from "./SiteCelebration";
import HomepageLaunchModal from "@/components/home/HomepageLaunchModal";
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
  const isHomepage = homepage !== undefined;
  const showMobileHero = showHero === true || isHomepage;

  return (
    <>
      <div className="hidden md:block">
        <JournalHero homepage={homepage} />
      </div>

      {showMobileHero ? (
        <div className="block md:hidden">
          <JournalHero homepage={homepage} />
        </div>
      ) : null}

      <JournalAnnouncement />
      <PublicNavbar />
      <SiteCelebration homepage={homepage} />
      <HomepageLaunchModal homepage={homepage} />
      {children}
      <PublicFooter />
    </>
  );
}
