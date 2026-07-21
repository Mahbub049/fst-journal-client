"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
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
  expertise?: string[];
  bio?: string;
  biographyUrl?: string;
  biographyLabel?: string;
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

function getBiographyExcerpt(value?: string) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function getBiographyHref(editor: EditorialBoardMember) {
  return editor.biographyUrl?.trim() || `/editorial-board/${editor._id}`;
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

function getHomepageEditorialPriority(category?: string) {
  const normalized = String(category || "")
    .toLowerCase()
    .replace(/[^a-z]+/g, " ")
    .trim();

  if (normalized.includes("chief editor") || normalized.includes("editor in chief")) {
    return 0;
  }

  if (normalized === "editor" || normalized === "editors") {
    return 1;
  }

  if (
    normalized.includes("associate editor") ||
    normalized.includes("assistant editor")
  ) {
    return 2;
  }

  return 3;
}

function sortHomepageEditorialMembers(members: EditorialBoardMember[]) {
  return members
    .map((member, originalIndex) => ({ member, originalIndex }))
    .sort((a, b) => {
      const priorityA = getHomepageEditorialPriority(a.member.category);
      const priorityB = getHomepageEditorialPriority(b.member.category);

      if (priorityA !== priorityB) return priorityA - priorityB;

      if (priorityA === 3) return a.originalIndex - b.originalIndex;

      const orderA = Number(a.member.order ?? 0);
      const orderB = Number(b.member.order ?? 0);
      if (orderA !== orderB) return orderA - orderB;

      return a.originalIndex - b.originalIndex;
    })
    .map(({ member }) => member);
}

function getEditorDisplayParts(editor: EditorialBoardMember) {
  const clean = (value?: string) => value?.trim() || "";

  const rawDesignation = clean(editor.designation);
  let designation = rawDesignation;
  let facultyOrDepartment = clean(editor.department);
  let institute = clean(editor.institution);

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
  const [hoveredEditorId, setHoveredEditorId] = useState<string | null>(null);

  const dragStartXRef = useRef<number | null>(null);
  const dragLastXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const isCardHoveredRef = useRef(false);

  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const loadEditors = async () => {
      const data = await getEditorialBoardMembers();
      setEditors(sortHomepageEditorialMembers(data.filter(isVisibleEditorialMember)));
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

  const maxIndex = useMemo(
    () => Math.max(0, editors.length - visibleCount),
    [editors.length, visibleCount],
  );

  const slideStep = 100 / visibleCount;
  const currentIndex = Math.min(activeIndex, maxIndex);
  const hoveredEditorIndex = useMemo(
    () => editors.findIndex((editor) => editor._id === hoveredEditorId),
    [editors, hoveredEditorId],
  );
  const showBiographyPreview =
    homepage?.executiveEditorsShowBiographyPreview === true;

  const goToSlide = (index: number) => {
    setActiveIndex(Math.max(0, Math.min(maxIndex, index)));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (editors.length <= visibleCount || event.button !== 0) return;

    const target = event.target as HTMLElement;
    if (target.closest("a, button")) return;

    dragStartXRef.current = event.clientX;
    dragLastXRef.current = event.clientX;
    dragMovedRef.current = false;
    isDraggingRef.current = true;

    // Keep the profile open for an ordinary click. It is closed only after
    // the pointer has moved far enough to confirm an intentional swipe.
    setIsDragging(true);
    setDragOffset(0);

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || dragStartXRef.current === null) return;

    const distance = event.clientX - dragStartXRef.current;
    dragLastXRef.current = event.clientX;

    if (Math.abs(distance) > 6) {
      dragMovedRef.current = true;
      isCardHoveredRef.current = false;
      setHoveredEditorId(null);
    }

    setDragOffset(distance);
  };

  const handlePointerEnd = () => {
    if (!isDraggingRef.current || dragStartXRef.current === null) return;

    const dragDistance = dragLastXRef.current - dragStartXRef.current;

    if (Math.abs(dragDistance) > 45) {
      goToSlide(dragDistance < 0 ? currentIndex + 1 : currentIndex - 1);
    }

    dragStartXRef.current = null;
    dragLastXRef.current = 0;
    isDraggingRef.current = false;

    setDragOffset(0);
    setIsDragging(false);

    // Keep hover disabled until the pointer-up event has completely settled.
    // This prevents a profile from flashing open at the end of a swipe.
    window.requestAnimationFrame(() => {
      dragMovedRef.current = false;
    });
  };

  useEffect(() => {
    if (editors.length <= visibleCount) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => {
        if (isDraggingRef.current || isCardHoveredRef.current) return prev;
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 3000);

    return () => window.clearInterval(timer);
  }, [editors.length, visibleCount, maxIndex]);

  if (editors.length === 0) {
    return null;
  }

  const showExpandedCard = (editorId: string) => {
    if (isDraggingRef.current || dragMovedRef.current) return;

    isCardHoveredRef.current = true;
    setHoveredEditorId(editorId);
  };

  const hideExpandedCard = (editorId: string) => {
    setHoveredEditorId((current) => {
      if (current !== editorId) return current;
      isCardHoveredRef.current = false;
      return null;
    });
  };

  const hoveredVisibleSlot = hoveredEditorIndex - currentIndex;

  const getNeighbourOffset = (editorIndex: number) => {
    if (hoveredEditorIndex < 0 || visibleCount < 2) return 0;

    const editorVisibleSlot = editorIndex - currentIndex;
    const isVisibleEditor =
      editorVisibleSlot >= 0 && editorVisibleSlot < visibleCount;

    if (!isVisibleEditor || editorIndex === hoveredEditorIndex) return 0;

    // The expanded desktop card is exactly 48px wider than the normal card.
    // Moving edge groups by 48px and middle neighbours by 24px preserves the
    // original 16px card gap without creating the large empty spaces seen in
    // the previous version.
    if (visibleCount >= 3) {
      if (hoveredVisibleSlot <= 0) {
        return editorVisibleSlot > hoveredVisibleSlot ? 48 : 0;
      }

      if (hoveredVisibleSlot >= visibleCount - 1) {
        return editorVisibleSlot < hoveredVisibleSlot ? -48 : 0;
      }

      return editorVisibleSlot < hoveredVisibleSlot ? -24 : 24;
    }

    // At the two-column breakpoint the expanded card is 32px wider.
    return editorIndex < hoveredEditorIndex ? -32 : 32;
  };

  return (
    <section className="relative overflow-x-clip overflow-y-visible py-12 md:py-16 lg:h-[556px]">
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
              className="inline-flex h-11 w-fit items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 text-[14px] font-bold text-white shadow-sm backdrop-blur-md transition-colors duration-300 hover:bg-white hover:text-[#07162b]"
            >
              View full editorial board
            </Link>
          </div>
        </MotionSection>

        <div
          className={`relative -my-3 mt-8 cursor-grab touch-pan-y select-none overflow-x-clip overflow-y-visible py-3 active:cursor-grabbing ${
            hoveredEditorId
              ? "md:-mx-8 md:px-8 lg:-mx-12 lg:px-12"
              : ""
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onPointerLeave={handlePointerEnd}
        >
          <div
            className={`flex ${
              isDragging
                ? ""
                : "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            }`}
            style={{
              transform: `translateX(-${currentIndex * slideStep}%) translateX(${dragOffset}px)`,
            }}
          >
            {editors.map((editor, editorIndex) => {
              const display = getEditorDisplayParts(editor);
              const biographyExcerpt = getBiographyExcerpt(editor.bio);
              const biographyHref = getBiographyHref(editor);
              const biographyIsExternal = isExternalHref(biographyHref);
              const isExpanded = hoveredEditorId === editor._id;
              const visibleSlot = editorIndex - currentIndex;
              const isInCurrentWindow =
                visibleSlot >= 0 && visibleSlot < visibleCount;
              const expandedAlignment =
                visibleSlot <= 0
                  ? "left-2"
                  : visibleSlot >= visibleCount - 1
                    ? "right-2"
                    : "left-1/2 -translate-x-1/2";
              const expandedOrigin =
                visibleSlot <= 0
                  ? "origin-left"
                  : visibleSlot >= visibleCount - 1
                    ? "origin-right"
                    : "origin-center";
              const suppressOffscreenCard =
                Boolean(hoveredEditorId) && !isInCurrentWindow;

              return (
                <motion.div
                  key={editor._id}
                  animate={{
                    x: getNeighbourOffset(editorIndex),
                  }}
                  transition={{
                    x: {
                      duration: 0.24,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  }}
                  style={{
                    zIndex: isExpanded ? 40 : 1,
                    pointerEvents:
                      hoveredEditorId && !isInCurrentWindow ? "none" : "auto",
                  }}
                  className="relative flex w-full shrink-0 px-2 md:w-1/2 lg:w-1/3"
                  onMouseEnter={() => showExpandedCard(editor._id)}
                  onMouseLeave={() => hideExpandedCard(editor._id)}
                  onFocusCapture={() => showExpandedCard(editor._id)}
                  onBlurCapture={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      hideExpandedCard(editor._id);
                    }
                  }}
                >
                  {suppressOffscreenCard ? null : (
                    <>
                      <motion.article
                        tabIndex={0}
                        aria-label={`${display.name} editorial profile`}
                        className="group relative h-full w-full overflow-hidden rounded-3xl border border-white/12 bg-white/10 p-4 shadow-[0_22px_70px_rgba(0,0,0,0.22)] outline-none backdrop-blur-xl transition-[border-color,background-color] duration-300 hover:border-[#c7a159]/45 hover:bg-white/15"
                      >
                    <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#0ea5b7] via-[#c7a159] to-transparent opacity-80" />

                    <div className="flex h-full min-w-0 items-stretch gap-4">
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

                      <div className="min-w-0 flex-1 text-left">
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

                          {display.facultyOrDepartment || display.institute ? (
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
                  </motion.article>

                      <AnimatePresence>
                        {isExpanded ? (
                          <motion.div
                            key={`expanded-${editor._id}`}
                            initial={{ opacity: 0, scale: 0.985 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.985 }}
                            transition={{
                              duration: 0.24,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className={`absolute top-1/2 z-50 w-[calc(100%-16px)] max-w-[calc(100vw-28px)] -translate-y-1/2 md:w-[calc(100%+16px)] lg:w-[calc(100%+32px)] ${expandedAlignment} ${expandedOrigin}`}
                          >
                            <motion.article
                              role="dialog"
                              aria-label={`Expanded profile for ${display.name}`}
                          className="relative overflow-hidden rounded-[24px] border border-[#c7a159]/50 bg-[linear-gradient(145deg,rgba(27,54,81,0.995),rgba(12,31,53,0.998))] shadow-[0_8px_22px_rgba(0,0,0,0.22)] backdrop-blur-2xl"
                        >
                          <div className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-[#20b7c8] via-[#e4bd67] to-[#20b7c8]" />

                          <div className="grid min-h-[258px] grid-cols-[146px_minmax(0,1fr)] items-stretch gap-4 p-4">
                            <div
                              className={`self-stretch overflow-hidden rounded-[18px] border border-white/16 bg-white/10 shadow-sm ${
                                showBiographyPreview && biographyExcerpt
                                  ? "min-h-[252px]"
                                  : "min-h-[226px]"
                              }`}
                            >
                              {editor.profileImage ? (
                                <img
                                  src={editor.profileImage}
                                  alt={display.name}
                                  draggable={false}
                                  className="h-full w-full object-cover object-top"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[#e6f7f9] text-[32px] font-black text-[#0b1f3a]">
                                  {getInitials(display.name)}
                                </div>
                              )}
                            </div>

                            <div className="flex min-w-0 flex-col py-1 text-left">
                              <div>
                                <h3 className="text-[19px] font-extrabold leading-[25px] text-white">
                                  {display.name}
                                </h3>
                                <p className="mt-1.5 text-[12px] font-extrabold leading-5 text-[#e7c875]">
                                  {display.role}
                                </p>

                                {display.designation ? (
                                  <p className="mt-2.5 text-[13px] font-semibold leading-5 text-white/88">
                                    {display.designation}
                                  </p>
                                ) : null}

                                {display.facultyOrDepartment || display.institute ? (
                                  <p className="mt-1.5 text-[12px] leading-[18px] text-white/66">
                                    {[display.facultyOrDepartment, display.institute]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </p>
                                ) : null}
                              </div>

                              {showBiographyPreview && biographyExcerpt ? (
                                <div className="mt-3">
                                  <p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-white/50">
                                    Biography
                                  </p>
                                  <p className="mt-1.5 line-clamp-3 text-[12px] leading-[18px] text-white/70">
                                    {biographyExcerpt}
                                  </p>
                                </div>
                              ) : null}

                              <div className="mt-auto pt-4 text-left">
                                <Link
                                  href={biographyHref}
                                  target={biographyIsExternal ? "_blank" : undefined}
                                  rel={
                                    biographyIsExternal
                                      ? "noopener noreferrer"
                                      : undefined
                                  }
                                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#efd783]/80 bg-[linear-gradient(135deg,#f1d983_0%,#d0a94e_100%)] px-4 text-[11px] font-extrabold text-[#07162b] shadow-[0_7px_18px_rgba(199,161,89,0.22)] transition-[transform,filter,box-shadow] duration-300 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_10px_24px_rgba(199,161,89,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1d983]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#102d49]"
                                >
                                  {editor.biographyLabel?.trim() ||
                                    "View Full Biography"}
                                  <ArrowUpRight size={14} strokeWidth={2.2} />
                                </Link>
                              </div>
                            </div>
                          </div>
                            </motion.article>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </>
                  )}
                </motion.div>
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
                className={`h-2.5 cursor-pointer rounded-full transition-all duration-300 ${
                  currentIndex === index
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
