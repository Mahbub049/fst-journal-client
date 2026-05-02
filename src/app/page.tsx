"use client";

import { useEffect, useState } from "react";
import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";
import ArticlesSection from "@/components/home/ArticlesSection";
import ExecutiveEditorsSection from "@/components/home/ExecutiveEditorsSection";
import JournalInfoSidebar from "@/components/home/JournalInfoSidebar";
import OverviewSection from "@/components/home/OverviewSection";
import RecentIssuesSection from "@/components/home/RecentIssuesSection";
import {
  getPublicHomepage,
  PublicHomepageContent,
} from "@/services/publicHomepageService";

export default function HomePage() {
  const [homepage, setHomepage] = useState<PublicHomepageContent | null>(null);

  useEffect(() => {
    const loadHomepage = async () => {
      try {
        const data = await getPublicHomepage();
        setHomepage(data);
      } catch {
        setHomepage(null);
      }
    };

    loadHomepage();
  }, []);

  return (
    <PublicLayout homepage={homepage}>
      <main className="bg-[#f7f8fb]">
        <Container className="py-10 md:py-14">
          <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_390px]">
            <OverviewSection homepage={homepage} />

            {/*
              The sticky behavior belongs to this wrapper, not inside the card.
              This keeps the full Journal Information card visible while scrolling
              and prevents the card header from being clipped/hidden.
            */}
            <div className="self-start lg:sticky lg:top-[104px]">
              <JournalInfoSidebar homepage={homepage} />
            </div>
          </div>
        </Container>

        <ExecutiveEditorsSection homepage={homepage} />

        <Container className="space-y-10 py-10 md:py-14">
          <ArticlesSection homepage={homepage} />
          <RecentIssuesSection homepage={homepage} />
        </Container>
      </main>
    </PublicLayout>
  );
}
