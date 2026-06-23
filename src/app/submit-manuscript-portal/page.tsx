import type { Metadata } from "next";
import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";
import SubmissionPortalEmbed from "../../components/submission/SubmissionPortalEmbed";

export const metadata: Metadata = {
  title: "Submit Manuscript | Journal of FST",
  description:
    "Author login, registration, and password recovery access for Journal of FST manuscript submission.",
};

export default function SubmitManuscriptPortalPage() {
  return (
    <PublicLayout>
      <main className="bg-[linear-gradient(180deg,#f7f9fc_0%,#ffffff_100%)]">
        <Container className="py-4 md:py-6">
          <SubmissionPortalEmbed />
        </Container>
      </main>
    </PublicLayout>
  );
}
