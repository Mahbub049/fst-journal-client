import Link from "next/link";

type FooterItem = {
  label: string;
  href: string;
};

type FooterBlockProps = {
  title: string;
  items: FooterItem[];
};

export default function FooterBlock({ title, items }: FooterBlockProps) {
  return (
    <div>
      <h3 className="text-[16px] font-semibold text-white">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-[12px] text-slate-200 transition hover:text-white"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}