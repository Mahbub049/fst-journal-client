type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
};

export default function SectionHeading({
  title,
  subtitle,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <h2 className="text-2xl font-bold text-[#003B5C] md:text-3xl">
        {title}
      </h2>

      <div className="mt-3 h-1 w-20 rounded bg-[#D6A63A]"></div>

      {subtitle ? (
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}