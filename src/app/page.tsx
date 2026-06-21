import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";
import ArticlesSection from "@/components/home/ArticlesSection";
import ExecutiveEditorsSection from "@/components/home/ExecutiveEditorsSection";
import JournalInfoSidebar from "@/components/home/JournalInfoSidebar";
import OverviewSection from "@/components/home/OverviewSection";
import RecentIssuesSection from "@/components/home/RecentIssuesSection";
import { getServerApiBaseUrl } from "@/lib/apiBase";
import { PublicHomepageContent } from "@/services/publicHomepageService";
import { Article, Issue } from "@/types/issue";

export const dynamic = "force-dynamic";

const HOME_ISSUE_LIMIT = 3;

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

async function getHomepageData(): Promise<PublicHomepageContent | null> {
  const API_URL = getServerApiBaseUrl();

  const data = await fetchJson<{
    success: boolean;
    homepage: PublicHomepageContent;
  }>(`${API_URL}/homepage`);

  return data?.homepage || null;
}

async function getInitialArticles(): Promise<Article[]> {
  const API_URL = getServerApiBaseUrl();

  const data = await fetchJson<{
    success: boolean;
    data: Article[];
  }>(`${API_URL}/issues/articles/home?tab=latest`);

  return Array.isArray(data?.data) ? data.data : [];
}

async function getInitialRecentIssues(): Promise<Issue[]> {
  const API_URL = getServerApiBaseUrl();

  const data = await fetchJson<{
    success: boolean;
    data: Issue[];
  }>(`${API_URL}/issues/recent`);

  return Array.isArray(data?.data) ? data.data.slice(0, HOME_ISSUE_LIMIT) : [];
}

export default async function HomePage() {
  const [homepage, initialArticles, initialIssues] = await Promise.all([
    getHomepageData(),
    getInitialArticles(),
    getInitialRecentIssues(),
  ]);

  return (
    <PublicLayout homepage={homepage}>
      <main className="bg-[#f7f8fb]">
        <Container className="py-10 md:py-14">
          <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_390px]">
            <OverviewSection homepage={homepage} />

            <div className="self-start lg:sticky lg:top-[104px]">
              <JournalInfoSidebar homepage={homepage} />
            </div>
          </div>
        </Container>

        <ExecutiveEditorsSection homepage={homepage} />

        <Container className="space-y-10 py-10 md:py-14">
          <ArticlesSection
            homepage={homepage}
            initialArticles={initialArticles}
          />

          <RecentIssuesSection
            homepage={homepage}
            initialIssues={initialIssues}
          />
        </Container>
      </main>
    </PublicLayout>
  );
}