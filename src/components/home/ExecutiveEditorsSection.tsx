"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Container from "@/components/common/Container";
import MotionSection from "@/components/common/MotionSection";
import { PublicHomepageContent } from "@/services/publicHomepageService";

type Props = {
  homepage?: PublicHomepageContent | null;
};

type EditorialBoardMember = {
  _id: string;
  category: string;
  editorialArea?: string;
  name: string;
  designation?: string;
  institution?: string;
  department?: string;
  profileImage?: string;
  order?: number;
  isActive?: boolean;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getInitials(name: string) {
  return name
    .replace(/Dr\.|Professor|Prof\./gi, "")
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function isExecutiveEditor(member: EditorialBoardMember) {
  const category = member.category?.toLowerCase() || "";
  const area = member.editorialArea?.toLowerCase() || "";

  return (
    category.includes("chief editor") ||
    category === "editor" ||
    category.includes("assistant editor") ||
    area.includes("journal leadership") ||
    area.includes("assistant editorial")
  );
}

async function getEditorialBoardMembers(): Promise<EditorialBoardMember[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/editorial-board`, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch executive editors:", error);
    return [];
  }
}

export default function ExecutiveEditorsSection({ homepage }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [editors, setEditors] = useState<EditorialBoardMember[]>([]);

  useEffect(() => {
    const loadEditors = async () => {
      const data = await getEditorialBoardMembers();

      const executiveEditors = data
        .filter(isExecutiveEditor)
        .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));

      setEditors(executiveEditors);
    };

    loadEditors();
  }, []);

  const visibleCount = 3;

  const maxIndex = useMemo(() => {
    return Math.max(0, editors.length - visibleCount);
  }, [editors.length]);

  useEffect(() => {
    if (editors.length <= visibleCount) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(timer);
  }, [editors.length, maxIndex]);

  if (editors.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden py-12 md:py-16">
      <div className="absolute inset-0 bg-[#07162b]" />
      <div className="absolute left-[-90px] top-[-120px] h-80 w-80 rounded-full bg-[#0ea5b7]/14 blur-3xl" />
      <div className="absolute right-[-100px] bottom-[-120px] h-80 w-80 rounded-full bg-[#c7a159]/12 blur-3xl" />

      <Container className="relative">
        <MotionSection>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[12px] font-extrabold uppercase tracking-[0.24em] text-white/66">
                Editorial Leadership
              </p>

              <h2
                className="mt-3 text-[34px] font-semibold text-white md:text-[42px]"
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                {homepage?.executiveEditorsTitle || "Executive Editors"}
              </h2>

              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-white/72">
                {homepage?.executiveEditorsSubtitle ||
                  "The journal is guided by an academic editorial team responsible for maintaining publication quality and scholarly standards."}
              </p>
            </div>

            <Link
              href="/editorial-board"
              className="inline-flex h-11 w-fit items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 text-[14px] font-bold text-white shadow-sm backdrop-blur-md hover:bg-white hover:text-[#07162b]"
            >
              View full editorial board
            </Link>
          </div>
        </MotionSection>

        <div className="relative mt-8 overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${activeIndex * 33.3333}%)`,
            }}
          >
            {editors.map((editor) => (
              <div
                key={editor._id}
                className="w-full shrink-0 px-2 md:w-1/2 lg:w-1/3"
              >
                <article className="h-full rounded-3xl border border-white/12 bg-white/10 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/15">
                  <div className="flex h-full items-stretch gap-5">
                    <div className="w-[124px] shrink-0 self-stretch overflow-hidden rounded-2xl border border-white/15 bg-white/12 shadow-sm">
                      {editor.profileImage ? (
                        <img
                          src={editor.profileImage}
                          alt={editor.name}
                          className="h-full w-full object-cover object-top"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#e6f7f9] text-[24px] font-black text-[#0b1f3a]">
                          {getInitials(editor.name)}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-[16px] font-bold leading-6 text-white">
                        {editor.name}
                      </h3>

                      <p className="mt-1 text-[13px] font-extrabold text-[#e5c77d]">
                        {editor.category}
                      </p>

                      <p className="mt-3 line-clamp-3 text-[13px] leading-6 text-white/70">
                        {[editor.designation, editor.department, editor.institution]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>

        {editors.length > visibleCount ? (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  activeIndex === index
                    ? "w-8 bg-[#c7a159]"
                    : "w-2.5 bg-white/28 hover:bg-[#0ea5b7]"
                }`}
                aria-label={`Go to editor slide ${index + 1}`}
              />
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
