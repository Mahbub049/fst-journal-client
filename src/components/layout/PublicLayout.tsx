import { ReactNode } from "react";
import TopBreadcrumb from "./TopBreadcrumb";
import JournalHero from "./JournalHero";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      {/* <TopBreadcrumb items={["Home", "International Journal of Computer Vision"]} /> */}
      <JournalHero />
      <PublicNavbar />
      {children}
      <PublicFooter />
    </>
  );
}