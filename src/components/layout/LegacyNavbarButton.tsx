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

  const isEnabled = Boolean(
    settings?.enabled && settings.label?.trim() && settings.url?.trim()
  );

  // Only when the optional old-site button is enabled, switch the desktop
  // navbar into a slightly wider/compact layout. This keeps the normal navbar
  // completely unchanged when the button is disabled, while preventing the
  // fixed-size logo from being squeezed into/under the Home link.
  useEffect(() => {
    const navbar = document.querySelector<HTMLElement>(".journal-navbar");
    if (!navbar) return;

    if (isEnabled) {
      navbar.classList.add("journal-navbar-has-old-site");
    } else {
      navbar.classList.remove("journal-navbar-has-old-site");
    }

    return () => {
      navbar.classList.remove("journal-navbar-has-old-site");
    };
  }, [isEnabled]);

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

  if (!isEnabled || !settings) {
    return null;
  }

  const target = settings.openInNewTab ? "_blank" : undefined;
  const rel = settings.openInNewTab ? "noopener noreferrer" : undefined;

  return (
    <>
      {/*
        The extra button needs more horizontal room than the standard navbar.
        These rules are intentionally scoped to journal-navbar-has-old-site, so
        disabling the button restores the original navbar design automatically.
      */}
      <style>{`
        @media (min-width: 1280px) {
          .journal-navbar-has-old-site > div {
            max-width: 1536px !important;
            padding-left: 20px !important;
            padding-right: 20px !important;
          }

          .journal-navbar-has-old-site nav {
            gap: 12px !important;
          }

          .journal-navbar-has-old-site nav > a:first-child {
            flex-shrink: 0 !important;
            min-width: 48px !important;
          }

          .journal-navbar-has-old-site .nav-link {
            padding-left: 9px !important;
            padding-right: 9px !important;
            white-space: nowrap;
          }

          .journal-navbar-has-old-site .journal-search-form {
            width: clamp(190px, 15vw, 230px) !important;
          }

          .journal-navbar-has-old-site .journal-cfp-button,
          .journal-navbar-has-old-site .journal-submit-button,
          .journal-navbar-has-old-site .journal-old-site-button {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }

        @media (min-width: 1280px) and (max-width: 1439px) {
          .journal-navbar-has-old-site .nav-link {
            padding-left: 7px !important;
            padding-right: 7px !important;
            font-size: 13px !important;
          }

          .journal-navbar-has-old-site .journal-search-form {
            width: 180px !important;
          }

          .journal-navbar-has-old-site .journal-cfp-button,
          .journal-navbar-has-old-site .journal-submit-button,
          .journal-navbar-has-old-site .journal-old-site-button {
            padding-left: 12px !important;
            padding-right: 12px !important;
            font-size: 13px !important;
          }
        }
      `}</style>

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
