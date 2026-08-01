import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";
import ArticlesSection from "@/components/home/ArticlesSection";
import ExecutiveEditorsSection from "@/components/home/ExecutiveEditorsSection";
import JournalInfoSidebar from "@/components/home/JournalInfoSidebar";
import HomepageCarousel from "@/components/home/HomepageCarousel";
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
          <div className="grid items-stretch overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.07)] lg:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.82fr)]">
            <OverviewSection homepage={homepage} />

            <div className="flex min-h-full flex-col border-t-0 lg:border-l lg:border-t-0">
              <HomepageCarousel homepage={homepage} />

              <div className="min-h-0 flex-1 border-t-0 md:border-t md:border-slate-200 md:first:border-t-0">
                <JournalInfoSidebar homepage={homepage} compact />
              </div>
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