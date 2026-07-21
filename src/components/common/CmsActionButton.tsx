import {
  ArrowRight,
  ArrowUpRight,
  Download,
  ExternalLink,
  FileCode2,
  FileText,
  Send,
} from "lucide-react";

export type CmsButtonIcon =
  | "none"
  | "download"
  | "pdf"
  | "latex"
  | "document"
  | "submit"
  | "external"
  | "arrow-right"
  | "arrow-up-right";

export type CmsButtonVariant = "primary" | "secondary" | "outline" | "light";

type CmsActionButtonProps = {
  label: string;
  url: string;
  icon?: CmsButtonIcon;
  variant?: CmsButtonVariant;
  openInNewTab?: boolean;
  darkBackground?: boolean;
  className?: string;
};

const iconMap = {
  download: Download,
  pdf: FileText,
  latex: FileCode2,
  document: FileText,
  submit: Send,
  external: ExternalLink,
  "arrow-right": ArrowRight,
  "arrow-up-right": ArrowUpRight,
} as const;

const variantClasses: Record<CmsButtonVariant, string> = {
  primary: "bg-[#111433] text-white hover:bg-[#1b204a]",
  secondary: "bg-[#005A78] text-white hover:bg-[#00465d]",
  outline:
    "border border-[#111433]/25 bg-transparent text-[#111433] hover:bg-[#111433]/5",
  light: "bg-white text-[#111433] hover:bg-slate-100",
};

export default function CmsActionButton({
  label,
  url,
  icon = "none",
  variant = "primary",
  openInNewTab,
  darkBackground = false,
  className = "",
}: CmsActionButtonProps) {
  if (!label.trim() || !url.trim()) return null;

  const Icon = icon === "none" ? null : iconMap[icon as keyof typeof iconMap];
  const shouldOpenInNewTab =
    openInNewTab ??
    (/^(https?:)?\/\//i.test(url) || url.toLowerCase().endsWith(".pdf"));

  const variantClass =
    darkBackground && variant === "outline"
      ? "border border-white/30 bg-transparent text-white hover:bg-white/10"
      : variantClasses[variant];

  return (
    <a
      href={url}
      target={shouldOpenInNewTab ? "_blank" : undefined}
      rel={shouldOpenInNewTab ? "noopener noreferrer" : undefined}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-center text-[13px] font-semibold leading-5 shadow-sm transition ${variantClass} ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
      <span>{label}</span>
    </a>
  );
}
