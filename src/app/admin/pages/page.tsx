"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Code2,
  Columns3,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  GripVertical,
  ImageIcon,
  LayoutPanelTop,
  LinkIcon,
  List,
  Loader2,
  MessageSquareQuote,
  Minus,
  Monitor,
  Plus,
  Save,
  Smartphone,
  Table2,
  Tablet,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import RichTextEditor from "@/components/admin/RichTextEditor";
import CmsContentRenderer from "@/components/common/CmsContentRenderer";
import {
  CmsPage,
  ContentBlock,
  ContentBlockType,
  createAdminPage,
  deleteAdminPage,
  getAdminPages,
  PageGroup,
  PagePayload,
  reorderAdminPages,
  updateAdminPage,
} from "@/services/pageService";
import { uploadMedia } from "@/services/mediaService";
import type { PublicContentBlock } from "@/services/publicPageService";

const pageGroups: { label: string; value: PageGroup | "" }[] = [
  { label: "All Groups", value: "" },
  { label: "About", value: "about" },
  { label: "For Authors", value: "for-authors" },
  { label: "Reviewers", value: "reviewers" },
  { label: "Issues", value: "issues" },
  { label: "Custom", value: "custom" },
];

const blockTypes: { label: string; value: ContentBlockType; icon: React.ElementType }[] = [
  { label: "Heading", value: "heading", icon: FileText },
  { label: "Rich Text", value: "paragraph", icon: FileText },
  { label: "List", value: "list", icon: List },
  { label: "Card", value: "card", icon: LayoutPanelTop },
  { label: "Section", value: "section", icon: LayoutPanelTop },
  { label: "Columns", value: "columns", icon: Columns3 },
  { label: "Quote", value: "quote", icon: MessageSquareQuote },
  { label: "Notice", value: "notice", icon: MessageSquareQuote },
  { label: "Image", value: "image", icon: ImageIcon },
  { label: "Document", value: "pdf", icon: FileText },
  { label: "Button", value: "button", icon: LinkIcon },
  { label: "Video / Embed", value: "video", icon: Video },
  { label: "Table", value: "table", icon: Table2 },
  { label: "Code", value: "code", icon: Code2 },
  { label: "Divider", value: "divider", icon: Minus },
  { label: "Spacer", value: "spacer", icon: LayoutPanelTop },
];

const nestedBlockTypes = new Set<ContentBlockType>([
  "card",
  "section",
  "columns",
  "notice",
]);

const emptyForm: PagePayload = {
  title: "",
  group: "about",
  subtitle: "",
  bannerImage: "",
  shortDescription: "",
  contentBlocks: [],
  buttonLabel: "",
  buttonUrl: "",
  metaTitle: "",
  metaDescription: "",
  isPublished: true,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const createTableHtml = (rows: number, columns: number) => {
  const safeRows = Math.min(Math.max(rows, 1), 25);
  const safeColumns = Math.min(Math.max(columns, 1), 12);
  const header = `<tr>${Array.from({ length: safeColumns }, (_, index) => `<th>Heading ${index + 1}</th>`).join("")}</tr>`;
  const body = Array.from(
    { length: Math.max(safeRows - 1, 0) },
    (_, rowIndex) =>
      `<tr>${Array.from({ length: safeColumns }, (_, columnIndex) => `<td>Row ${rowIndex + 1}, Column ${columnIndex + 1}</td>`).join("")}</tr>`
  ).join("");

  return `<table><thead>${header}</thead><tbody>${body}</tbody></table>`;
};

const createEmptyBlock = (type: ContentBlockType, order = 0): ContentBlock => ({
  type,
  title: "",
  content: "",
  items: [],
  imageUrl: "",
  fileUrl: "",
  buttonLabel: "",
  buttonUrl: "",
  caption: "",
  altText: "",
  codeLanguage: "",
  style: {
    alignment: "left",
    backgroundColor: "",
    textColor: "",
    width: "normal",
    padding: "medium",
    columns: 2,
    headingLevel: 2,
    variant: "default",
  },
  children: [],
  order,
  isActive: true,
});

const normalizeOrders = (blocks: ContentBlock[]): ContentBlock[] =>
  blocks.map((block, index) => ({
    ...block,
    order: index,
    children: normalizeOrders(block.children || []),
  }));

const updateBlockAtPath = (
  blocks: ContentBlock[],
  path: number[],
  updater: (block: ContentBlock) => ContentBlock
): ContentBlock[] => {
  const [index, ...rest] = path;
  return blocks.map((block, itemIndex) => {
    if (itemIndex !== index) return block;
    if (rest.length === 0) return updater(block);
    return {
      ...block,
      children: updateBlockAtPath(block.children || [], rest, updater),
    };
  });
};

const removeBlockAtPath = (blocks: ContentBlock[], path: number[]): ContentBlock[] => {
  const [index, ...rest] = path;
  if (rest.length === 0) {
    return normalizeOrders(blocks.filter((_, itemIndex) => itemIndex !== index));
  }

  return blocks.map((block, itemIndex) =>
    itemIndex === index
      ? {
          ...block,
          children: removeBlockAtPath(block.children || [], rest),
        }
      : block
  );
};

const getChildrenAtPath = (blocks: ContentBlock[], parentPath: number[]) => {
  let current = blocks;
  for (const index of parentPath) {
    current = current[index]?.children || [];
  }
  return current;
};

const replaceChildrenAtPath = (
  blocks: ContentBlock[],
  parentPath: number[],
  children: ContentBlock[]
): ContentBlock[] => {
  if (parentPath.length === 0) return normalizeOrders(children);
  return updateBlockAtPath(blocks, parentPath, (block) => ({
    ...block,
    children: normalizeOrders(children),
  }));
};

const groupLabel = (group: string) => {
  if (group === "for-authors") return "For Authors";
  if (group === "about") return "About";
  if (group === "reviewers") return "Reviewers";
  if (group === "issues") return "Issues";
  return "Custom";
};

const getPublicPageHref = (page: CmsPage) => {
  if (page.group === "about" && page.slug === "contact-us") return "/contact";
  if (page.group === "about") return `/about/${page.slug}`;
  if (page.group === "for-authors") return `/for-authors/${page.slug}`;
  if (page.group === "reviewers") return `/reviewers/${page.slug}`;
  if (page.group === "issues") return `/issues/${page.slug}`;
  return `/${page.slug}`;
};

const imageAccept = "image/jpeg,image/jpg,image/png,image/webp,image/gif";
const documentAccept =
  "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.doc,.docx";

const pagePresets: Record<PageGroup, { label: string; blocks: ContentBlock[] }[]> = {
  about: [
    {
      label: "Overview section",
      blocks: [
        {
          ...createEmptyBlock("section"),
          title: "Overview",
          children: [createEmptyBlock("paragraph")],
        },
      ],
    },
    {
      label: "Mission and values",
      blocks: [
        {
          ...createEmptyBlock("columns"),
          title: "Our Focus",
          style: { ...createEmptyBlock("columns").style, columns: 2 },
          children: [
            { ...createEmptyBlock("card"), title: "Mission" },
            { ...createEmptyBlock("card"), title: "Vision" },
          ],
        },
      ],
    },
  ],
  "for-authors": [
    {
      label: "Information card",
      blocks: [
        {
          ...createEmptyBlock("paragraph"),
          title: "Section Title",
        },
      ],
    },
    {
      label: "Checklist card",
      blocks: [
        {
          ...createEmptyBlock("list"),
          title: "Checklist",
          items: ["First requirement", "Second requirement"],
        },
      ],
    },
    {
      label: "Card with nested content",
      blocks: [
        {
          ...createEmptyBlock("section"),
          title: "Section Title",
          children: [createEmptyBlock("paragraph"), createEmptyBlock("list")],
        },
      ],
    },
  ],
  reviewers: [
    {
      label: "Reviewer information card",
      blocks: [
        {
          ...createEmptyBlock("paragraph"),
          title: "Section Title",
        },
      ],
    },
    {
      label: "Review steps",
      blocks: [
        {
          ...createEmptyBlock("list"),
          title: "Steps of Review",
          items: ["First step", "Second step", "Third step"],
        },
      ],
    },
  ],
  issues: [
    {
      label: "Issue information",
      blocks: [
        {
          ...createEmptyBlock("columns"),
          style: { ...createEmptyBlock("columns").style, columns: 2 },
          children: [createEmptyBlock("card"), createEmptyBlock("card")],
        },
      ],
    },
  ],
  custom: [
    {
      label: "Flexible page",
      blocks: [createEmptyBlock("heading"), createEmptyBlock("paragraph")],
    },
  ],
};

type BlockEditorProps = {
  block: ContentBlock;
  path: number[];
  onUpdate: (path: number[], field: keyof ContentBlock, value: any) => void;
  onRemove: (path: number[]) => void;
  onAddChild: (path: number[], type: ContentBlockType) => void;
  onUpload: (
    file: File | undefined,
    target: "blockImage" | "blockFile",
    path: number[]
  ) => void;
  uploadingTarget: string;
  dragPath: number[] | null;
  setDragPath: (path: number[] | null) => void;
  onDropBlock: (sourcePath: number[], targetPath: number[]) => void;
};

function BlockEditor({
  block,
  path,
  onUpdate,
  onRemove,
  onAddChild,
  onUpload,
  uploadingTarget,
  dragPath,
  setDragPath,
  onDropBlock,
}: BlockEditorProps) {
  const [expanded, setExpanded] = useState(true);
  const uploadKey = path.join("-");
  const TypeIcon = blockTypes.find((item) => item.value === block.type)?.icon || FileText;
  const canNest = nestedBlockTypes.has(block.type);

  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.stopPropagation();
        if (dragPath) onDropBlock(dragPath, path);
      }}
      className={[
        "rounded-2xl border bg-white p-4 transition",
        dragPath?.join(".") === path.join(".")
          ? "border-[#005A78] opacity-60 ring-2 ring-[#005A78]/10"
          : "border-slate-200",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            draggable
            title="Drag to reorder"
            onDragStart={(event) => {
              event.stopPropagation();
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", path.join("."));
              setDragPath(path);
            }}
            onDragEnd={() => setDragPath(null)}
            className="cursor-grab rounded-lg border border-slate-200 p-2 text-slate-400 active:cursor-grabbing"
          >
            <GripVertical size={16} />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#005A78]/10 text-[#005A78]">
            <TypeIcon size={18} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-700">
              {blockTypes.find((item) => item.value === block.type)?.label || block.type}
            </p>
            <p className="text-xs text-slate-500">Position {path[path.length - 1] + 1}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={block.isActive}
              onChange={(event) => onUpdate(path, "isActive", event.target.checked)}
              className="accent-[#005A78]"
            />
            Visible
          </label>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          <button
            type="button"
            onClick={() => onRemove(path)}
            className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-5 space-y-4">
          {!['divider', 'spacer'].includes(block.type) && (
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                Title / Label
              </label>
              <input
                value={block.title || ""}
                onChange={(event) => onUpdate(path, "title", event.target.value)}
                placeholder="Optional title"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#005A78]"
              />
            </div>
          )}

          {block.type === "heading" && (
            <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
              <input
                value={block.content || ""}
                onChange={(event) => onUpdate(path, "content", event.target.value)}
                placeholder="Heading text"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#005A78]"
              />
              <select
                value={block.style?.headingLevel || 2}
                onChange={(event) =>
                  onUpdate(path, "style", {
                    ...block.style,
                    headingLevel: Number(event.target.value),
                  })
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"
              >
                <option value={1}>Heading 1</option>
                <option value={2}>Heading 2</option>
                <option value={3}>Heading 3</option>
                <option value={4}>Heading 4</option>
                <option value={5}>Heading 5</option>
                <option value={6}>Heading 6</option>
              </select>
            </div>
          )}

          {["paragraph", "card", "section", "quote", "notice", "table"].includes(block.type) && (
            <div className="space-y-3">
              {block.type === "table" && (
                <button
                  type="button"
                  onClick={() => {
                    const requestedRows = Number(window.prompt("How many rows should the table have?", "4"));
                    if (!Number.isFinite(requestedRows) || requestedRows < 1) return;

                    const requestedColumns = Number(window.prompt("How many columns should the table have?", "3"));
                    if (!Number.isFinite(requestedColumns) || requestedColumns < 1) return;

                    onUpdate(path, "content", createTableHtml(requestedRows, requestedColumns));
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#005A78]/20 bg-[#005A78]/5 px-4 text-sm font-bold text-[#005A78] hover:bg-[#005A78]/10"
                >
                  <Table2 size={16} />
                  Generate Editable Table
                </button>
              )}
              <RichTextEditor
                value={block.content || ""}
                onChange={(value) => onUpdate(path, "content", value)}
                placeholder={block.type === "table" ? "Generate a table, then click inside its cells to edit the content." : "Write and format the content..."}
                minHeight={block.type === "quote" ? 100 : 150}
              />
            </div>
          )}

          {block.type === "list" && (
            <textarea
              value={(block.items || []).join("\n")}
              onChange={(event) =>
                onUpdate(
                  path,
                  "items",
                  event.target.value.split("\n").map((item) => item.trim()).filter(Boolean)
                )
              }
              rows={6}
              placeholder="Write one list item per line"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
            />
          )}

          {block.type === "image" && (
            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={block.imageUrl || ""}
                  onChange={(event) => onUpdate(path, "imageUrl", event.target.value)}
                  placeholder="Image URL"
                  className="h-11 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#005A78]"
                />
                <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#005A78]/20 bg-[#005A78]/5 px-4 text-sm font-bold text-[#005A78]">
                  {uploadingTarget === `blockImage-${uploadKey}` ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  Upload
                  <input
                    type="file"
                    accept={imageAccept}
                    className="hidden"
                    onChange={(event) => onUpload(event.target.files?.[0], "blockImage", path)}
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={block.altText || ""}
                  onChange={(event) => onUpdate(path, "altText", event.target.value)}
                  placeholder="Alternative text for accessibility"
                  className="h-11 rounded-xl border border-slate-200 px-4 text-sm"
                />
                <input
                  value={block.caption || ""}
                  onChange={(event) => onUpdate(path, "caption", event.target.value)}
                  placeholder="Image caption"
                  className="h-11 rounded-xl border border-slate-200 px-4 text-sm"
                />
              </div>
              {block.imageUrl && (
                <img
                  src={block.imageUrl}
                  alt={block.altText || "Preview"}
                  className="max-h-56 rounded-xl border border-slate-200 object-contain"
                />
              )}
            </div>
          )}

          {block.type === "pdf" && (
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                value={block.fileUrl || ""}
                onChange={(event) => onUpdate(path, "fileUrl", event.target.value)}
                placeholder="Document URL"
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm"
              />
              <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#005A78]/20 bg-[#005A78]/5 px-4 text-sm font-bold text-[#005A78]">
                {uploadingTarget === `blockFile-${uploadKey}` ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                Upload
                <input
                  type="file"
                  accept={documentAccept}
                  className="hidden"
                  onChange={(event) => onUpload(event.target.files?.[0], "blockFile", path)}
                />
              </label>
              <input
                value={block.buttonLabel || ""}
                onChange={(event) => onUpdate(path, "buttonLabel", event.target.value)}
                placeholder="Download button label"
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm sm:col-span-2"
              />
            </div>
          )}

          {block.type === "button" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={block.buttonLabel || ""}
                onChange={(event) => onUpdate(path, "buttonLabel", event.target.value)}
                placeholder="Button label"
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm"
              />
              <input
                value={block.buttonUrl || ""}
                onChange={(event) => onUpdate(path, "buttonUrl", event.target.value)}
                placeholder="Button URL"
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm"
              />
            </div>
          )}

          {block.type === "video" && (
            <input
              value={block.fileUrl || ""}
              onChange={(event) => onUpdate(path, "fileUrl", event.target.value)}
              placeholder="YouTube embed URL, Vimeo embed URL, or hosted video URL"
              className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm"
            />
          )}

          {block.type === "code" && (
            <div className="space-y-3">
              <input
                value={block.codeLanguage || ""}
                onChange={(event) => onUpdate(path, "codeLanguage", event.target.value)}
                placeholder="Language, e.g. javascript"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm"
              />
              <textarea
                value={block.content || ""}
                onChange={(event) => onUpdate(path, "content", event.target.value)}
                rows={8}
                className="w-full rounded-xl border border-slate-200 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-100"
              />
            </div>
          )}

          {block.type === "columns" && (
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                Number of columns
              </label>
              <select
                value={block.style?.columns || 2}
                onChange={(event) =>
                  onUpdate(path, "style", { ...block.style, columns: Number(event.target.value) })
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
              >
                <option value={1}>1 column</option>
                <option value={2}>2 columns</option>
                <option value={3}>3 columns</option>
                <option value={4}>4 columns</option>
              </select>
            </div>
          )}

          {block.type === "notice" && (
            <select
              value={block.style?.variant || "info"}
              onChange={(event) =>
                onUpdate(path, "style", { ...block.style, variant: event.target.value })
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
            >
              <option value="info">Information</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
            </select>
          )}

          <details className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <summary className="cursor-pointer text-sm font-bold text-slate-700">
              Layout and appearance
            </summary>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <select
                value={block.style?.alignment || "left"}
                onChange={(event) =>
                  onUpdate(path, "style", { ...block.style, alignment: event.target.value })
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="left">Align left</option>
                <option value="center">Align center</option>
                <option value="right">Align right</option>
                <option value="justify">Justify</option>
              </select>
              <select
                value={block.style?.width || "normal"}
                onChange={(event) =>
                  onUpdate(path, "style", { ...block.style, width: event.target.value })
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="full">Full width</option>
                <option value="wide">Wide</option>
                <option value="normal">Normal</option>
                <option value="narrow">Narrow</option>
              </select>
              <input
                type="color"
                value={block.style?.backgroundColor || "#ffffff"}
                onChange={(event) =>
                  onUpdate(path, "style", { ...block.style, backgroundColor: event.target.value })
                }
                title="Background color"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white p-1"
              />
              <input
                type="color"
                value={block.style?.textColor || "#334155"}
                onChange={(event) =>
                  onUpdate(path, "style", { ...block.style, textColor: event.target.value })
                }
                title="Text color"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white p-1"
              />
            </div>
          </details>

          {canNest && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-800">Blocks inside this block</p>
                  <p className="text-xs text-slate-500">Add nested content and drag it within this container.</p>
                </div>
                <select
                  defaultValue=""
                  onChange={(event) => {
                    if (event.target.value) {
                      onAddChild(path, event.target.value as ContentBlockType);
                      event.target.value = "";
                    }
                  }}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700"
                >
                  <option value="">+ Add inner block</option>
                  {blockTypes
                    .filter((item) => !["section", "columns"].includes(item.value))
                    .map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-3">
                {(block.children || []).map((child, childIndex) => (
                  <BlockEditor
                    key={child._id || `${path.join("-")}-${childIndex}`}
                    block={child}
                    path={[...path, childIndex]}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    onAddChild={onAddChild}
                    onUpload={onUpload}
                    uploadingTarget={uploadingTarget}
                    dragPath={dragPath}
                    setDragPath={setDragPath}
                    onDropBlock={onDropBlock}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type PreviewViewport = "desktop" | "tablet" | "mobile";

type PagePreviewModalProps = {
  form: PagePayload;
  pages: CmsPage[];
  editingPageId?: string;
  onClose: () => void;
};

function PagePreviewModal({
  form,
  pages,
  editingPageId,
  onClose,
}: PagePreviewModalProps) {
  const [viewport, setViewport] = useState<PreviewViewport>("desktop");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const viewportClass =
    viewport === "mobile"
      ? "max-w-[430px]"
      : viewport === "tablet"
        ? "max-w-[820px]"
        : "max-w-[1280px]";
  const rendererVariant =
    form.group === "for-authors" ? "authors" : form.group === "about" ? "about" : "about";
  const activeBlocks = normalizeOrders(form.contentBlocks || []).filter(
    (block) => block.isActive
  );
  const currentPreviewTitle = form.title.trim() || "Untitled Page";
  const currentPageOrder =
    pages.find((page) => page._id === editingPageId)?.order ?? 9999;
  const authorPreviewItems = [
    ...pages
      .filter(
        (page) =>
          page.group === "for-authors" &&
          page._id !== editingPageId &&
          page.isPublished
      )
      .map((page) => ({
        id: page._id,
        title: page.title,
        order: page.order,
        active: false,
      })),
    {
      id: editingPageId || "preview-page",
      title: currentPreviewTitle,
      order: currentPageOrder,
      active: true,
    },
  ].sort((a, b) => a.order - b.order);

  return (
    <div
      className="fixed inset-0 z-[120] flex flex-col bg-slate-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Page output preview"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-950 px-4 py-3 text-white md:px-6">
        <div>
          <p className="text-sm font-bold">Live Page Preview</p>
          <p className="mt-0.5 text-xs text-white/60">Updates instantly and does not require saving.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-white/15 bg-white/5 p-1">
            {[
              { value: "desktop" as const, label: "Desktop", icon: Monitor },
              { value: "tablet" as const, label: "Tablet", icon: Tablet },
              { value: "mobile" as const, label: "Mobile", icon: Smartphone },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.value}
                  type="button"
                  title={`${item.label} preview`}
                  onClick={() => setViewport(item.value)}
                  className={`flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold transition ${
                    viewport === item.value
                      ? "bg-white text-slate-950"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={15} />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-white hover:bg-white/10"
            aria-label="Close preview"
          >
            <X size={19} />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-3 md:p-6">
        <div
          className={`mx-auto min-h-full w-full overflow-hidden rounded-2xl bg-white shadow-2xl transition-[max-width] duration-300 ${viewportClass}`}
        >
          {form.group === "for-authors" ? (
            <main className="min-h-full bg-[#f7f8fb]">
              <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto w-full max-w-6xl px-5 py-10 md:px-8 md:py-14">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#111433]">
                    For Authors
                  </p>
                  <h1
                    className="mt-4 text-[32px] font-semibold leading-tight tracking-tight text-slate-950 md:text-[52px]"
                    style={{ fontFamily: "var(--font-source-serif)" }}
                  >
                    {currentPreviewTitle}
                  </h1>
                  {form.subtitle?.trim() ? (
                    <p className="mt-5 max-w-3xl text-[15px] leading-7 text-slate-600 md:text-[16px] md:leading-8">
                      {form.subtitle}
                    </p>
                  ) : null}
                  {form.shortDescription?.trim() ? (
                    <p className="mt-3 max-w-3xl text-[14px] leading-7 text-slate-500 md:text-[15px]">
                      {form.shortDescription}
                    </p>
                  ) : null}
                  {form.bannerImage?.trim() ? (
                    <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                      <img
                        src={form.bannerImage}
                        alt={form.title || "Page banner"}
                        className="max-h-[360px] w-full rounded-2xl object-cover"
                      />
                    </div>
                  ) : null}
                </div>
              </section>

              <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-12">
                <div className="grid gap-7 lg:grid-cols-[260px_minmax(0,1fr)]">
                  <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="px-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#111433]">
                      Author Menu
                    </p>
                    <div className="mt-4 grid gap-2">
                      {authorPreviewItems.map((item) => (
                        <div
                          key={item.id}
                          className={`rounded-2xl px-4 py-3 text-[14px] font-medium ${
                            item.active
                              ? "bg-[#111433] text-white"
                              : "text-slate-600"
                          }`}
                        >
                          {item.title}
                        </div>
                      ))}
                    </div>
                  </aside>

                  <section className="space-y-5 text-justify">
                    {activeBlocks.length > 0 ? (
                      <CmsContentRenderer
                        blocks={activeBlocks as PublicContentBlock[]}
                        variant="authors"
                      />
                    ) : (
                      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                        <FileText className="mx-auto text-slate-400" size={34} />
                        <p className="mt-3 text-sm font-semibold text-slate-500">
                          Add content blocks to see the author-page cards here.
                        </p>
                      </div>
                    )}

                    {form.buttonLabel?.trim() && form.buttonUrl?.trim() ? (
                      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
                        <a
                          href={form.buttonUrl}
                          target={form.buttonUrl.startsWith("http") ? "_blank" : undefined}
                          rel={form.buttonUrl.startsWith("http") ? "noreferrer" : undefined}
                          className="inline-flex items-center justify-center rounded-full bg-[#111433] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1b204a]"
                        >
                          {form.buttonLabel}
                        </a>
                      </article>
                    ) : null}

                    <div className="rounded-3xl border border-slate-200 bg-[#111433] p-5 text-white shadow-sm md:p-7">
                      <h2
                        className="text-[22px] font-semibold leading-tight md:text-[28px]"
                        style={{ fontFamily: "var(--font-source-serif)" }}
                      >
                        Need help preparing your manuscript?
                      </h2>
                      <p className="mt-4 text-[15px] leading-7 text-white/80">
                        The public page keeps the original Author Menu and separate content-card design.
                      </p>
                    </div>
                  </section>
                </div>
              </div>
            </main>
          ) : (
            <main className="min-h-full bg-[#f7f8fb]">
              <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto w-full max-w-6xl px-5 py-10 md:px-8 md:py-14">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#005A78]">
                    {groupLabel(form.group)}
                  </p>
                  <h1
                    className="mt-4 text-[32px] font-semibold leading-tight tracking-tight text-slate-950 md:text-[52px]"
                    style={{ fontFamily: "var(--font-source-serif)" }}
                  >
                    {currentPreviewTitle}
                  </h1>
                  {form.subtitle?.trim() ? (
                    <p className="mt-5 max-w-3xl text-[15px] leading-7 text-slate-600 md:text-[16px] md:leading-8">
                      {form.subtitle}
                    </p>
                  ) : null}
                  {form.bannerImage?.trim() ? (
                    <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                      <img
                        src={form.bannerImage}
                        alt={form.title || "Page banner"}
                        className="max-h-[360px] w-full rounded-2xl object-cover"
                      />
                    </div>
                  ) : null}
                </div>
              </section>

              <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-12">
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-9">
                  {form.shortDescription?.trim() ? (
                    <p className="mb-7 border-b border-slate-200 pb-7 text-[15px] leading-8 text-slate-600">
                      {form.shortDescription}
                    </p>
                  ) : null}

                  {activeBlocks.length > 0 ? (
                    <CmsContentRenderer
                      blocks={activeBlocks as PublicContentBlock[]}
                      variant={rendererVariant}
                    />
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                      <FileText className="mx-auto text-slate-400" size={34} />
                      <p className="mt-3 text-sm font-semibold text-slate-500">
                        Add content blocks to see the page output here.
                      </p>
                    </div>
                  )}

                  {form.buttonLabel?.trim() && form.buttonUrl?.trim() ? (
                    <a
                      href={form.buttonUrl}
                      target={form.buttonUrl.startsWith("http") ? "_blank" : undefined}
                      rel={form.buttonUrl.startsWith("http") ? "noreferrer" : undefined}
                      className="mt-8 inline-flex items-center justify-center rounded-full bg-[#111433] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1b204a]"
                    >
                      {form.buttonLabel}
                    </a>
                  ) : null}
                </section>
              </div>
            </main>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [editingPage, setEditingPage] = useState<CmsPage | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<PagePayload>(emptyForm);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadingTarget, setUploadingTarget] = useState("");
  const [dragPath, setDragPath] = useState<number[] | null>(null);
  const [draggingPageId, setDraggingPageId] = useState<string | null>(null);
  const formSectionRef = useRef<HTMLElement | null>(null);

  const slugPreview = useMemo(() => slugify(form.title), [form.title]);

  const scrollToForm = () => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };

  const fetchPages = async () => {
    try {
      setLoading(true);
      setPages(await getAdminPages(selectedGroup));
    } catch {
      setMessage("Failed to load pages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [selectedGroup]);

  const openCreateForm = () => {
    setEditingPage(null);
    setForm({ ...emptyForm, contentBlocks: [] });
    setIsFormOpen(true);
    setMessage("");
    scrollToForm();
  };

  const openEditForm = (page: CmsPage) => {
    setEditingPage(page);
    setForm({
      title: page.title || "",
      group: page.group,
      subtitle: page.subtitle || "",
      bannerImage: page.bannerImage || "",
      shortDescription: page.shortDescription || "",
      contentBlocks: normalizeOrders(page.contentBlocks || []),
      buttonLabel: page.buttonLabel || "",
      buttonUrl: page.buttonUrl || "",
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
      isPublished: page.isPublished,
    });
    setIsFormOpen(true);
    setMessage("");
    scrollToForm();
  };

  const closeForm = () => {
    setIsPreviewOpen(false);
    setIsFormOpen(false);
    setEditingPage(null);
    setForm({ ...emptyForm, contentBlocks: [] });
  };

  const updateField = <K extends keyof PagePayload>(field: K, value: PagePayload[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addBlock = (type: ContentBlockType) => {
    setForm((prev) => ({
      ...prev,
      contentBlocks: normalizeOrders([
        ...prev.contentBlocks,
        createEmptyBlock(type, prev.contentBlocks.length),
      ]),
    }));
  };

  const addPreset = (presetIndex: number) => {
    const preset = pagePresets[form.group][presetIndex];
    if (!preset) return;
    setForm((prev) => ({
      ...prev,
      contentBlocks: normalizeOrders([
        ...prev.contentBlocks,
        ...preset.blocks.map((block) => ({ ...block, children: normalizeOrders(block.children || []) })),
      ]),
    }));
  };

  const updateBlock = (path: number[], field: keyof ContentBlock, value: any) => {
    setForm((prev) => ({
      ...prev,
      contentBlocks: updateBlockAtPath(prev.contentBlocks, path, (block) => ({
        ...block,
        [field]: value,
      })),
    }));
  };

  const removeBlock = (path: number[]) => {
    setForm((prev) => ({
      ...prev,
      contentBlocks: removeBlockAtPath(prev.contentBlocks, path),
    }));
  };

  const addChildBlock = (path: number[], type: ContentBlockType) => {
    setForm((prev) => ({
      ...prev,
      contentBlocks: updateBlockAtPath(prev.contentBlocks, path, (block) => ({
        ...block,
        children: normalizeOrders([
          ...(block.children || []),
          createEmptyBlock(type, (block.children || []).length),
        ]),
      })),
    }));
  };

  const dropBlock = (sourcePath: number[], targetPath: number[]) => {
    const sourceParent = sourcePath.slice(0, -1);
    const targetParent = targetPath.slice(0, -1);
    if (sourceParent.join(".") !== targetParent.join(".")) {
      setMessage("Nested blocks can be dragged only within the same container.");
      setDragPath(null);
      return;
    }

    setForm((prev) => {
      const siblings = [...getChildrenAtPath(prev.contentBlocks, sourceParent)];
      const sourceIndex = sourcePath[sourcePath.length - 1];
      const targetIndex = targetPath[targetPath.length - 1];
      const [moved] = siblings.splice(sourceIndex, 1);
      siblings.splice(targetIndex, 0, moved);
      return {
        ...prev,
        contentBlocks: replaceChildrenAtPath(prev.contentBlocks, sourceParent, siblings),
      };
    });
    setDragPath(null);
  };

  const handleUpload = async (
    file: File | undefined,
    target: "banner" | "blockImage" | "blockFile",
    path: number[] = []
  ) => {
    if (!file) return;
    const key = target === "banner" ? "banner" : `${target}-${path.join("-")}`;

    try {
      setUploadingTarget(key);
      const uploaded = await uploadMedia({ file, title: file.name, folder: "pages" });
      if (target === "banner") updateField("bannerImage", uploaded.fileUrl);
      if (target === "blockImage") updateBlock(path, "imageUrl", uploaded.fileUrl);
      if (target === "blockFile") updateBlock(path, "fileUrl", uploaded.fileUrl);
      setMessage("File uploaded successfully. Save the page to publish it.");
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "File upload failed.");
    } finally {
      setUploadingTarget("");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setMessage("Page title is required.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      const payload: PagePayload = {
        ...form,
        slug: undefined,
        contentBlocks: normalizeOrders(form.contentBlocks),
      };

      if (editingPage) {
        await updateAdminPage(editingPage._id, payload);
        setMessage("Page updated successfully.");
      } else {
        await createAdminPage(payload);
        setMessage("Page created successfully.");
      }

      await fetchPages();
      closeForm();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to save page.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (page: CmsPage) => {
    if (!window.confirm(`Delete "${page.title}"? This cannot be undone.`)) return;
    try {
      await deleteAdminPage(page._id);
      setMessage("Page deleted successfully.");
      await fetchPages();
    } catch {
      setMessage("Failed to delete page.");
    }
  };

  const togglePublish = async (page: CmsPage) => {
    try {
      await updateAdminPage(page._id, {
        title: page.title,
        group: page.group,
        subtitle: page.subtitle,
        bannerImage: page.bannerImage,
        shortDescription: page.shortDescription,
        contentBlocks: page.contentBlocks,
        buttonLabel: page.buttonLabel,
        buttonUrl: page.buttonUrl,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        isPublished: !page.isPublished,
      });
      setMessage(!page.isPublished ? "Page published successfully." : "Page moved to draft.");
      await fetchPages();
    } catch {
      setMessage("Failed to update publish status.");
    }
  };

  const handleDropPage = async (target: CmsPage) => {
    if (!draggingPageId || draggingPageId === target._id) return;
    const source = pages.find((page) => page._id === draggingPageId);
    if (!source || source.group !== target.group) {
      setMessage("Pages can be reordered only inside the same group.");
      setDraggingPageId(null);
      return;
    }

    const groupPages = pages.filter((page) => page.group === target.group);
    const sourceIndex = groupPages.findIndex((page) => page._id === source._id);
    const targetIndex = groupPages.findIndex((page) => page._id === target._id);
    const nextGroupPages = [...groupPages];
    const [moved] = nextGroupPages.splice(sourceIndex, 1);
    nextGroupPages.splice(targetIndex, 0, moved);

    setPages((current) => {
      const queue = [...nextGroupPages];
      return current.map((page) => (page.group === target.group ? queue.shift()! : page));
    });

    try {
      await reorderAdminPages(target.group, nextGroupPages.map((page) => page._id));
      setMessage("Page order updated successfully.");
      await fetchPages();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to reorder pages.");
      await fetchPages();
    } finally {
      setDraggingPageId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#005A78]">Content Pages</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Pages Management</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              Create flexible About, For Authors, Issues, and custom pages with rich text, nested blocks, media, tables, embeds, and drag-and-drop ordering.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#005A78] px-5 text-sm font-bold text-white transition hover:bg-[#00465d]"
          >
            <Plus size={18} /> Add Page
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm">
          {message}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">All Pages</h2>
          <p className="text-sm text-slate-500">Drag pages to reorder them within their group.</p>
        </div>
        <select
          value={selectedGroup}
          onChange={(event) => setSelectedGroup(event.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#005A78]"
        >
          {pageGroups.map((item) => (
            <option key={item.label} value={item.value}>{item.label}</option>
          ))}
        </select>
      </div>

      {isFormOpen && (
        <section
          ref={formSectionRef}
          className="mb-6 scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">{editingPage ? "Edit Page" : "Create New Page"}</h2>
              <p className="mt-1 text-sm text-slate-500">The slug is generated automatically from the page title.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#005A78]/20 bg-[#005A78]/5 px-4 text-sm font-bold text-[#005A78] hover:bg-[#005A78]/10"
              >
                <Eye size={17} /> Preview Output
              </button>
              <button type="button" onClick={closeForm} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
                <X size={18} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Page Title</label>
                <input
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#005A78] focus:ring-4 focus:ring-[#005A78]/10"
                  placeholder="Example: About the Journal"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Automatic URL Slug</label>
                <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 font-mono text-sm text-slate-600">
                  {slugPreview || "generated-from-page-title"}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Page Group</label>
                <select
                  value={form.group}
                  onChange={(event) => updateField("group", event.target.value as PageGroup)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#005A78]"
                >
                  <option value="about">About</option>
                  <option value="for-authors">For Authors</option>
                  <option value="reviewers">Reviewers</option>
                  <option value="issues">Issues</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Quick Layout</label>
                <select
                  defaultValue=""
                  onChange={(event) => {
                    if (event.target.value) addPreset(Number(event.target.value));
                    event.target.value = "";
                  }}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#005A78]"
                >
                  <option value="">Add a group-specific layout...</option>
                  {pagePresets[form.group].map((preset, index) => (
                    <option key={preset.label} value={index}>{preset.label}</option>
                  ))}
                </select>
              </div>
              {["for-authors", "reviewers"].includes(form.group) && (
                <div className="lg:col-span-2 rounded-2xl border border-[#005A78]/20 bg-[#005A78]/5 p-4">
                  <p className="text-sm font-bold text-[#005A78]">
                    {form.group === "reviewers" ? "Reviewers page design" : "For Authors page design"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {form.group === "reviewers"
                      ? "The page shows the Reviewers label, page title, subtitle, optional short description and banner at the top. The Reviewers Menu remains on the left and each top-level content block appears as a separate white card."
                      : "The page shows the For Authors label, page title, subtitle, optional short description and banner at the top. Below that, the Author Menu remains on the left and each top-level content block is displayed as a separate white card."}
                  </p>
                </div>
              )}
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Subtitle</label>
                <input
                  value={form.subtitle || ""}
                  onChange={(event) => updateField("subtitle", event.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#005A78]"
                  placeholder="Short subtitle displayed below the page title"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Banner Image
                </label>
                <div className="flex flex-col gap-3 lg:flex-row">
                  <input
                    value={form.bannerImage || ""}
                    onChange={(event) => updateField("bannerImage", event.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#005A78]"
                    placeholder="Paste image URL or upload"
                  />
                  <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#005A78]/20 bg-[#005A78]/5 px-5 text-sm font-bold text-[#005A78]">
                    {uploadingTarget === "banner" ? <Loader2 size={17} className="animate-spin" /> : <Upload size={17} />}
                    Upload Image
                    <input type="file" accept={imageAccept} className="hidden" onChange={(event) => handleUpload(event.target.files?.[0], "banner")} />
                  </label>
                </div>
                {form.bannerImage && <img src={form.bannerImage} alt="Banner preview" className="mt-3 max-h-52 rounded-2xl border border-slate-200 object-cover" />}
              </div>
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Short Description</label>
                <textarea
                  value={form.shortDescription || ""}
                  onChange={(event) => updateField("shortDescription", event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  placeholder="Optional additional summary shown below the subtitle"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-950">Content Blocks</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {form.group === "for-authors"
                      ? "Drag to reorder. Each top-level block becomes one public content card; use Section, Card, Columns, or Notice when several inner blocks must stay inside the same card."
                      : "Drag to reorder. Section, Card, Columns, and Notice blocks can contain other blocks."}
                  </p>
                </div>
                <div className="flex max-w-3xl flex-wrap gap-2">
                  {blockTypes.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => addBlock(item.value)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-[#005A78] hover:text-[#005A78]"
                      >
                        <Icon size={14} /> {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {form.contentBlocks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                  <FileText className="mx-auto text-slate-400" size={34} />
                  <h4 className="mt-3 text-lg font-bold text-slate-800">No blocks yet</h4>
                  <p className="mt-1 text-sm text-slate-500">Choose a block or quick layout above.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {form.contentBlocks.map((block, index) => (
                    <BlockEditor
                      key={block._id || `root-${index}`}
                      block={block}
                      path={[index]}
                      onUpdate={updateBlock}
                      onRemove={removeBlock}
                      onAddChild={addChildBlock}
                      onUpload={(file, target, path) => handleUpload(file, target, path)}
                      uploadingTarget={uploadingTarget}
                      dragPath={dragPath}
                      setDragPath={setDragPath}
                      onDropBlock={dropBlock}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Main Button Label</label>
                <input value={form.buttonLabel || ""} onChange={(event) => updateField("buttonLabel", event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Main Button URL</label>
                <input value={form.buttonUrl || ""} onChange={(event) => updateField("buttonUrl", event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Meta Title</label>
                <input value={form.metaTitle || ""} onChange={(event) => updateField("metaTitle", event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Meta Description</label>
                <input value={form.metaDescription || ""} onChange={(event) => updateField("metaDescription", event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm" />
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center">
              <label className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <input type="checkbox" checked={form.isPublished ?? true} onChange={(event) => updateField("isPublished", event.target.checked)} className="h-4 w-4 accent-[#005A78]" />
                Publish this page
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#005A78]/20 bg-[#005A78]/5 px-5 text-sm font-bold text-[#005A78] hover:bg-[#005A78]/10"
                >
                  <Eye size={18} /> Preview Output
                </button>
                <button type="submit" disabled={saving} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#005A78] px-6 text-sm font-bold text-white hover:bg-[#00465d] disabled:opacity-60">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? "Saving..." : editingPage ? "Update Page" : "Create Page"}
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center"><Loader2 className="animate-spin text-[#005A78]" /></div>
        ) : pages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">No pages found.</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="w-12 px-3 py-4" />
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Page</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Group</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Slug</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Blocks</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Status</th>
                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {pages.map((page) => (
                    <tr
                      key={page._id}
                      draggable
                      onDragStart={() => setDraggingPageId(page._id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleDropPage(page)}
                      onDragEnd={() => setDraggingPageId(null)}
                      className={draggingPageId === page._id ? "bg-cyan-50 opacity-60" : "hover:bg-slate-50/70"}
                    >
                      <td className="px-3 py-4"><GripVertical className="cursor-grab text-slate-400" size={18} /></td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-950">{page.title}</p>
                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">{page.subtitle || "No subtitle"}</p>
                      </td>
                      <td className="px-5 py-4"><span className="rounded-full bg-[#005A78]/10 px-3 py-1 text-xs font-bold text-[#005A78]">{groupLabel(page.group)}</span></td>
                      <td className="px-5 py-4"><code className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{page.slug}</code></td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-700">{page.contentBlocks?.length || 0}</td>
                      <td className="px-5 py-4">
                        <button type="button" onClick={() => togglePublish(page)} className={`rounded-full px-3 py-1 text-xs font-bold ${page.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          {page.isPublished ? "Published" : "Draft"}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {page.isPublished && <Link href={getPublicPageHref(page)} target="_blank" className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700"><ExternalLink size={14} /> View</Link>}
                          <button type="button" onClick={() => openEditForm(page)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700"><Edit size={14} /> Edit</button>
                          <button type="button" onClick={() => handleDelete(page)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-rose-200 px-3 text-xs font-bold text-rose-600"><Trash2 size={14} /> Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {isPreviewOpen && (
        <PagePreviewModal
          form={form}
          pages={pages}
          editingPageId={editingPage?._id}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </AdminLayout>
  );
}
