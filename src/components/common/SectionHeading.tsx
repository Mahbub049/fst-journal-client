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
      <p className="journal-subheading">Journal Section</p>

      <h2
        className="mt-3 text-2xl font-semibold text-[#0b1f3a] md:text-3xl"
        style={{ fontFamily: "var(--font-source-serif)" }}
      >
        {title}
      </h2>

      <div className={`mt-4 h-[3px] w-20 rounded-full bg-[#c7a159] ${align === "center" ? "mx-auto" : ""}`} />

      {subtitle ? (
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
