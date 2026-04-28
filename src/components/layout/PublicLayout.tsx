import { ReactNode } from "react";
import JournalHero from "./JournalHero";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";
import { PublicHomepageContent } from "@/services/publicHomepageService";

type PublicLayoutProps = {
  children: ReactNode;
  homepage?: PublicHomepageContent | null;
};

export default function PublicLayout({ children, homepage }: PublicLayoutProps) {
  return (
    <>
      <JournalHero homepage={homepage} />
      <PublicNavbar />
      {children}
      <PublicFooter />
    </>
  );
}