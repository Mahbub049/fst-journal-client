"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/common/Container";

const editors = [
  {
    id: "editor-1",
    name: "Professor Dr. Md. Mahbubur Rahman",
    role: "Executive Editor",
    org: "Faculty of Science & Technology, Bangladesh University of Professionals",
    initials: "MR",
  },
  {
    id: "editor-2",
    name: "Dr. Nusrat Jahan",
    role: "Associate Executive Editor",
    org: "Department of ICT, Bangladesh University of Professionals",
    initials: "NJ",
  },
  {
    id: "editor-3",
    name: "Dr. Tanvir Ahmed",
    role: "Executive Editor",
    org: "Department of Environmental Science, Bangladesh University of Professionals",
    initials: "TA",
  },
  {
    id: "editor-4",
    name: "Dr. Farhana Islam",
    role: "Editorial Board Member",
    org: "Department of Computer Science, Bangladesh University of Professionals",
    initials: "FI",
  },
  {
    id: "editor-5",
    name: "Dr. Arif Hossain",
    role: "Editorial Board Member",
    org: "Faculty of Science & Technology, Bangladesh University of Professionals",
    initials: "AH",
  },
  {
    id: "editor-6",
    name: "Dr. Sabrina Rahman",
    role: "Editorial Board Member",
    org: "Department of Environmental Science, Bangladesh University of Professionals",
    initials: "SR",
  },
];

export default function ExecutiveEditorsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const visibleCount = 3;
  const maxIndex = Math.max(0, editors.length - visibleCount);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(timer);
  }, [maxIndex]);

  return (
    <section className="border-y border-slate-200 bg-white py-12 md:py-14">
      <Container>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="journal-subheading">Editorial Leadership</p>

            <h2 className="journal-heading mt-3">Executive Editors</h2>

            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-600">
              The journal is guided by an academic editorial team responsible
              for maintaining publication quality and scholarly standards.
            </p>
          </div>

          <Link
            href="/editorial-board"
            className="inline-flex h-11 w-fit items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-[14px] font-medium text-slate-700 hover:border-[#22b8e8]/60 hover:text-[#22b8e8]"
          >
            View full editorial board
          </Link>
        </div>

        <div className="relative mt-8 overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${activeIndex * 33.3333}%)`,
            }}
          >
            {editors.map((editor) => (
              <div
                key={editor.id}
                className="w-full shrink-0 px-2 md:w-1/2 lg:w-1/3"
              >
                <article className="h-full rounded-3xl border border-slate-200 bg-[#fbfcfd] p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#111433] text-[14px] font-semibold text-white ring-2 ring-[#22b8e8]/30">
                      {editor.initials}
                    </div>

                    <div>
                      <h3 className="text-[16px] font-semibold text-slate-950">
                        {editor.name}
                      </h3>

                      <p className="mt-1 text-[13px] font-medium text-[#1e2557]">
                        {editor.role}
                      </p>

                      <p className="mt-3 text-[13px] leading-6 text-slate-600">
                        {editor.org}
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition-all ${
                activeIndex === index
                  ? "w-8 bg-[#111433]"
                  : "w-2.5 bg-slate-300 hover:bg-[#22b8e8]"
              }`}
              aria-label={`Go to editor slide ${index + 1}`}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}