import { ReactNode } from "react";
import JournalHero from "./JournalHero";
import PublicNavbar, { type PublicNavbarInitialData } from "./PublicNavbar";
import { getServerApiBaseUrl } from "@/lib/apiBase";

async function loadNavbarData(): Promise<PublicNavbarInitialData | null> {
  const base = getServerApiBaseUrl();
  const fetchData = async (path: string) => {
    const response = await fetch(`${base}${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) throw new Error(`Navbar request failed: ${path}`);
    return response.json();
  };

  try {
    const [menuResponse, issueResponse, legacyResponse] = await Promise.all([
      fetchData("/menus"),
      fetchData("/issues/public/all"),
      fetchData("/site-settings/navbar-link"),
    ]);

    return {
      menus: Array.isArray(menuResponse?.menus) ? menuResponse.menus : [],
      issues: Array.isArray(issueResponse?.data) ? issueResponse.data : [],
      legacyLinkSettings: legacyResponse?.data || null,
    };
  } catch (error) {
    console.warn("Could not preload journal navbar:", error);
    return null;
  }
}
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

export default async function PublicLayout({
  children,
  homepage,
  showHero,
}: PublicLayoutProps) {
  const initialNavbarData = await loadNavbarData();
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
      <PublicNavbar initialData={initialNavbarData} />
      <SiteCelebration homepage={homepage} />
      <HomepageLaunchModal homepage={homepage} />
      {children}
      <PublicFooter />
    </>
  );
}
