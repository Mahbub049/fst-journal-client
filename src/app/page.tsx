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
      <main className="bg-[#F3F5F7]">
        <Container className="py-6">
          <div className="grid gap-4 lg:grid-cols-[2.05fr_0.95fr]">
            <OverviewSection />
            <JournalInfoSidebar />
          </div>
        </Container>

        <ExecutiveEditorsSection />

        <Container className="py-6">
          <ArticlesSection />
        </Container>

        <Container className="pb-8">
          <RecentIssuesSection />
        </Container>
      </main>
    </PublicLayout>
  );
}