"use client";

import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";

type Identifiable = { _id: string };

type SortableAdminListProps<T extends Identifiable> = {
  items: T[];
  disabled?: boolean;
  className?: string;
  handlePosition?: "top" | "center";
  onReorder: (items: T[]) => void | Promise<unknown>;
  renderItem: (item: T, index: number) => ReactNode;
};

type ActiveDrag = {
  id: string;
  pointerId: number;
  startY: number;
  pointerY: number;
  ghost: HTMLElement;
  scrollParent: HTMLElement | null;
  frame: number | null;
};

const EDGE_DISTANCE = 125;
const MAX_SCROLL_STEP = 22;

function findScrollParent(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement;
  while (parent && parent !== document.body && parent !== document.documentElement) {
    const style = window.getComputedStyle(parent);
    if (/auto|scroll/.test(style.overflowY) && parent.scrollHeight > parent.clientHeight + 2) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null; // The document itself scrolls.
}

function sameOrder(a: string[], b: string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

/**
 * Dependency-free sortable list. Drag by its dedicated handle, not by buttons
 * inside a card. A floating copy follows the pointer while the actual row is
 * a dashed drop placeholder. The document/scroll parent auto-scrolls at edges.
 * The caller saves ONE final order when the pointer is released.
 */
export default function SortableAdminList<T extends Identifiable>({
  items,
  disabled = false,
  className = "space-y-3",
  handlePosition = "center",
  onReorder,
  renderItem,
}: SortableAdminListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef(items);
  const onReorderRef = useRef(onReorder);
  const activeRef = useRef<ActiveDrag | null>(null);
  const previewRef = useRef<string[] | null>(null);
  const detachRef = useRef<(() => void) | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewIds, setPreviewIds] = useState<string[] | null>(null);

  itemsRef.current = items;
  onReorderRef.current = onReorder;

  const renderedItems = useMemo(() => {
    if (!previewIds) return items;
    const byId = new Map(items.map((item) => [item._id, item]));
    if (previewIds.length !== items.length || previewIds.some((id) => !byId.has(id))) {
      return items;
    }
    return previewIds.map((id) => byId.get(id)!);
  }, [items, previewIds]);

  const updateTarget = useCallback((pointerY: number) => {
    const drag = activeRef.current;
    const container = containerRef.current;
    if (!drag || !container) return;

    // Row positions are measured after every scroll as well as pointer move.
    // Counting centres yields a real, stable before/after insertion position.
    const siblings = Array.from(
      container.querySelectorAll<HTMLElement>("[data-admin-sort-id]"),
    ).filter((element) => element.dataset.adminSortId !== drag.id);
    const withoutDragged = siblings.map((element) => element.dataset.adminSortId || "");
    let insertAt = withoutDragged.length;
    for (let index = 0; index < siblings.length; index++) {
      const rect = siblings[index].getBoundingClientRect();
      if (pointerY < rect.top + rect.height / 2) {
        insertAt = index;
        break;
      }
    }

    const next = [...withoutDragged];
    next.splice(insertAt, 0, drag.id);
    const current = previewRef.current || itemsRef.current.map((item) => item._id);
    if (!sameOrder(next, current)) {
      previewRef.current = next;
      setPreviewIds(next);
    }
  }, []);

  const releaseDrag = useCallback((commit: boolean) => {
    const drag = activeRef.current;
    if (!drag) return;

    if (drag.frame !== null) window.cancelAnimationFrame(drag.frame);
    detachRef.current?.();
    detachRef.current = null;
    drag.ghost.remove();
    activeRef.current = null;

    const orderedIds = previewRef.current;
    const currentItems = itemsRef.current;
    previewRef.current = null;
    setPreviewIds(null);
    setActiveId(null);
    document.body.style.removeProperty("user-select");

    if (!commit || !orderedIds || sameOrder(orderedIds, currentItems.map((item) => item._id))) {
      return;
    }

    const byId = new Map(currentItems.map((item) => [item._id, item]));
    const sorted = orderedIds.map((id) => byId.get(id)).filter((item): item is T => Boolean(item));
    if (sorted.length === currentItems.length) {
      void onReorderRef.current(sorted);
    }
  }, []);

  const startDrag = useCallback((event: ReactPointerEvent<HTMLButtonElement>, id: string) => {
    if (disabled || activeRef.current || !event.isPrimary || event.button !== 0) return;
    const row = Array.from(
      containerRef.current?.querySelectorAll<HTMLElement>("[data-admin-sort-id]") || [],
    ).find((element) => element.dataset.adminSortId === id);
    if (!row) return;

    event.preventDefault();
    event.stopPropagation();
    const rect = row.getBoundingClientRect();
    const ghost = row.cloneNode(true) as HTMLElement;
    ghost.removeAttribute("data-admin-sort-id");
    ghost.setAttribute("aria-hidden", "true");
    ghost.setAttribute("inert", "");
    ghost.style.cssText = [
      "position:fixed", `left:${rect.left}px`, `top:${rect.top}px`,
      `width:${rect.width}px`, "margin:0", "z-index:10000", "pointer-events:none",
      "transform:translate3d(0,0,0)", "transition:none", "will-change:transform",
      "opacity:.96", "box-shadow:0 24px 65px rgba(4,49,71,.23)",
      "border-radius:18px", "overflow:hidden", "max-height:65vh",
      "background-color:white", "outline:2px solid rgba(0,90,120,.55)",
    ].join(";");
    document.body.appendChild(ghost);

    activeRef.current = {
      id,
      pointerId: event.pointerId,
      startY: event.clientY,
      pointerY: event.clientY,
      ghost,
      scrollParent: findScrollParent(row),
      frame: null,
    };
    previewRef.current = itemsRef.current.map((item) => item._id);
    setActiveId(id);
    document.body.style.setProperty("user-select", "none");

    const onMove = (moveEvent: PointerEvent) => {
      const current = activeRef.current;
      if (!current || moveEvent.pointerId !== current.pointerId) return;
      if (moveEvent.cancelable) moveEvent.preventDefault();
      current.pointerY = moveEvent.clientY;
      current.ghost.style.transform = `translate3d(0,${moveEvent.clientY - current.startY}px,0)`;
      updateTarget(moveEvent.clientY);
    };
    const onUp = (upEvent: PointerEvent) => {
      if (activeRef.current?.pointerId === upEvent.pointerId) releaseDrag(true);
    };
    const onCancel = (cancelEvent: PointerEvent) => {
      if (activeRef.current?.pointerId === cancelEvent.pointerId) releaseDrag(false);
    };
    const onKey = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === "Escape" && activeRef.current) {
        keyEvent.preventDefault();
        releaseDrag(false);
      }
    };
    const onBlur = () => releaseDrag(false);

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey);
    window.addEventListener("blur", onBlur);
    detachRef.current = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", onBlur);
    };

    const autoScroll = () => {
      const current = activeRef.current;
      if (!current) return;
      const { scrollParent, pointerY } = current;
      const top = scrollParent ? scrollParent.getBoundingClientRect().top : 0;
      const bottom = scrollParent ? scrollParent.getBoundingClientRect().bottom : window.innerHeight;
      const topSafe = scrollParent ? top : Math.max(top, 64); // sticky admin header
      const distanceTop = pointerY - topSafe;
      const distanceBottom = bottom - pointerY;
      let delta = 0;
      if (distanceTop < EDGE_DISTANCE) {
        delta = -Math.min(MAX_SCROLL_STEP, Math.max(0, (EDGE_DISTANCE - distanceTop) / EDGE_DISTANCE) * MAX_SCROLL_STEP);
      } else if (distanceBottom < EDGE_DISTANCE) {
        delta = Math.min(MAX_SCROLL_STEP, Math.max(0, (EDGE_DISTANCE - distanceBottom) / EDGE_DISTANCE) * MAX_SCROLL_STEP);
      }

      if (delta !== 0) {
        if (scrollParent) {
          const before = scrollParent.scrollTop;
          scrollParent.scrollTop += delta;
          if (scrollParent.scrollTop !== before) updateTarget(pointerY);
        } else {
          const before = window.scrollY;
          window.scrollBy(0, delta);
          if (window.scrollY !== before) updateTarget(pointerY);
        }
      }
      current.frame = window.requestAnimationFrame(autoScroll);
    };
    activeRef.current.frame = window.requestAnimationFrame(autoScroll);
  }, [disabled, releaseDrag, updateTarget]);

  useEffect(() => () => releaseDrag(false), [releaseDrag]);

  return (
    <div ref={containerRef} className={className} aria-label="Sortable content list">
      {renderedItems.map((item, index) => (
        <motion.div
          layout="position"
          key={item._id}
          data-admin-sort-id={item._id}
          transition={{ layout: { type: "spring", stiffness: 460, damping: 39 } }}
          className={`relative rounded-2xl ${activeId === item._id ? "z-10 bg-cyan-50/50" : ""}`}
        >
          <div className={activeId === item._id ? "pointer-events-none opacity-0" : ""}>
            {renderItem(item, index)}
          </div>
          {activeId === item._id ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#007C9D] bg-[#E9F8FC]/80 text-sm font-bold text-[#005A78]">
              <GripVertical className="h-5 w-5" /> Drop here
            </div>
          ) : null}
          {!disabled && (
            <button
              type="button"
              aria-label={`Drag item ${index + 1} to rearrange`}
              title="Hold and drag to move; use arrow buttons for precise moves"
              className={`absolute left-2 z-20 flex h-10 w-7 cursor-grab touch-none items-center justify-center rounded-lg border border-transparent text-slate-400 transition hover:border-[#005A78]/20 hover:bg-white hover:text-[#005A78] active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-[#005A78] ${handlePosition === "top" ? "top-4" : "top-1/2 -translate-y-1/2"}`}
              style={{ touchAction: "none" }}
              onPointerDown={(event) => startDrag(event, item._id)}
            >
              <GripVertical className="h-5 w-5" />
            </button>
          )}
        </motion.div>
      ))}
    </div>
  );
}
