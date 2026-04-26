import Container from "@/components/common/Container";
import PublicLayout from "@/components/layout/PublicLayout";
import Image from "next/image";

export default function CallForPapersPage() {
    return (
        <PublicLayout>
            <main className="bg-white py-8">
                <Container>
                    <div className="space-y-6">
                        <div className="bg-[#1E1A8A] px-4 py-2">
                            <h1 className="text-[24px] font-bold text-white">
                                Call for Papers
                            </h1>
                        </div>

                        <p className="text-[14px] font-medium text-slate-700">
                            JIBS invites you to consider publishing your future research in our
                            upcoming issues by 30th June, 2026.
                        </p>

                        <div className="grid gap-6 lg:grid-cols-[2.1fr_0.9fr]">
                            <div className="overflow-hidden border border-slate-300 bg-white">
                                <iframe
                                    src="/pdfs/call-for-papers.pdf"
                                    title="Call for Papers PDF"
                                    className="lg:h-full h-[900px] w-full"
                                />
                            </div>

                            <aside className="space-y-4">
                                <div className="rounded-sm border border-slate-300 bg-[#F8F8F8] p-4">
                                    <h2 className="text-[16px] font-bold text-slate-900">
                                        Important Dates
                                    </h2>

                                    <div className="mt-4 space-y-4 text-[13px] text-slate-700">
                                        <div>
                                            <p className="font-semibold">Submission Deadline:</p>
                                            <p>30 June 2026</p>
                                        </div>

                                        <div>
                                            <p className="font-semibold">Expected Publication:</p>
                                            <p>31 October 2026</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-sm border border-slate-300 bg-[#F8F8F8] p-4">
                                    <h2 className="text-[16px] font-bold text-slate-900">
                                        Submission Portal
                                    </h2>

                                    <button className="mt-4 w-full bg-[#1E1A8A] px-4 py-2 text-[13px] font-bold text-white">
                                        Submit Your Paper
                                    </button>

                                    <p className="mt-4 text-[12px] leading-6 text-slate-600">
                                        All submissions undergo a double-blind peer review process
                                        and must follow the journal’s author guidelines.
                                    </p>
                                </div>

                                <div className="rounded-sm border border-slate-300 bg-[#F8F8F8] p-4">
                                    <button className="w-full bg-[#25A9D6] px-4 py-2 text-[13px] font-bold text-white">
                                        Advertise in this journal
                                    </button>

                                    <div className="mt-4 border border-slate-300 bg-white p-2">
                                        <Image
                                            src="/images/call-for-papers-poster.jpg"
                                            alt="Call for Papers Poster"
                                            width={300}
                                            height={420}
                                            className="h-auto w-full"
                                        />
                                    </div>
                                </div>

                                <div className="rounded-sm border border-slate-300 bg-[#F8F8F8] p-4">
                                    <h2 className="text-[22px] font-bold text-slate-900">
                                        Contact Us
                                    </h2>

                                    <div className="mt-4 space-y-3 text-[13px] leading-6 text-slate-700">
                                        <p>
                                            <span className="font-semibold">Published By</span>
                                            <br />
                                            Faculty of Business Studies
                                        </p>

                                        <p>Bangladesh University of Professionals</p>
                                        <p>Mirpur Cantonment, Dhaka - 1216</p>
                                        <p>Telephone: +8809666790799</p>
                                        <p>Fax: +88-02-223371379</p>
                                        <p>Email: editor.jibs@bup.edu.bd</p>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </Container>
            </main>
        </PublicLayout>
    );
}