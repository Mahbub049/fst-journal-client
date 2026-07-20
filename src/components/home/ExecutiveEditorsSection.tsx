"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import Link from "next/link";
import Container from "@/components/common/Container";
import MotionSection from "@/components/common/MotionSection";
import { PublicHomepageContent } from "@/services/publicHomepageService";
import { getBrowserApiBaseUrl } from "@/lib/apiBase";

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

const API_BASE_URL = getBrowserApiBaseUrl();

function getInitials(name: string) {
  return name
    .replace(/Dr\.|Professor|Prof\.|Colonel|Brigadier General/gi, "")
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function isVisibleEditorialMember(member: EditorialBoardMember) {
  return member.isActive !== false;
}

function getEditorDisplayParts(editor: EditorialBoardMember) {
  const clean = (value?: string) => value?.trim() || "";

  const rawDesignation = clean(editor.designation);
  let designation = rawDesignation;
  let facultyOrDepartment = clean(editor.department);
  let institute = clean(editor.institution);

  // Handles old data like:
  // "Dean, Faculty of Science and Technology, Bangladesh University of Professionals"
  if (rawDesignation && (!facultyOrDepartment || !institute)) {
    const parts = rawDesignation
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length >= 3) {
      designation = parts[0];

      if (!facultyOrDepartment) {
        facultyOrDepartment = parts.slice(1, -1).join(", ");
      }

      if (!institute) {
        institute = parts[parts.length - 1];
      }
    } else if (parts.length === 2) {
      designation = parts[0];

      if (!facultyOrDepartment) {
        facultyOrDepartment = parts[1];
      }
    }
  }

  return {
    name: clean(editor.name),
    role: clean(editor.category) || "Editorial Member",
    designation,
    facultyOrDepartment,
    institute,
  };
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
  const [visibleCount, setVisibleCount] = useState(1);

  const dragStartXRef = useRef<number | null>(null);
  const dragLastXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const loadEditors = async () => {
      const data = await getEditorialBoardMembers();

      const executiveEditors = data
        .filter(isVisibleEditorialMember)
        .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));

      setEditors(executiveEditors);
    };

    loadEditors();
  }, []);

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth >= 1024) {
        setVisibleCount(3);
      } else if (window.innerWidth >= 768) {
        setVisibleCount(2);
      } else {
        setVisibleCount(1);
      }
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);

    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const maxIndex = useMemo(() => {
    return Math.max(0, editors.length - visibleCount);
  }, [editors.length, visibleCount]);

  const slideStep = 100 / visibleCount;

  const goToSlide = (index: number) => {
    setActiveIndex(Math.max(0, Math.min(maxIndex, index)));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (editors.length <= visibleCount) return;

    dragStartXRef.current = event.clientX;
    dragLastXRef.current = event.clientX;
    isDraggingRef.current = true;

    setIsDragging(true);
    setDragOffset(0);

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || dragStartXRef.current === null) return;

    const distance = event.clientX - dragStartXRef.current;

    dragLastXRef.current = event.clientX;
    setDragOffset(distance);
  };

  const handlePointerEnd = () => {
    if (!isDraggingRef.current || dragStartXRef.current === null) return;

    const dragDistance = dragLastXRef.current - dragStartXRef.current;

    if (Math.abs(dragDistance) > 45) {
      if (dragDistance < 0) {
        goToSlide(activeIndex + 1);
      } else {
        goToSlide(activeIndex - 1);
      }
    }

    dragStartXRef.current = null;
    dragLastXRef.current = 0;
    isDraggingRef.current = false;

    setDragOffset(0);
    setIsDragging(false);
  };

  useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (editors.length <= visibleCount) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        if (isDraggingRef.current) return prev;
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [editors.length, visibleCount, maxIndex]);

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

        <div
          className="relative -my-2 mt-8 cursor-grab touch-pan-y select-none overflow-hidden py-2 active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onPointerLeave={handlePointerEnd}
        >
          <div
            className={`flex ${isDragging ? "" : "transition-transform duration-700 ease-in-out"
              }`}
            style={{
              transform: `translateX(-${activeIndex * slideStep}%) translateX(${dragOffset}px)`,
            }}
          >
            {editors.map((editor) => {
              const display = getEditorDisplayParts(editor);

              return (
                <div
                  key={editor._id}
                  className="w-full shrink-0 px-2 md:w-1/2 lg:w-1/3"
                >
                  <article className="group relative h-full overflow-hidden rounded-3xl border border-white/12 bg-white/10 p-4 shadow-[0_22px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[#c7a159]/45 hover:bg-white/15">
                    <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#0ea5b7] via-[#c7a159] to-transparent opacity-80" />

                    <div className="flex h-full items-stretch gap-4">
                      <div className="w-[120px] shrink-0 self-stretch overflow-hidden rounded-2xl border border-white/15 bg-white/12 shadow-sm">
                        {editor.profileImage ? (
                          <img
                            src={editor.profileImage}
                            alt={display.name}
                            draggable={false}
                            className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#e6f7f9] text-[24px] font-black text-[#0b1f3a]">
                            {getInitials(display.name)}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 text-justify">
                        <h3 className="line-clamp-2 text-[16px] font-extrabold leading-[23px] text-white">
                          {display.name}
                        </h3>

                        <p className="mt-1 text-[12px] font-extrabold leading-5 text-[#e5c77d]">
                          {display.role}
                        </p>

                        <div className="mt-2 text-[13px] leading-5 text-white/72">
                          {display.designation ? (
                            <p
                              title={display.designation}
                              className="line-clamp-1 font-medium text-white/82"
                            >
                              {display.designation}
                            </p>
                          ) : null}

                          {(display.facultyOrDepartment || display.institute) ? (
                            <p
                              title={[display.facultyOrDepartment, display.institute]
                                .filter(Boolean)
                                .join(", ")}
                              className="mt-1 line-clamp-3 text-white/64"
                            >
                              {[display.facultyOrDepartment, display.institute]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>

        {editors.length > visibleCount ? (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${activeIndex === index
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