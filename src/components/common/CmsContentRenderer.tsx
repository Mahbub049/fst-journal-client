import type { CSSProperties, JSX, ReactNode } from "react";
import CmsActionButton, {
  CmsButtonIcon,
  CmsButtonVariant,
} from "@/components/common/CmsActionButton";
import type {
  CmsButtonLayout,
  PublicContentBlock,
} from "@/services/publicPageService";

type PageAction = {
  label?: string;
  url?: string;
  show?: boolean;
  icon?: CmsButtonIcon;
  variant?: CmsButtonVariant;
  openInNewTab?: boolean;
};

type CmsContentRendererProps = {
  blocks: PublicContentBlock[];
  variant?: "about" | "authors" | "contact";
  pageAction?: PageAction;
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

const getBodyTextClass = (variant: "about" | "authors" | "contact") =>
  variant === "contact" ? "text-slate-600" : "text-[#111111]";

function RichContent({
  html,
  variant,
}: {
  html?: string;
  variant: "about" | "authors" | "contact";
}) {
  if (!html) return null;

  const bodyTextClass = getBodyTextClass(variant);
  const mobileJustifyClass =
    variant === "contact"
      ? ""
      : "mobile-cms-justify pr-2 hyphens-auto text-justify [text-align-last:left] md:pr-0 md:[text-align:inherit] md:[text-align-last:auto]";

  if (isHtml(html)) {
    return (
      <div
        className={`cms-rich-text text-[15px] leading-7 ${bodyTextClass} ${mobileJustifyClass} md:text-[16px] md:leading-8`}
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
            className={`text-[15px] leading-7 ${bodyTextClass} ${mobileJustifyClass} md:text-[16px] md:leading-8`}
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

const getBlockAction = (block: PublicContentBlock) => {
  if (
    block.showButton === false ||
    !block.buttonLabel?.trim() ||
    !block.buttonUrl?.trim()
  ) {
    return null;
  }

  return (
    <CmsActionButton
      label={block.buttonLabel}
      url={block.buttonUrl}
      icon={block.buttonIcon || "none"}
      variant={block.buttonVariant || "primary"}
      openInNewTab={block.buttonOpenInNewTab}
      className="shrink-0"
    />
  );
};

function TitleWithAction({
  block,
  variant,
  depth,
  marginClass = "mb-3",
}: {
  block: PublicContentBlock;
  variant: "about" | "authors" | "contact";
  depth: number;
  marginClass?: string;
}) {
  const action = getBlockAction(block);
  if (!block.title && !action) return null;

  return (
    <div className={`${marginClass} flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between`}>
      {block.title ? (
        <h3
          className={getBlockTitleClass(variant, depth, "mb-0")}
          style={
            variant === "authors" && depth === 0
              ? { fontFamily: "var(--font-source-serif)" }
              : undefined
          }
        >
          {block.title}
        </h3>
      ) : (
        <span />
      )}
      {action}
    </div>
  );
}

const renderActionChildren = (
  children: PublicContentBlock[],
  layout: CmsButtonLayout,
  variant: "about" | "authors" | "contact",
  depth: number
) => {
  if (!children.length) return null;

  return (
    <div
      className={
        layout === "horizontal"
          ? "mt-5 flex flex-wrap items-center gap-3"
          : "mt-5 flex flex-col items-start gap-3"
      }
    >
      {children.map((child, index) => (
        <Block
          key={child._id || `${child.type}-${index}`}
          block={child}
          variant={variant}
          depth={depth + 1}
          actionGroup
        />
      ))}
    </div>
  );
};

function Block({
  block,
  variant,
  depth,
  actionGroup = false,
}: {
  block: PublicContentBlock;
  variant: "about" | "authors" | "contact";
  depth: number;
  actionGroup?: boolean;
}) {
  if (!block.isActive) return null;

  const style = block.style || {};
  const isAuthorTopLevel = variant === "authors" && depth === 0;
  const wrapperStyle = {
    backgroundColor: style.backgroundColor || undefined,
    color: style.textColor || undefined,
    textAlign: style.alignment || undefined,
  } as CSSProperties;
  const width = actionGroup
    ? "w-auto"
    : isAuthorTopLevel
      ? "w-full"
      : widthClasses[style.width || "normal"];
  const padding = paddingClasses[style.padding || "medium"];
  const children = [...(block.children || [])].sort(
    (a, b) => Number(a.order || 0) - Number(b.order || 0)
  );
  const actionChildren = children.filter((child) =>
    ["button", "pdf"].includes(child.type)
  );
  const contentChildren = children.filter(
    (child) => !["button", "pdf"].includes(child.type)
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
        <TitleWithAction block={block} variant={variant} depth={depth} />
        <RichContent html={block.content} variant={variant} />
      </div>
    );
  }

  if (block.type === "list") {
    return (
      <div className={width} style={wrapperStyle}>
        <TitleWithAction block={block} variant={variant} depth={depth} marginClass="mb-4" />
        <ul className={`space-y-3 text-[15px] leading-7 ${getBodyTextClass(variant)} md:text-[16px] md:leading-8`}>
          {(block.items || []).map((item, index) => (
            <li key={`${item}-${index}`} className="flex gap-3 md:text-justify">
              <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-[#22b8e8]" />
              <span
                className={
                  variant === "contact"
                    ? ""
                    : "mobile-cms-justify pr-2 hyphens-auto text-justify [text-align-last:left] md:pr-0 md:[text-align:inherit] md:[text-align-last:auto]"
                }
                dangerouslySetInnerHTML={{ __html: item }}
              />
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
        <TitleWithAction block={block} variant={variant} depth={depth} marginClass="mb-0" />
        {block.content ? (
          <div className={block.title || getBlockAction(block) ? "mt-4" : ""}>
            <RichContent html={block.content} variant={variant} />
          </div>
        ) : null}
        {contentChildren.length > 0 ? (
          <div className="mt-5 space-y-5">
            {contentChildren.map((child, index) => (
              <Block
                key={child._id || index}
                block={child}
                variant={variant}
                depth={depth + 1}
              />
            ))}
          </div>
        ) : null}
        {renderActionChildren(
          actionChildren,
          style.buttonLayout || "vertical",
          variant,
          depth
        )}
      </section>
    );
  }

  if (block.type === "columns") {
    const columnCount = Math.min(Math.max(Number(style.columns || 2), 1), 4);
    return (
      <section className={width} style={wrapperStyle}>
        <TitleWithAction block={block} variant={variant} depth={depth} marginClass="mb-5" />
        <div
          className={[
            "grid grid-cols-1 gap-5",
            columnCount === 2 ? "md:grid-cols-2" : "",
            columnCount === 3 ? "md:grid-cols-2 xl:grid-cols-3" : "",
            columnCount === 4 ? "md:grid-cols-2 xl:grid-cols-4" : "",
          ].join(" ")}
        >
          {contentChildren.map((child, index) => (
            <div key={child._id || index} className="min-w-0">
              <Block block={child} variant={variant} depth={depth + 1} />
            </div>
          ))}
        </div>
        {renderActionChildren(
          actionChildren,
          style.buttonLayout || "horizontal",
          variant,
          depth
        )}
      </section>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote
        className={`${width} rounded-2xl border-l-4 border-[#005A78] bg-slate-50 px-6 py-5 text-lg italic leading-8 ${getBodyTextClass(variant)}`}
        style={wrapperStyle}
      >
        <RichContent html={block.content} variant={variant} />
        {block.title ? (
          <footer className="mt-3 text-sm font-semibold not-italic">— {block.title}</footer>
        ) : null}
      </blockquote>
    );
  }

  if (block.type === "image" && block.imageUrl) {
    return (
      <figure className={`${width} overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3`}>
        <img
          src={block.imageUrl}
          alt={block.altText || block.title || "Page image"}
          className="w-full rounded-xl object-cover"
        />
        {block.caption || block.title ? (
          <figcaption className="mt-3 text-center text-sm text-slate-500">
            {block.caption || block.title}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  if (block.type === "pdf" && block.fileUrl && block.showButton !== false) {
    return (
      <div className={width} style={wrapperStyle}>
        {block.title && !actionGroup ? (
          <h3 className={getBlockTitleClass(variant, depth)}>{block.title}</h3>
        ) : null}
        <CmsActionButton
          label={block.buttonLabel || "Open Document"}
          url={block.fileUrl}
          icon={block.buttonIcon || "pdf"}
          variant={block.buttonVariant || "primary"}
          openInNewTab={block.buttonOpenInNewTab ?? true}
        />
      </div>
    );
  }

  if (block.type === "button" && block.buttonUrl && block.showButton !== false) {
    return (
      <div className={width} style={wrapperStyle}>
        <CmsActionButton
          label={block.buttonLabel || block.title || "Learn More"}
          url={block.buttonUrl}
          icon={block.buttonIcon || "none"}
          variant={block.buttonVariant || "primary"}
          openInNewTab={block.buttonOpenInNewTab}
        />
      </div>
    );
  }

  if (block.type === "video" && (block.fileUrl || block.buttonUrl)) {
    const source = block.fileUrl || block.buttonUrl || "";
    return (
      <div className={`${width} overflow-hidden rounded-2xl border border-slate-200 bg-black`}>
        <iframe
          src={source}
          title={block.title || "Embedded video"}
          className="aspect-video w-full"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
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
        <TitleWithAction block={block} variant={variant} depth={depth} />
        <div className="cms-table" dangerouslySetInnerHTML={{ __html: block.content || "" }} />
      </div>
    );
  }

  if (block.type === "code") {
    return (
      <div className={width} style={wrapperStyle}>
        {block.title ? (
          <h3 className={getBlockTitleClass(variant, depth, "mb-3")}>{block.title}</h3>
        ) : null}
        <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-5 text-sm leading-6 text-slate-100">
          <code data-language={block.codeLanguage || "text"}>{block.content}</code>
        </pre>
      </div>
    );
  }

  if (block.type === "divider") return <hr className={`${width} border-slate-200`} />;

  if (block.type === "spacer") {
    const size = style.padding === "large" ? "h-20" : style.padding === "small" ? "h-6" : "h-12";
    return <div className={size} aria-hidden="true" />;
  }

  return null;
}

export default function CmsContentRenderer({
  blocks,
  variant = "about",
  pageAction,
}: CmsContentRendererProps) {
  const sorted = [...blocks]
    .filter((block) => block.isActive)
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

  const firstContentIndex = sorted.findIndex(
    (block) => !["button", "pdf", "spacer", "divider"].includes(block.type)
  );

  const blocksWithPageAction = sorted.map((block, index) =>
    index === firstContentIndex &&
    pageAction?.show !== false &&
    pageAction?.label?.trim() &&
    pageAction?.url?.trim()
      ? {
          ...block,
          showButton: true,
          buttonLabel: pageAction.label,
          buttonUrl: pageAction.url,
          buttonIcon: pageAction.icon || "none",
          buttonVariant: pageAction.variant || "primary",
          buttonOpenInNewTab: pageAction.openInNewTab,
        }
      : block
  );

  const rendered: ReactNode[] = [];

  for (let index = 0; index < blocksWithPageAction.length; index += 1) {
    const block = blocksWithPageAction[index];
    const isActionBlock = ["button", "pdf"].includes(block.type);

    // An action placed directly after a content block belongs to that card.
    // This keeps existing page data compatible while allowing the admin to
    // choose vertical or side-by-side button layouts without rebuilding blocks.
    if (isActionBlock) {
      const standalone = (
        <Block
          key={block._id || `${block.type}-${index}`}
          block={block}
          variant={variant}
          depth={0}
          actionGroup
        />
      );

      if (variant === "authors") {
        rendered.push(
          <article
            key={block._id || `${block.type}-${index}`}
            className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7"
          >
            {standalone}
          </article>
        );
      } else {
        rendered.push(standalone);
      }
      continue;
    }

    const followingActions: PublicContentBlock[] = [];
    let cursor = index + 1;
    while (
      cursor < blocksWithPageAction.length &&
      ["button", "pdf"].includes(blocksWithPageAction[cursor].type)
    ) {
      followingActions.push(blocksWithPageAction[cursor]);
      cursor += 1;
    }
    if (followingActions.length > 0) index = cursor - 1;

    const renderedBlock = (
      <Block
        key={block._id || `${block.type}-${index}`}
        block={block}
        variant={variant}
        depth={0}
      />
    );

    const followingActionGroup = renderActionChildren(
      followingActions,
      block.style?.buttonLayout || "vertical",
      variant,
      0
    );

    if (variant !== "authors" || block.type === "spacer") {
      rendered.push(
        <div key={block._id || `${block.type}-${index}`}>
          {renderedBlock}
          {followingActionGroup}
        </div>
      );
      continue;
    }

    const style = block.style || {};
    const width = widthClasses[style.width || "normal"];
    const padding = paddingClasses[style.padding || "medium"];
    const outerStyle = {
      backgroundColor: style.backgroundColor || undefined,
      color: style.textColor || undefined,
    } as CSSProperties;

    rendered.push(
      <article
        key={block._id || `${block.type}-${index}`}
        className={`${width} ${padding} rounded-3xl border border-slate-200 bg-white shadow-sm`}
        style={outerStyle}
      >
        {renderedBlock}
        {followingActionGroup}
      </article>
    );
  }

  return <div className="space-y-5">{rendered}</div>;
}
