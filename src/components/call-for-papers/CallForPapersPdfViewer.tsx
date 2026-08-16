"use client";

import { useEffect, useMemo, useState } from "react";

type CallForPapersPdfViewerProps = {
  pdfUrl: string;
  pdfTitle: string;
  pdfSubtitle: string;
};

const PDF_VIEW_OPTIONS = "toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=page-width";

const getDirectPdfViewerSrc = (url: string) => {
  if (!url) return "";
  return `${url}${url.includes("#") ? "&" : "#"}${PDF_VIEW_OPTIONS}`;
};

const isLocalHost = (hostname: string) => {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname.endsWith(".local")
  );
};

const getAbsolutePdfUrl = (url: string) => {
  try {
    return new URL(url, window.location.href).toString();
  } catch {
    return url;
  }
};

const getMobilePdfViewerSrc = (url: string) => {
  const absolutePdfUrl = getAbsolutePdfUrl(url);
  return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
    absolutePdfUrl
  )}`;
};

export default function CallForPapersPdfViewer({
  pdfUrl,
  pdfTitle,
  pdfSubtitle,
}: CallForPapersPdfViewerProps) {
  const directPdfViewerSrc = useMemo(() => getDirectPdfViewerSrc(pdfUrl), [pdfUrl]);
  const [viewerSrc, setViewerSrc] = useState(directPdfViewerSrc);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const updateViewerSrc = () => {
      const shouldUseMobileViewer = mediaQuery.matches && !isLocalHost(window.location.hostname);
      setViewerSrc(shouldUseMobileViewer ? getMobilePdfViewerSrc(pdfUrl) : directPdfViewerSrc);
    };

    updateViewerSrc();
    mediaQuery.addEventListener("change", updateViewerSrc);

    return () => {
      mediaQuery.removeEventListener("change", updateViewerSrc);
    };
  }, [directPdfViewerSrc, pdfUrl]);

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-slate-900">
            {pdfTitle}
          </p>
          <p className="truncate text-[12px] text-slate-500">{pdfSubtitle}</p>
        </div>

        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full border border-slate-300 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-[#111433]/40 hover:text-[#111433] sm:px-4 sm:text-[12px]"
        >
          View Fullscreen
        </a>
      </div>

      <iframe
        key={viewerSrc}
        src={viewerSrc}
        title="Call for Papers PDF"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        className="block h-[76vh] min-h-[560px] w-full bg-white md:h-[720px] md:min-h-0"
      />
    </div>
  );
}
