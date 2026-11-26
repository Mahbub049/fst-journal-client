import type { Metadata } from "next";
import PublicLayout from "@/components/layout/PublicLayout";
import Container from "@/components/common/Container";
import ArticleArchive from "@/components/articles/ArticleArchive";
import { getServerApiBaseUrl } from "@/lib/apiBase";
import { archiveApiPath, parseArchiveQuery, type ArchiveResult } from "@/lib/articleArchive";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Articles | Journal of FST",
  description: "Browse, search and discover research articles published in the Journal of FST.",
};

export default async function ArticlesPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === "string") params.set(key, value);
  }
  const query = parseArchiveQuery(params);
  let initialData: ArchiveResult | null = null;
  try {
    const response = await fetch(`${getServerApiBaseUrl()}${archiveApiPath(query)}`, {
      cache: "no-store", signal: AbortSignal.timeout(6000),
    });
    if (response.ok) {
      const json = await response.json();
      if (json.success) initialData = json.data;
    }
  } catch (error) {
    console.warn("Article archive preload failed:", error);
  }
  return (
    <PublicLayout>
      <main className="bg-[#f7f8fb]">
        <section className="border-b border-slate-200 bg-white">
          <Container className="py-12 md:py-16">
            <h1 className="text-[36px] font-semibold leading-tight tracking-tight text-slate-950 md:text-[56px]" style={{ fontFamily: "var(--font-source-serif)" }}>Articles</h1>
            <p className="mt-5 hyphens-auto text-justify text-[15px] leading-8 text-slate-600 [text-align-last:left] md:text-[16px]">Explore research published in the Journal of FST. Browse by issue, discover frequently read and cited papers, or search by article title and author.</p>
          </Container>
        </section>
        <Container className="py-6 md:py-10">
          <ArticleArchive initialQuery={query} initialData={initialData} />
        </Container>
      </main>
    </PublicLayout>
  );
}
