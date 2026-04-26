import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";

export default function ContactPage() {
  return (
    <PublicLayout>
      <main className="bg-[#f7f8fb]">
        <section className="border-b border-slate-200 bg-white">
          <Container className="py-12 md:py-16">
            <p className="journal-subheading">Contact</p>

            <h1
              className="mt-4 text-[40px] font-semibold leading-tight tracking-tight text-slate-950 md:text-[56px]"
              style={{ fontFamily: "var(--font-source-serif)" }}
            >
              Contact Us
            </h1>

            <p className="mt-5 max-w-3xl text-[16px] leading-8 text-slate-600">
              For journal-related queries, publication information, and author
              support, please contact the editorial office.
            </p>
          </Container>
        </section>

        <Container className="py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-8">
              <p className="journal-subheading">Editorial Office</p>

              <h2
                className="mt-3 text-[30px] font-semibold leading-tight text-slate-950"
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                BUP Faculty of Science & Technology Journal
              </h2>

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[13px] text-slate-500">Published By</p>
                  <p className="mt-2 text-[15px] font-medium leading-7 text-slate-900">
                    Faculty of Science & Technology
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[13px] text-slate-500">Institution</p>
                  <p className="mt-2 text-[15px] font-medium leading-7 text-slate-900">
                    Bangladesh University of Professionals
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[13px] text-slate-500">Address</p>
                  <p className="mt-2 text-[15px] font-medium leading-7 text-slate-900">
                    Mirpur Cantonment, Dhaka - 1216
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[13px] text-slate-500">Email</p>
                  <p className="mt-2 text-[15px] font-medium leading-7 text-slate-900">
                    editor.fstjournal@bup.edu.bd
                  </p>
                </div>
              </div>
            </section>

            <aside className="rounded-3xl border border-slate-200 bg-[#111433] p-7 text-white shadow-sm">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">
                Office Note
              </p>

              <h2
                className="mt-3 text-[30px] font-semibold leading-tight"
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                Author Support
              </h2>

              <p className="mt-4 text-[15px] leading-8 text-white/80">
                Authors are requested to review the submission guidelines before
                contacting the editorial office regarding manuscript preparation,
                formatting, or publication queries.
              </p>
            </aside>
          </div>
        </Container>
      </main>
    </PublicLayout>
  );
}