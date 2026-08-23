"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  getPublicNavbarLegacyLinkSettings,
  NavbarLegacyLinkSettings,
} from "@/services/navbarLegacyLinkService";

type NavbarTarget = HTMLElement | null;

const isMobileMenuTarget = (element: HTMLElement) => {
  return (
    element.classList.contains("grid") &&
    element.classList.contains("gap-2") &&
    element.classList.contains("pr-1") &&
    element.parentElement?.classList.contains("xl:hidden")
  );
};

export default function LegacyNavbarButton() {
  const [settings, setSettings] = useState<NavbarLegacyLinkSettings | null>(null);
  const [desktopTarget, setDesktopTarget] = useState<NavbarTarget>(null);
  const [mobileTarget, setMobileTarget] = useState<NavbarTarget>(null);

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        const data = await getPublicNavbarLegacyLinkSettings();
        if (mounted) setSettings(data);
      } catch (error) {
        console.error("Navbar old website button settings fetch error:", error);
      }
    };

    void loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const navbar = document.querySelector<HTMLElement>(".journal-navbar");
    if (!navbar) return;

    let refreshTimer: number | null = null;

    const refreshTargets = () => {
      const desktopSearch = navbar.querySelector<HTMLElement>(
        ".journal-search-form"
      );
      const nextDesktopTarget = desktopSearch?.parentElement || null;

      if (desktopSearch) {
        desktopSearch.style.order = "0";
      }

      const desktopSubmit = nextDesktopTarget?.querySelector<HTMLElement>(
        ".journal-submit-button"
      );
      if (desktopSubmit) {
        desktopSubmit.style.order = "2";
      }

      const nextMobileTarget =
        Array.from(navbar.querySelectorAll<HTMLElement>("div")).find(
          isMobileMenuTarget
        ) || null;

      if (nextMobileTarget) {
        const directAnchors = Array.from(nextMobileTarget.children).filter(
          (child): child is HTMLAnchorElement =>
            child instanceof HTMLAnchorElement &&
            !child.classList.contains("journal-old-site-button")
        );

        const mobileSubmit = directAnchors[directAnchors.length - 1];
        if (mobileSubmit) {
          mobileSubmit.style.order = "2";
        }
      }

      setDesktopTarget((current) =>
        current === nextDesktopTarget ? current : nextDesktopTarget
      );
      setMobileTarget((current) =>
        current === nextMobileTarget ? current : nextMobileTarget
      );
    };

    const scheduleRefresh = () => {
      if (refreshTimer !== null) {
        window.clearTimeout(refreshTimer);
      }

      refreshTimer = window.setTimeout(refreshTargets, 25);
    };

    refreshTargets();

    const observer = new MutationObserver(scheduleRefresh);
    observer.observe(navbar, {
      childList: true,
      subtree: true,
    });

    window.addEventListener("resize", scheduleRefresh);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", scheduleRefresh);

      if (refreshTimer !== null) {
        window.clearTimeout(refreshTimer);
      }

      const desktopSearch = navbar.querySelector<HTMLElement>(
        ".journal-search-form"
      );
      const desktopSubmit = navbar.querySelector<HTMLElement>(
        ".journal-submit-button"
      );

      if (desktopSearch) desktopSearch.style.order = "";
      if (desktopSubmit) desktopSubmit.style.order = "";
    };
  }, []);

  const desktopOrder = useMemo(() => {
    if (settings?.position === "before-search") return -1;
    if (settings?.position === "after-submit") return 3;
    return 1;
  }, [settings?.position]);

  const mobileOrder = settings?.position === "after-submit" ? 3 : 1;

  if (!settings?.enabled || !settings.label?.trim() || !settings.url?.trim()) {
    return null;
  }

  const target = settings.openInNewTab ? "_blank" : undefined;
  const rel = settings.openInNewTab ? "noopener noreferrer" : undefined;

  return (
    <>
      {desktopTarget
        ? createPortal(
            <a
              href={settings.url}
              target={target}
              rel={rel}
              style={{ order: desktopOrder }}
              className="journal-old-site-button inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-slate-300 bg-white px-5 text-[14px] font-semibold text-[#111433] shadow-sm transition-all duration-300 hover:border-[#22b8e8] hover:bg-[#eef8fc] hover:text-[#087895]"
            >
              {settings.label}
            </a>,
            desktopTarget,
            "legacy-navbar-button-desktop"
          )
        : null}

      {mobileTarget
        ? createPortal(
            <a
              href={settings.url}
              target={target}
              rel={rel}
              style={{ order: mobileOrder }}
              onClick={() => {
                const menuButton = navbarMenuButton();
                if (menuButton?.getAttribute("aria-expanded") === "true") {
                  menuButton.click();
                }
              }}
              className="journal-old-site-button inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-[14px] font-extrabold text-[#111433] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#22b8e8] hover:bg-[#eef8fc] hover:text-[#087895] active:translate-y-0 active:scale-[0.99]"
            >
              {settings.label}
            </a>,
            mobileTarget,
            "legacy-navbar-button-mobile"
          )
        : null}
    </>
  );
}

function navbarMenuButton() {
  return Array.from(
    document.querySelectorAll<HTMLButtonElement>(".journal-navbar button")
  ).find((button) => button.getAttribute("aria-label") === "Toggle menu");
}
