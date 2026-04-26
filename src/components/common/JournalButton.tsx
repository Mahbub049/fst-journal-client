import Link from "next/link";
import { Button } from "@/components/ui/button";

type JournalButtonProps = {
  label: string;
  href?: string;
  variant?: "primary" | "secondary";
  type?: "button" | "submit";
};

export default function JournalButton({
  label,
  href,
  variant = "primary",
  type = "button",
}: JournalButtonProps) {
  const className =
    variant === "primary"
      ? "h-9 rounded-none bg-[#E5334F] px-4 text-[12px] font-bold text-white hover:bg-[#cc2d45]"
      : "h-9 rounded-none border border-[#003B5C] bg-white px-4 text-[12px] font-bold text-[#003B5C] hover:bg-slate-50";

  if (href) {
    return (
      <Button asChild className={className}>
        <Link href={href}>{label}</Link>
      </Button>
    );
  }

  return (
    <Button type={type} className={className}>
      {label}
    </Button>
  );
}