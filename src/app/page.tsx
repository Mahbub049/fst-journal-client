import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";
import ArticlesSection from "@/components/home/ArticlesSection";
import ExecutiveEditorsSection from "@/components/home/ExecutiveEditorsSection";
import JournalInfoSidebar from "@/components/home/JournalInfoSidebar";
import OverviewSection from "@/components/home/OverviewSection";
import RecentIssuesSection from "@/components/home/RecentIssuesSection";

export default function HomePage() {
  return (
    <PublicLayout>
      <main className="bg-[#f7f8fb]">
        <Container className="py-10 md:py-14">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_390px]">
            <OverviewSection />
            <JournalInfoSidebar />
          </div>
        </Container>

        <ExecutiveEditorsSection />

        <Container className="space-y-10 py-10 md:py-14">
          <ArticlesSection />
          <RecentIssuesSection />
        </Container>
      </main>
    </PublicLayout>
  );
}