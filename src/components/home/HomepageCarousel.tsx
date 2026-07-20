"use client";

import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  HomepageCarouselImage,
  PublicHomepageContent,
} from "@/services/publicHomepageService";

type Props = {
  homepage?: PublicHomepageContent | null;
};

const clampInterval = (value: unknown) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 5;
  return Math.min(Math.max(Math.round(numericValue), 2), 30);
};

export default function HomepageCarousel({ homepage }: Props) {
  const images = useMemo<HomepageCarouselImage[]>(() => {
    const activeImages = (homepage?.carouselImages || [])
      .filter((item) => item.isActive !== false && item.imageUrl?.trim())
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

    if (activeImages.length > 0) return activeImages;

    if (homepage?.journalCoverImage?.trim()) {
      return [
        {
          imageUrl: homepage.journalCoverImage,
          altText: homepage.heroTitle || "Journal of FST",
          order: 1,
          isActive: true,
        },
      ];
    }

    return [];
  }, [homepage]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const enabled = homepage?.carouselEnabled !== false;
  const intervalSeconds = clampInterval(homepage?.carouselIntervalSeconds);

  useEffect(() => {
    if (!enabled || paused || images.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, intervalSeconds * 1000);

    return () => window.clearInterval(timer);
  }, [enabled, images.length, intervalSeconds, paused]);

  if (!enabled) return null;

  const displayedIndex = images.length > 0 ? activeIndex % images.length : 0;

  const showNext = () => {
    if (images.length <= 1) return;
    setActiveIndex((current) => (current + 1) % images.length);
  };

  const showPrevious = () => {
    if (images.length <= 1) return;
    setActiveIndex((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  };

  return (
    <section
      className="group relative h-[190px] overflow-hidden bg-[#071d35] sm:h-[205px] lg:h-[195px]"
      aria-label="Journal image carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.length > 0 ? (
        images.map((image, index) => (
          <img
            key={`${image.imageUrl}-${index}`}
            src={image.imageUrl}
            alt={image.altText || `Journal carousel image ${index + 1}`}
            className={`absolute inset-0 h-full w-full object-cover transition duration-700 ease-out ${
              index === displayedIndex
                ? "scale-100 opacity-100"
                : "pointer-events-none scale-[1.035] opacity-0"
            }`}
          />
        ))
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_30%_20%,rgba(34,184,232,0.22),transparent_38%),linear-gradient(135deg,#071d35,#121942)] text-center text-white/75">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Images className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="text-sm font-semibold">Journal image gallery</p>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,29,53,0.04)_15%,rgba(7,29,53,0.62)_100%)]" />

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={showPrevious}
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#071d35]/65 text-white opacity-0 backdrop-blur-sm transition hover:bg-[#071d35]/90 group-hover:opacity-100 focus:opacity-100"
            aria-label="Previous carousel image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={showNext}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#071d35]/65 text-white opacity-0 backdrop-blur-sm transition hover:bg-[#071d35]/90 group-hover:opacity-100 focus:opacity-100"
            aria-label="Next carousel image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#071d35]/55 px-3 py-2 backdrop-blur-sm">
            {images.map((image, index) => (
              <button
                type="button"
                key={`${image.imageUrl}-dot-${index}`}
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === displayedIndex
                    ? "w-6 bg-[#f5c84b]"
                    : "w-2 bg-white/55 hover:bg-white"
                }`}
                aria-label={`Show carousel image ${index + 1}`}
                aria-current={index === displayedIndex ? "true" : undefined}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
