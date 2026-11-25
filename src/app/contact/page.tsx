import { MapPin, Navigation, ExternalLink } from "lucide-react";
import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";
import {
  ContactPageContent,
  getPublicContactPage,
  getContactMap,
} from "@/services/contactPageService";
import { buildGmailComposeUrl } from "@/lib/emailLinks";

export const dynamic = "force-dynamic";

const fallbackContact: ContactPageContent = {
  showEyebrow: true,
  eyebrow: "Contact",
  title: "Contact Us",
  subtitle: "Contact information for journal communication.",
  contentTitle: "Contact Us",
  contentHtml:
    "For journal-related communication, authors and readers may contact the editorial office through journal.fst@bup.edu.bd.",
  officeEyebrow: "Editorial Office",
  officeTitle: "Editorial Office",
  officeDescription:
    "For any queries regarding manuscript submission, processing, or publication requirements, please contact the Editorial Office.",
  publishedByLabel: "Published By",
  publishedBy: "Journal of Faculty of Science & Technology",
  institutionLabel: "Institution",
  institution: "Bangladesh University of Professionals",
  addressLabel: "Address",
  address: "Mirpur Cantonment, Dhaka - 1216",
  emailLabel: "Email",
  email: "editor.fstjournal@bup.edu.bd",
  phoneLabel: "Phone",
  phone: "",
  supportEyebrow: "Office Note",
  supportTitle: "Author Support",
  supportDescription:
    "For any queries regarding manuscript submission, processing, or publication requirements, please contact the Editorial Office.",
  supportEmail: "editor.fstjournal@bup.edu.bd",
  emailButtonLabel: "Email Editorial Office",
  emailSubject: "Journal of FST editorial office inquiry",
  showMap: true,
  mapTitle: "Find Us on the Map",
  mapQuery: "",
  mapEmbedUrl: "",
  mapHeight: 420,
  isPublished: true,
};

export default async function ContactPage() {
  let content = fallbackContact;

  try {
    content = { ...fallbackContact, ...(await getPublicContactPage()) };
  } catch {
    content = fallbackContact;
  }

  const details = [
    {
      label: content.publishedByLabel,
      value: content.publishedBy,
      type: "text",
    },
    {
      label: content.institutionLabel,
      value: content.institution,
      type: "text",
    },
    { label: content.addressLabel, value: content.address, type: "text" },
    { label: content.emailLabel, value: content.email, type: "email" },
    { label: content.phoneLabel, value: content.phone, type: "phone" },
  ].filter((item) => item.label.trim() && item.value.trim());

  const map = getContactMap(content);
  const gmailUrl = buildGmailComposeUrl(content.email, content.emailSubject);
  const supportEmail = content.supportEmail?.trim() || content.email.trim();
  const supportGmailUrl = buildGmailComposeUrl(supportEmail, content.emailSubject);

  return (
    <PublicLayout>
      <main className="bg-[#f7f8fb]">
        <section className="border-b border-slate-200 bg-white">
          <Container className="py-12 md:py-16">
            {content.showEyebrow !== false && content.eyebrow ? (
              <p className="journal-subheading">{content.eyebrow}</p>
            ) : null}

            {content.title ? (
              <h1
                className={`${content.showEyebrow !== false && content.eyebrow ? "mt-4" : "mt-0"} text-[40px] font-semibold leading-tight tracking-tight text-slate-950 md:text-[56px]`}
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                {content.title}
              </h1>
            ) : null}

            {content.subtitle ? (
              <p className="mt-5 max-w-4xl text-[16px] leading-8 text-slate-600">
                {content.subtitle}
              </p>
            ) : null}
          </Container>
        </section>

        <Container className="py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-8">
              {content.contentTitle || content.contentHtml ? (
                <div className="mb-8 border-b border-slate-200 pb-8">
                  {content.contentTitle ? (
                    <h2 className="text-xl font-bold text-slate-950">
                      {content.contentTitle}
                    </h2>
                  ) : null}
                  {content.contentHtml ? (
                    <div
                      className="cms-rich-text mt-4 text-[15px] leading-8 text-slate-600"
                      dangerouslySetInnerHTML={{ __html: content.contentHtml }}
                    />
                  ) : null}
                </div>
              ) : null}

              {content.officeEyebrow ? (
                <p className="journal-subheading">{content.officeEyebrow}</p>
              ) : null}

              {content.officeTitle ? (
                <h2
                  className="mt-3 text-[30px] font-semibold leading-tight text-slate-950"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  {content.officeTitle}
                </h2>
              ) : null}

              {content.officeDescription ? (
                <p className="mt-4 max-w-3xl text-[15px] leading-8 text-slate-600">
                  {content.officeDescription}
                </p>
              ) : null}

              {details.length ? (
                <div className="mt-7 grid gap-5 md:grid-cols-2">
                  {details.map((item) => (
                    <div
                      key={`${item.label}-${item.value}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <p className="text-[13px] text-slate-500">{item.label}</p>
                      {item.type === "email" ? (
                        <a
                          href={gmailUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 block break-words text-[15px] font-medium leading-7 text-slate-900 hover:text-[#005A78]"
                        >
                          {item.value}
                        </a>
                      ) : item.type === "phone" ? (
                        <a
                          href={`tel:${item.value}`}
                          className="mt-2 block text-[15px] font-medium leading-7 text-slate-900 hover:text-[#005A78]"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="mt-2 text-[15px] font-medium leading-7 text-slate-900">
                          {item.value}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <aside className="h-fit rounded-3xl border border-slate-200 bg-[#111433] p-7 text-white shadow-sm lg:sticky lg:top-[106px]">
              {content.supportEyebrow ? (
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">
                  {content.supportEyebrow}
                </p>
              ) : null}

              {content.supportTitle ? (
                <h2
                  className="mt-3 text-[30px] font-semibold leading-tight"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  {content.supportTitle}
                </h2>
              ) : null}

              {content.supportDescription ? (
                <p className="mt-4 text-[15px] leading-8 text-white/80">
                  {content.supportDescription}
                </p>
              ) : null}

              {supportEmail && content.emailButtonLabel ? (
                <a
                  href={supportGmailUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#111433] hover:bg-slate-100"
                >
                  {content.emailButtonLabel}
                </a>
              ) : null}
            </aside>
          </div>

          {content.showMap !== false ? (
            <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm" aria-label={content.mapTitle || "Campus location"}>
              <div className="flex flex-col gap-5 border-b border-slate-200 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#005A78]/10 text-[#005A78]">
                    <MapPin size={24} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="journal-subheading">Location</p>
                    {content.mapTitle ? (
                      <h2 className="mt-2 text-[26px] font-semibold leading-tight text-slate-950 md:text-[30px]" style={{ fontFamily: "var(--font-source-serif)" }}>
                        {content.mapTitle}
                      </h2>
                    ) : null}
                    <p className="mt-2 break-words text-[15px] leading-7 text-slate-600">
                      {map.query}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 lg:shrink-0">
                  <a href={map.directionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#005A78] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#00465e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005A78]">
                    <Navigation size={16} aria-hidden="true" /> Get Directions
                  </a>
                  <a href={map.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-[#005A78] transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005A78]">
                    Open in Google Maps <ExternalLink size={15} aria-hidden="true" />
                  </a>
                </div>
              </div>
              <div className="bg-slate-50">
                <iframe
                  title={`Google Maps — ${map.query}`}
                  src={map.embedUrl}
                  className="block w-full max-h-[380px] border-0 sm:max-h-none"
                  style={{ height: map.height }}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </section>
          ) : null}
        </Container>
      </main>
    </PublicLayout>
  );
}
