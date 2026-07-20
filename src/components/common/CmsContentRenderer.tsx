import type { CSSProperties, JSX } from "react";
import type { PublicContentBlock } from "@/services/publicPageService";

type CmsContentRendererProps = {
  blocks: PublicContentBlock[];
  variant?: "about" | "authors" | "contact";
};

const widthClasses: Record<string, string> = {
  full: "w-full",
  wide: "mx-auto w-full max-w-6xl",
  normal: "mx-auto w-full max-w-4xl",
  narrow: "mx-auto w-full max-w-2xl",
};

const paddingClasses: Record<string, string> = {
  none: "p-0",
  small: "p-3 md:p-4",
  medium: "p-5 md:p-7",
  large: "p-7 md:p-10",
};

const isHtml = (value?: string) => /<\/?[a-z][\s\S]*>/i.test(value || "");

function RichContent({ html }: { html?: string }) {
  if (!html) return null;

  if (isHtml(html)) {
    return (
      <div
        className="cms-rich-text text-[15px] leading-7 text-slate-600 md:text-[16px] md:leading-8"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {html
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((paragraph, index) => (
          <p
            key={index}
            className="text-[15px] leading-7 text-slate-600 md:text-[16px] md:leading-8"
          >
            {paragraph}
          </p>
        ))}
    </div>
  );
}

const getBlockTitleClass = (
  variant: "about" | "authors" | "contact",
  depth: number,
  marginClass = "mb-4"
) => {
  if (variant === "authors" && depth === 0) {
    return `${marginClass} text-[22px] font-semibold leading-tight text-slate-950 md:text-[28px]`;
  }

  return `${marginClass} text-xl font-bold text-slate-950`;
};

function Block({
  block,
  variant,
  depth,
}: {
  block: PublicContentBlock;
  variant: "about" | "authors" | "contact";
  depth: number;
}) {
  if (!block.isActive) return null;

  const style = block.style || {};
  const isAuthorTopLevel = variant === "authors" && depth === 0;
  const wrapperStyle = {
    backgroundColor: style.backgroundColor || undefined,
    color: style.textColor || undefined,
    textAlign: style.alignment || undefined,
  } as CSSProperties;
  const width = isAuthorTopLevel
    ? "w-full"
    : widthClasses[style.width || "normal"];
  const padding = paddingClasses[style.padding || "medium"];
  const children = [...(block.children || [])].sort(
    (a, b) => Number(a.order || 0) - Number(b.order || 0)
  );
  const cardShell =
    variant === "authors"
      ? "rounded-2xl border border-slate-200 bg-slate-50"
      : "rounded-2xl border border-slate-200 bg-white";

  if (block.type === "heading") {
    const level = Math.min(Math.max(Number(style.headingLevel || 2), 1), 6);
    const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
    return (
      <HeadingTag
        className={`${width} text-[24px] font-semibold leading-tight text-slate-950 md:text-[30px]`}
        style={{ ...wrapperStyle, fontFamily: "var(--font-source-serif)" }}
      >
        {block.title || block.content}
      </HeadingTag>
    );
  }

  if (block.type === "paragraph") {
    return (
      <div className={width} style={wrapperStyle}>
        {block.title && (
          <h3
            className={getBlockTitleClass(variant, depth, "mb-3")}
            style={
              isAuthorTopLevel
                ? { fontFamily: "var(--font-source-serif)" }
                : undefined
            }
          >
            {block.title}
          </h3>
        )}
        <RichContent html={block.content} />
      </div>
    );
  }

  if (block.type === "list") {
    return (
      <div className={width} style={wrapperStyle}>
        {block.title && (
          <h3
            className={getBlockTitleClass(variant, depth)}
            style={
              isAuthorTopLevel
                ? { fontFamily: "var(--font-source-serif)" }
                : undefined
            }
          >
            {block.title}
          </h3>
        )}
        <ul className="space-y-3 text-[15px] leading-7 text-slate-600 md:text-[16px] md:leading-8">
          {(block.items || []).map((item, index) => (
            <li key={`${item}-${index}`} className="flex gap-3 md:text-justify">
              <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-[#22b8e8]" />
              <span dangerouslySetInnerHTML={{ __html: item }} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (["card", "section", "notice"].includes(block.type)) {
    const noticeClass =
      block.type === "notice"
        ? style.variant === "warning"
          ? "border-amber-200 bg-amber-50"
          : style.variant === "success"
            ? "border-emerald-200 bg-emerald-50"
            : "border-cyan-200 bg-cyan-50"
        : cardShell;
    const containerClass =
      isAuthorTopLevel && block.type !== "notice"
        ? "w-full"
        : `${width} ${noticeClass} ${padding}`;

    return (
      <section className={containerClass} style={wrapperStyle}>
        {block.title && (
          <h3
            className={getBlockTitleClass(variant, depth, "mb-0")}
            style={
              isAuthorTopLevel
                ? { fontFamily: "var(--font-source-serif)" }
                : undefined
            }
          >
            {block.title}
          </h3>
        )}
        {block.content && (
          <div className={block.title ? "mt-4" : ""}>
            <RichContent html={block.content} />
          </div>
        )}
        {children.length > 0 && (
          <div className="mt-5 space-y-5">
            {children.map((child, index) => (
              <Block
                key={child._id || index}
                block={child}
                variant={variant}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  if (block.type === "columns") {
    const columnCount = Math.min(Math.max(Number(style.columns || 2), 1), 4);
    return (
      <section className={width} style={wrapperStyle}>
        {block.title && (
          <h3
            className={getBlockTitleClass(variant, depth, "mb-5")}
            style={
              isAuthorTopLevel
                ? { fontFamily: "var(--font-source-serif)" }
                : undefined
            }
          >
            {block.title}
          </h3>
        )}
        <div
          className={[
            "grid grid-cols-1 gap-5",
            columnCount === 2 ? "md:grid-cols-2" : "",
            columnCount === 3 ? "md:grid-cols-2 xl:grid-cols-3" : "",
            columnCount === 4 ? "md:grid-cols-2 xl:grid-cols-4" : "",
          ].join(" ")}
        >
          {children.map((child, index) => (
            <div key={child._id || index} className="min-w-0">
              <Block block={child} variant={variant} depth={depth + 1} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote
        className={`${width} rounded-2xl border-l-4 border-[#005A78] bg-slate-50 px-6 py-5 text-lg italic leading-8 text-slate-700`}
        style={wrapperStyle}
      >
        <RichContent html={block.content} />
        {block.title && (
          <footer className="mt-3 text-sm font-semibold not-italic">
            — {block.title}
          </footer>
        )}
      </blockquote>
    );
  }

  if (block.type === "image" && block.imageUrl) {
    return (
      <figure
        className={`${width} overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3`}
      >
        <img
          src={block.imageUrl}
          alt={block.altText || block.title || "Page image"}
          className="w-full rounded-xl object-cover"
        />
        {(block.caption || block.title) && (
          <figcaption className="mt-3 text-center text-sm text-slate-500">
            {block.caption || block.title}
          </figcaption>
        )}
      </figure>
    );
  }

  if (block.type === "pdf" && block.fileUrl) {
    return (
      <div className={width} style={wrapperStyle}>
        {block.title && (
          <h3
            className={getBlockTitleClass(variant, depth)}
            style={
              isAuthorTopLevel
                ? { fontFamily: "var(--font-source-serif)" }
                : undefined
            }
          >
            {block.title}
          </h3>
        )}
        <a
          href={block.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-[#111433] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1b204a]"
        >
          {block.buttonLabel || "Open Document"}
        </a>
      </div>
    );
  }

  if (block.type === "button" && block.buttonUrl) {
    const external = block.buttonUrl.startsWith("http");
    return (
      <div className={width} style={wrapperStyle}>
        <a
          href={block.buttonUrl}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          className="inline-flex items-center justify-center rounded-full bg-[#111433] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1b204a]"
        >
          {block.buttonLabel || block.title || "Learn More"}
        </a>
      </div>
    );
  }

  if (block.type === "video" && (block.fileUrl || block.buttonUrl)) {
    const source = block.fileUrl || block.buttonUrl || "";
    return (
      <div
        className={`${width} overflow-hidden rounded-2xl border border-slate-200 bg-black`}
      >
        <iframe
          src={source}
          title={block.title || "Embedded video"}
          className="aspect-video w-full"
          allowFullScreen
        />
      </div>
    );
  }

  if (block.type === "table") {
    return (
      <div
        className={`${width} overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4`}
        style={wrapperStyle}
      >
        {block.title && (
          <h3
            className={getBlockTitleClass(variant, depth)}
            style={
              isAuthorTopLevel
                ? { fontFamily: "var(--font-source-serif)" }
                : undefined
            }
          >
            {block.title}
          </h3>
        )}
        <div
          className="cms-table"
          dangerouslySetInnerHTML={{ __html: block.content || "" }}
        />
      </div>
    );
  }

  if (block.type === "code") {
    return (
      <div className={width} style={wrapperStyle}>
        {block.title && (
          <h3
            className={getBlockTitleClass(variant, depth, "mb-3")}
            style={
              isAuthorTopLevel
                ? { fontFamily: "var(--font-source-serif)" }
                : undefined
            }
          >
            {block.title}
          </h3>
        )}
        <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-5 text-sm leading-6 text-slate-100">
          <code data-language={block.codeLanguage || "text"}>{block.content}</code>
        </pre>
      </div>
    );
  }

  if (block.type === "divider") {
    return <hr className={`${width} border-slate-200`} />;
  }

  if (block.type === "spacer") {
    const size =
      style.padding === "large"
        ? "h-20"
        : style.padding === "small"
          ? "h-6"
          : "h-12";
    return <div className={size} aria-hidden="true" />;
  }

  return null;
}

export default function CmsContentRenderer({
  blocks,
  variant = "about",
}: CmsContentRendererProps) {
  const sorted = [...blocks]
    .filter((block) => block.isActive)
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

  return (
    <div className="space-y-5">
      {sorted.map((block, index) => {
        const renderedBlock = (
          <Block
            key={block._id || `${block.type}-${index}`}
            block={block}
            variant={variant}
            depth={0}
          />
        );

        if (variant !== "authors" || block.type === "spacer") {
          return renderedBlock;
        }

        const style = block.style || {};
        const width = widthClasses[style.width || "normal"];
        const padding = paddingClasses[style.padding || "medium"];
        const outerStyle = {
          backgroundColor: style.backgroundColor || undefined,
          color: style.textColor || undefined,
        } as CSSProperties;

        return (
          <article
            key={block._id || `${block.type}-${index}`}
            className={`${width} ${padding} rounded-3xl border border-slate-200 bg-white shadow-sm`}
            style={outerStyle}
          >
            {renderedBlock}
          </article>
        );
      })}
    </div>
  );
}
