import Link from "next/link";
import Container from "@/components/common/Container";

const editors = [
    {
        name: "Dr. Sergio Hoyos Calvo",
        role: "Executive Editor",
        org: "Polytechnic University of Valencia, Spain",
    },
    {
        name: "Assoc. Professor Modlij Karimimod",
        role: "Executive Editor",
        org: "Queen’s University Belfast, School of Natural and Built Environment",
    },
    {
        name: "Professor Shoulong Yi",
        role: "Executive Editor",
        org: "Sichuan University, Chengdu, Sichuan, China",
    },
];

export default function ExecutiveEditorsSection() {
    return (
        <section className="bg-[#B63B96] py-8 text-white">
            <Container>
                <div className="flex items-center gap-3">
                    <h2 className="text-[14px] font-bold">Executive Editors</h2>
                    <Link
                        href="/editorial-board"
                        className="text-[11px] text-white/80 underline-offset-2 hover:underline"
                    >
                        View full editorial board
                    </Link>
                </div>

                <div className="mt-8 grid gap-8 md:grid-cols-3">
                    {editors.map((editor) => (
                        <div key={editor.name} className="flex items-start gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-white/90"></div>

                            <div>
                                <h3 className="text-[13px] font-semibold">{editor.name}</h3>
                                <p className="mt-1 text-[12px] text-white/90">{editor.role}</p>
                                <p className="mt-2 text-[11px] leading-5 text-white/80">
                                    {editor.org}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex items-center justify-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-white/60"></span>
                    <span className="h-2 w-2 rounded-full bg-white"></span>
                    <span className="h-2 w-2 rounded-full bg-white/60"></span>
                    <span className="h-2 w-2 rounded-full bg-white/60"></span>
                </div>
            </Container>
        </section>
    );
}