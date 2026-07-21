"use client";

import { KeyboardEvent, useLayoutEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Highlighter,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
  Undo2,
  Unlink,
} from "lucide-react";
import { promptAdminLink } from "@/lib/adminDialogs";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
};

const toolbarButtons = [
  { command: "bold", label: "Bold", icon: Bold },
  { command: "italic", label: "Italic", icon: Italic },
  { command: "underline", label: "Underline", icon: Underline },
  { command: "strikeThrough", label: "Strikethrough", icon: Strikethrough },
  { command: "superscript", label: "Superscript", icon: Superscript },
  { command: "subscript", label: "Subscript", icon: Subscript },
  { command: "insertUnorderedList", label: "Bullet list", icon: List },
  { command: "insertOrderedList", label: "Numbered list", icon: ListOrdered },
  { command: "formatBlock", value: "blockquote", label: "Quote", icon: Quote },
  { command: "outdent", label: "Decrease indent", icon: IndentDecrease },
  { command: "indent", label: "Increase indent", icon: IndentIncrease },
  { command: "justifyLeft", label: "Align left", icon: AlignLeft },
  { command: "justifyCenter", label: "Align center", icon: AlignCenter },
  { command: "justifyRight", label: "Align right", icon: AlignRight },
  { command: "justifyFull", label: "Justify", icon: AlignJustify },
  { command: "insertHorizontalRule", label: "Horizontal line", icon: Minus },
  { command: "undo", label: "Undo", icon: Undo2 },
  { command: "redo", label: "Redo", icon: Redo2 },
  { command: "removeFormat", label: "Clear formatting", icon: Eraser },
];

const fontOptions = [
  "Arial",
  "Calibri",
  "Georgia",
  "Tahoma",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
  "Courier New",
];

const listStyleOptions = [
  { value: "disc", label: "Bullets: Disc", tag: "ul" },
  { value: "circle", label: "Bullets: Circle", tag: "ul" },
  { value: "square", label: "Bullets: Square", tag: "ul" },
  { value: "dash", label: "Bullets: Dash", tag: "ul" },
  { value: "check", label: "Bullets: Check", tag: "ul" },
  { value: "arrow", label: "Bullets: Arrow", tag: "ul" },
  { value: "blue-dot", label: "Bullets: Blue dot", tag: "ul" },
  { value: "blue-diamond", label: "Bullets: Blue ❖", tag: "ul" },
  { value: "black-diamond", label: "Bullets: Black ❖", tag: "ul" },
  { value: "decimal", label: "Numbers: 1, 2, 3", tag: "ol" },
  { value: "lower-alpha", label: "Numbers: a, b, c", tag: "ol" },
  { value: "upper-alpha", label: "Numbers: A, B, C", tag: "ol" },
  { value: "lower-roman", label: "Numbers: i, ii, iii", tag: "ol" },
  { value: "upper-roman", label: "Numbers: I, II, III", tag: "ol" },
] as const;

const hasVisibleContent = (html: string) => {
  if (!html) return false;
  const text = html
    .replace(/<br\s*\/?\s*>/gi, "")
    .replace(/&nbsp;/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
  return text.length > 0 || /<(img|video|iframe|table|hr)\b/i.test(html);
};

const getClosestElement = (node: Node | null, selector: string) => {
  const element =
    node?.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node?.parentElement;
  return element?.closest(selector) || null;
};

const LIST_BLOCK_SELECTOR =
  "p, div, h1, h2, h3, h4, h5, h6, blockquote, pre";

const SPACING_BLOCK_SELECTOR =
  "p, h1, h2, h3, h4, h5, h6, li, blockquote, pre";

type ParagraphSpacingAction =
  | "add-before"
  | "remove-before"
  | "add-after"
  | "remove-after"
  | "compact"
  | "normal"
  | "reset";

type SpacingMenuAction =
  | `line:${string}`
  | `paragraph:${ParagraphSpacingAction}`;

const WORD_PARAGRAPH_SPACE = "8pt";

const getDirectEditorChild = (node: Node | null, editor: HTMLElement) => {
  let current = node;

  if (current === editor) return null;

  while (current?.parentNode && current.parentNode !== editor) {
    current = current.parentNode;
  }

  return current?.parentNode === editor ? current : null;
};

const isListElement = (
  element: Element | null,
): element is HTMLOListElement | HTMLUListElement =>
  Boolean(element && (element.tagName === "UL" || element.tagName === "OL"));

type SelectionPointBookmark = {
  path: number[];
  offset: number;
};

type SelectionBookmark = {
  start: SelectionPointBookmark;
  end: SelectionPointBookmark;
};

const getNodePath = (root: Node, node: Node): number[] | null => {
  if (node === root) return [];

  const path: number[] = [];
  let current: Node | null = node;

  while (current && current !== root) {
    const parent: Node | null = current.parentNode;
    if (!parent) return null;

    const index = Array.prototype.indexOf.call(parent.childNodes, current);
    if (index < 0) return null;

    path.unshift(index);
    current = parent;
  }

  return current === root ? path : null;
};

const resolveNodePath = (root: Node, path: number[]) => {
  let current: Node = root;

  for (const index of path) {
    const next = current.childNodes[index];
    if (!next) return null;
    current = next;
  }

  return current;
};

const clampRangeOffset = (node: Node, offset: number) => {
  const maximum =
    node.nodeType === Node.TEXT_NODE
      ? node.textContent?.length || 0
      : node.childNodes.length;
  return Math.max(0, Math.min(maximum, offset));
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write content here...",
  minHeight = 160,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const selectionBookmarkRef = useRef<SelectionBookmark | null>(null);
  const lastEmittedValueRef = useRef(value || "");
  const [isEmpty, setIsEmpty] = useState(!hasVisibleContent(value || ""));

  /*
   * Keep the editable area uncontrolled while the user is typing.
   * Re-applying dangerouslySetInnerHTML on every parent render resets the
   * browser selection and sends the caret back to the beginning.
   */
  useLayoutEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const nextValue = value || "";
    const isEditing =
      document.activeElement === editor || editor.contains(document.activeElement);

    if (!isEditing && editor.innerHTML !== nextValue) {
      editor.innerHTML = nextValue;
    }

    if (!isEditing) {
      lastEmittedValueRef.current = nextValue;
      setIsEmpty(!hasVisibleContent(nextValue));
    }
  }, [value]);

  const rememberSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;

    savedRangeRef.current = range.cloneRange();

    const startPath = getNodePath(editor, range.startContainer);
    const endPath = getNodePath(editor, range.endContainer);
    if (startPath && endPath) {
      selectionBookmarkRef.current = {
        start: { path: startPath, offset: range.startOffset },
        end: { path: endPath, offset: range.endOffset },
      };
    }
  };

  const restoreSelection = (): Range | null => {
    const editor = editorRef.current;
    if (!editor) return null;

    let range = savedRangeRef.current;

    if (!range || !editor.contains(range.commonAncestorContainer)) {
      const bookmark = selectionBookmarkRef.current;
      if (!bookmark) return null;

      const startNode = resolveNodePath(editor, bookmark.start.path);
      const endNode = resolveNodePath(editor, bookmark.end.path);
      if (!startNode || !endNode) return null;

      range = document.createRange();
      try {
        range.setStart(
          startNode,
          clampRangeOffset(startNode, bookmark.start.offset)
        );
        range.setEnd(endNode, clampRangeOffset(endNode, bookmark.end.offset));
      } catch {
        return null;
      }

      savedRangeRef.current = range.cloneRange();
    }

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    return range;
  };

  const emitChange = () => {
    const html = editorRef.current?.innerHTML || "";
    lastEmittedValueRef.current = html;
    setIsEmpty(!hasVisibleContent(html));
    onChange(html);
    rememberSelection();
  };

  const runCommand = (command: string, commandValue?: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus({ preventScroll: true });
    restoreSelection();
    document.execCommand(command, false, commandValue);
    rememberSelection();
    emitChange();
  };

  const getSelectedSpacingBlocks = (allowWrap = true): HTMLElement[] => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return [];

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return [];

    if (range.collapsed) {
      const closest = getClosestElement(
        range.startContainer,
        SPACING_BLOCK_SELECTOR,
      ) as HTMLElement | null;

      if (closest && editor.contains(closest)) return [closest];
    }

    const intersecting = Array.from(
      editor.querySelectorAll<HTMLElement>(SPACING_BLOCK_SELECTOR),
    ).filter((element) => {
      try {
        return range.intersectsNode(element);
      } catch {
        return false;
      }
    });

    // Prefer the deepest matching blocks. This keeps a list operation on its
    // individual <li> elements instead of also styling a surrounding block.
    const deepest = intersecting.filter(
      (element) =>
        !intersecting.some(
          (other) => other !== element && element.contains(other),
        ),
    );

    if (deepest.length > 0) return deepest;

    if (allowWrap) {
      // Plain text can exist directly inside contentEditable. Convert the
      // current line to a paragraph so spacing has a stable HTML element to
      // attach to and remains visible in previews and public pages.
      document.execCommand("formatBlock", false, "p");
      rememberSelection();
      return getSelectedSpacingBlocks(false);
    }

    return [];
  };

  const applySpacingStyle = (
    property: "line-height",
    value?: string,
  ) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus({ preventScroll: true });
    restoreSelection();

    const blocks = getSelectedSpacingBlocks();
    if (blocks.length === 0) return;

    blocks.forEach((block) => {
      if (value === undefined) block.style.removeProperty(property);
      else block.style.setProperty(property, value);
    });

    rememberSelection();
    emitChange();
  };

  const getListBoundary = (block: HTMLElement) => {
    if (block.tagName !== "LI") return null;

    const list = block.parentElement;
    if (!list || !isListElement(list)) return null;

    const listItems = Array.from(list.children).filter(
      (child): child is HTMLLIElement => child.tagName === "LI",
    );

    return {
      list,
      isFirst: listItems[0] === block,
      isLast: listItems[listItems.length - 1] === block,
    };
  };

  const setParagraphMargin = (
    block: HTMLElement,
    side: "top" | "bottom",
    value?: string,
  ) => {
    const property = side === "top" ? "margin-top" : "margin-bottom";
    const boundary = getListBoundary(block);

    // In HTML, the space between a list and the paragraph outside it belongs
    // to the <ul>/<ol>, not to its final <li>. Mirror Word's paragraph
    // spacing behaviour by updating the list boundary when the first or last
    // bullet is selected. This is what makes “Remove space after” work between
    // a bullet list and the normal paragraph that follows it.
    if (boundary) {
      const controlsOuterList =
        (side === "top" && boundary.isFirst) ||
        (side === "bottom" && boundary.isLast);

      if (controlsOuterList) {
        if (value === undefined) {
          boundary.list.style.removeProperty(property);
          block.style.removeProperty(property);

          const neighbour =
            side === "top"
              ? boundary.list.previousElementSibling
              : boundary.list.nextElementSibling;
          const neighbourProperty =
            side === "top" ? "margin-bottom" : "margin-top";
          if (
            neighbour instanceof HTMLElement &&
            neighbour.style.getPropertyValue(neighbourProperty) === "0px"
          ) {
            neighbour.style.removeProperty(neighbourProperty);
          }
        } else {
          boundary.list.style.setProperty(property, value);
          block.style.setProperty(property, "0px");

          // Avoid two independent margins at the same visual boundary. This
          // lets either “Remove space after” on the last bullet or “Remove
          // space before” on the following paragraph close the same gap.
          const neighbour =
            side === "top"
              ? boundary.list.previousElementSibling
              : boundary.list.nextElementSibling;
          const neighbourProperty =
            side === "top" ? "margin-bottom" : "margin-top";
          if (neighbour instanceof HTMLElement) {
            neighbour.style.setProperty(neighbourProperty, "0px");
          }
        }
        return;
      }

      if (value === undefined) block.style.removeProperty(property);
      else block.style.setProperty(property, value);
      return;
    }

    if (value === undefined) {
      block.style.removeProperty(property);

      const neighbour =
        side === "top"
          ? block.previousElementSibling
          : block.nextElementSibling;
      const neighbourProperty = side === "top" ? "margin-bottom" : "margin-top";
      if (
        neighbour instanceof HTMLElement &&
        neighbour.style.getPropertyValue(neighbourProperty) === "0px"
      ) {
        neighbour.style.removeProperty(neighbourProperty);
      }
      return;
    }

    block.style.setProperty(property, value);

    // Normal paragraphs and lists share one visual boundary. Neutralise the
    // opposite margin on the neighbouring block so spacing behaves as one
    // Word-style before/after value instead of two CSS margins adding up.
    const neighbour =
      side === "top"
        ? block.previousElementSibling
        : block.nextElementSibling;
    const neighbourProperty = side === "top" ? "margin-bottom" : "margin-top";
    if (neighbour instanceof HTMLElement) {
      neighbour.style.setProperty(neighbourProperty, "0px");
    }
  };

  const applyParagraphSpacing = (action: ParagraphSpacingAction) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus({ preventScroll: true });
    restoreSelection();

    const blocks = getSelectedSpacingBlocks();
    if (blocks.length === 0) return;

    blocks.forEach((block) => {
      if (action === "add-before") {
        setParagraphMargin(block, "top", WORD_PARAGRAPH_SPACE);
      }

      if (action === "remove-before") {
        setParagraphMargin(block, "top", "0px");
      }

      if (action === "add-after") {
        setParagraphMargin(block, "bottom", WORD_PARAGRAPH_SPACE);
      }

      if (action === "remove-after") {
        setParagraphMargin(block, "bottom", "0px");
      }

      if (action === "compact") {
        setParagraphMargin(block, "top", "0px");
        setParagraphMargin(block, "bottom", "0px");
      }

      if (action === "normal") {
        setParagraphMargin(block, "top", "0px");
        setParagraphMargin(block, "bottom", WORD_PARAGRAPH_SPACE);
      }

      if (action === "reset") {
        setParagraphMargin(block, "top");
        setParagraphMargin(block, "bottom");
      }
    });

    rememberSelection();
    emitChange();
  };

  const applySpacingMenuAction = (action: SpacingMenuAction) => {
    if (action.startsWith("line:")) {
      const value = action.slice("line:".length);
      applySpacingStyle("line-height", value === "default" ? undefined : value);
      return;
    }

    applyParagraphSpacing(
      action.slice("paragraph:".length) as ParagraphSpacingAction,
    );
  };

  const insertLink = async () => {
    rememberSelection();

    const editor = editorRef.current;
    const savedRange = savedRangeRef.current;
    if (!editor || !savedRange) return;

    const selectedAnchor = getClosestElement(savedRange.startContainer, "a");
    const sameAnchor =
      selectedAnchor &&
      selectedAnchor === getClosestElement(savedRange.endContainer, "a")
        ? (selectedAnchor as HTMLAnchorElement)
        : null;

    const selectedText = savedRange.collapsed
      ? sameAnchor?.textContent?.trim() || ""
      : savedRange.toString().trim();

    const link = await promptAdminLink({
      initialText: selectedText,
      initialUrl: sameAnchor?.getAttribute("href") || "",
    });
    if (!link) return;

    editor.focus({ preventScroll: true });
    const range = restoreSelection();

    if (sameAnchor && editor.contains(sameAnchor)) {
      sameAnchor.textContent = link.text;
      sameAnchor.setAttribute("href", link.url);

      const caretRange = document.createRange();
      caretRange.setStartAfter(sameAnchor);
      caretRange.collapse(true);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(caretRange);
      savedRangeRef.current = caretRange.cloneRange();
      rememberSelection();
      emitChange();
      return;
    }

    const anchor = document.createElement("a");
    anchor.setAttribute("href", link.url);
    anchor.textContent = link.text;

    if (range) {
      range.deleteContents();
      range.insertNode(anchor);
    } else {
      if (editor.textContent?.trim()) {
        editor.append(document.createTextNode(" "));
      }
      editor.append(anchor);
    }

    const caretRange = document.createRange();
    caretRange.setStartAfter(anchor);
    caretRange.collapse(true);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(caretRange);
    savedRangeRef.current = caretRange.cloneRange();
    rememberSelection();
    emitChange();
  };

  const applyBlock = (tag: string) => runCommand("formatBlock", tag);

  const placeCaret = (element: Element, atStart = false) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(atStart);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    savedRangeRef.current = range.cloneRange();
  };

  const manuallyToggleList = (targetTag: "ul" | "ol") => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedListItem = getClosestElement(range.startContainer, "li");
    const selectedList = selectedListItem?.closest("ul, ol") || null;

    if (isListElement(selectedList) && editor.contains(selectedList)) {
      if (selectedList.tagName.toLowerCase() !== targetTag) {
        const replacementList = document.createElement(targetTag);
        replacementList.append(...Array.from(selectedList.childNodes));
        selectedList.replaceWith(replacementList);

        const selectedIndex = selectedListItem
          ? Array.from(replacementList.children).indexOf(selectedListItem)
          : 0;
        const targetItem = replacementList.children[Math.max(0, selectedIndex)];
        placeCaret(targetItem || replacementList);
        return;
      }

      const replacementBlocks: HTMLElement[] = [];
      const fragment = document.createDocumentFragment();

      Array.from(selectedList.children).forEach((child) => {
        if (child.tagName !== "LI") return;

        const paragraph = document.createElement("p");
        while (child.firstChild) paragraph.appendChild(child.firstChild);
        if (!paragraph.hasChildNodes()) paragraph.appendChild(document.createElement("br"));
        replacementBlocks.push(paragraph);
        fragment.appendChild(paragraph);
      });

      selectedList.replaceWith(fragment);
      placeCaret(replacementBlocks[0] || editor);
      return;
    }

    let selectedNodes: Node[] = [];

    if (range.collapsed) {
      const directChild = getDirectEditorChild(range.startContainer, editor);
      if (directChild) selectedNodes = [directChild];
    } else {
      selectedNodes = Array.from(editor.childNodes).filter((node) => {
        try {
          return range.intersectsNode(node);
        } catch {
          return false;
        }
      });
    }

    if (selectedNodes.length === 0) {
      const nearestBlock = getClosestElement(range.startContainer, LIST_BLOCK_SELECTOR);
      if (nearestBlock && editor.contains(nearestBlock)) {
        const directChild = getDirectEditorChild(nearestBlock, editor);
        if (directChild) selectedNodes = [directChild];
      }
    }

    if (selectedNodes.length === 0) {
      const paragraph = document.createElement("p");
      paragraph.appendChild(document.createElement("br"));
      editor.appendChild(paragraph);
      selectedNodes = [paragraph];
    }

    const list = document.createElement(targetTag);
    const listItems: HTMLLIElement[] = [];
    const firstNode = selectedNodes[0];

    firstNode.parentNode?.insertBefore(list, firstNode);

    selectedNodes.forEach((node) => {
      if (node === list || !editor.contains(node)) return;

      if (node.nodeType === Node.ELEMENT_NODE && isListElement(node as Element)) {
        Array.from((node as Element).children).forEach((child) => {
          if (child.tagName !== "LI") return;
          const item = document.createElement("li");
          while (child.firstChild) item.appendChild(child.firstChild);
          list.appendChild(item);
          listItems.push(item);
        });
        node.parentNode?.removeChild(node);
        return;
      }

      const item = document.createElement("li");

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        while (element.firstChild) item.appendChild(element.firstChild);
        element.remove();
      } else {
        item.appendChild(node);
      }

      if (!item.hasChildNodes()) item.appendChild(document.createElement("br"));
      list.appendChild(item);
      listItems.push(item);
    });

    if (listItems.length === 0) {
      const item = document.createElement("li");
      item.appendChild(document.createElement("br"));
      list.appendChild(item);
      listItems.push(item);
    }

    placeCaret(listItems[0]);
  };

  const toggleList = (targetTag: "ul" | "ol") => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus({ preventScroll: true });
    restoreSelection();

    const beforeHtml = editor.innerHTML;
    const command = targetTag === "ul" ? "insertUnorderedList" : "insertOrderedList";
    document.execCommand(command, false);

    // Chromium normally handles list creation and removal. Some content states
    // (especially pasted text or direct text nodes) make execCommand return
    // without changing the DOM, so use a DOM-based fallback in that case.
    if (editor.innerHTML === beforeHtml) {
      restoreSelection();
      manuallyToggleList(targetTag);
    }

    rememberSelection();
    emitChange();
  };

  const applyListStyle = (styleName: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const option = listStyleOptions.find((item) => item.value === styleName);
    if (!option) return;

    editor.focus({ preventScroll: true });
    restoreSelection();

    const findSelectedList = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return null;

      const range = selection.getRangeAt(0);
      const startList = getClosestElement(range.startContainer, "ul, ol");
      if (!isListElement(startList) || !editor.contains(startList)) return null;

      return startList;
    };

    let list = findSelectedList();

    // When normal text is selected, create a list first. The fallback is kept
    // because Chromium can occasionally ignore execCommand after a toolbar
    // control receives focus.
    if (!list) {
      const beforeHtml = editor.innerHTML;
      const command = option.tag === "ul" ? "insertUnorderedList" : "insertOrderedList";
      document.execCommand(command, false);
      list = findSelectedList();

      if (!list || editor.innerHTML === beforeHtml) {
        restoreSelection();
        manuallyToggleList(option.tag);
        list = findSelectedList();
      }
    }

    if (!list || !editor.contains(list)) return;

    if (list.tagName.toLowerCase() !== option.tag) {
      const replacement = document.createElement(option.tag);
      replacement.append(...Array.from(list.childNodes));
      list.replaceWith(replacement);
      list = replacement;
    }

    // Use both an attribute and a class. The class makes the marker styling
    // reliable inside contentEditable and after the HTML is saved/rendered.
    const knownClasses = listStyleOptions.map(
      (item) => `cms-list-${item.value}`,
    );
    list.classList.remove(...knownClasses);
    list.classList.add(`cms-list-${option.value}`);
    list.setAttribute("data-list-style", option.value);

    if (["blue-dot", "blue-diamond", "black-diamond", "dash", "check", "arrow"].includes(option.value)) {
      list.style.setProperty("list-style", "none", "important");
    } else {
      list.style.removeProperty("list-style");
      list.style.removeProperty("list-style-type");
    }

    const firstItem = Array.from(list.children).find(
      (child) => child.tagName === "LI",
    );
    if (firstItem) placeCaret(firstItem);

    rememberSelection();
    emitChange();
  };

  const moveCaretToElement = (element: Element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(true);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    savedRangeRef.current = range.cloneRange();
  };

  const handleTabKey = (event: KeyboardEvent<HTMLDivElement>) => {
    event.preventDefault();

    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const currentCell = getClosestElement(range.startContainer, "td, th");

    if (currentCell) {
      const table = currentCell.closest("table");
      const cells = table ? Array.from(table.querySelectorAll("th, td")) : [];
      const currentIndex = cells.indexOf(currentCell as HTMLTableCellElement);
      const nextIndex = event.shiftKey ? currentIndex - 1 : currentIndex + 1;
      const targetCell = cells[nextIndex];

      if (targetCell) {
        moveCaretToElement(targetCell);
        return;
      }
    }

    const currentListItem = getClosestElement(range.startContainer, "li");
    if (currentListItem) {
      document.execCommand(event.shiftKey ? "outdent" : "indent");
    } else if (event.shiftKey) {
      document.execCommand("outdent");
    } else {
      document.execCommand("insertHTML", false, "&nbsp;&nbsp;&nbsp;&nbsp;");
    }

    rememberSelection();
    emitChange();
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-[#005A78] focus-within:ring-2 focus-within:ring-[#005A78]/10">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
        <select
          defaultValue="p"
          onMouseDown={rememberSelection}
          onChange={(event) => applyBlock(event.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700"
          aria-label="Text style"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
          <option value="pre">Preformatted</option>
        </select>

        <select
          defaultValue=""
          onMouseDown={rememberSelection}
          onChange={(event) => {
            if (!event.target.value) return;
            runCommand("fontName", event.target.value);
            event.currentTarget.value = "";
          }}
          className="h-8 max-w-[155px] rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700"
          aria-label="Font family"
        >
          <option value="" disabled>Font family</option>
          {fontOptions.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>

        <select
          defaultValue=""
          onPointerDownCapture={rememberSelection}
          onMouseDown={rememberSelection}
          onChange={(event) => {
            const selectedStyle = event.currentTarget.value;
            if (!selectedStyle) return;
            applyListStyle(selectedStyle);
            event.currentTarget.value = "";
          }}
          className="h-8 max-w-[205px] rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700"
          aria-label="List style"
        >
          <option value="" disabled>List style</option>
          {listStyleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          defaultValue="3"
          onMouseDown={rememberSelection}
          onChange={(event) => runCommand("fontSize", event.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700"
          aria-label="Font size"
        >
          <option value="1">Very small</option>
          <option value="2">Small</option>
          <option value="3">Normal</option>
          <option value="4">Large</option>
          <option value="5">Larger</option>
          <option value="6">Very large</option>
          <option value="7">Largest</option>
        </select>

        <select
          defaultValue=""
          onMouseDown={rememberSelection}
          onChange={(event) => {
            const action = event.target.value as SpacingMenuAction | "";
            if (!action) return;

            applySpacingMenuAction(action);
            event.currentTarget.value = "";
          }}
          className="h-8 max-w-[190px] rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700"
          aria-label="Line and paragraph spacing"
          title="Word-style line and paragraph spacing"
        >
          <option value="" disabled>Line &amp; paragraph spacing</option>
          <optgroup label="Line spacing">
            <option value="line:1">1.0</option>
            <option value="line:1.15">1.15</option>
            <option value="line:1.5">1.5</option>
            <option value="line:2">2.0</option>
            <option value="line:2.5">2.5</option>
            <option value="line:3">3.0</option>
            <option value="line:default">Reset line spacing</option>
          </optgroup>
          <optgroup label="Paragraph spacing">
            <option value="paragraph:add-before">Add space before paragraph</option>
            <option value="paragraph:remove-before">Remove space before paragraph</option>
            <option value="paragraph:add-after">Add space after paragraph</option>
            <option value="paragraph:remove-after">Remove space after paragraph</option>
            <option value="paragraph:compact">No paragraph space</option>
            <option value="paragraph:normal">Normal: 8 pt after</option>
            <option value="paragraph:reset">Reset paragraph spacing</option>
          </optgroup>
        </select>

        {toolbarButtons.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={`${item.command}-${item.label}`}
              type="button"
              title={item.label}
              onMouseDown={(event) => {
                event.preventDefault();
                rememberSelection();
              }}
              onClick={() => {
                if (item.command === "insertUnorderedList") {
                  toggleList("ul");
                  return;
                }

                if (item.command === "insertOrderedList") {
                  toggleList("ol");
                  return;
                }

                runCommand(item.command, item.value);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-[#005A78]"
            >
              <Icon size={15} />
            </button>
          );
        })}

        <button
          type="button"
          title="Insert link"
          onMouseDown={(event) => {
            event.preventDefault();
            rememberSelection();
          }}
          onClick={insertLink}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-[#005A78]"
        >
          <Link2 size={15} />
        </button>

        <button
          type="button"
          title="Remove link"
          onMouseDown={(event) => {
            event.preventDefault();
            rememberSelection();
          }}
          onClick={() => runCommand("unlink")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-[#005A78]"
        >
          <Unlink size={15} />
        </button>

        <label
          title="Text color"
          onMouseDown={rememberSelection}
          className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-[#005A78]"
        >
          <span className="text-sm font-black">A</span>
          <input
            type="color"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(event) => runCommand("foreColor", event.target.value)}
          />
        </label>

        <label
          title="Highlight color"
          onMouseDown={rememberSelection}
          className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-[#005A78]"
        >
          <Highlighter size={15} />
          <input
            type="color"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(event) => runCommand("hiliteColor", event.target.value)}
          />
        </label>
      </div>

      <div className="relative">
        {isEmpty && (
          <span className="pointer-events-none absolute left-4 top-3 text-sm text-slate-400">
            {placeholder}
          </span>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          spellCheck
          onFocus={rememberSelection}
          onInput={emitChange}
          onBlur={emitChange}
          onMouseUp={rememberSelection}
          onKeyUp={rememberSelection}
          onKeyDown={(event) => {
            if (event.key === "Tab") handleTabKey(event);
          }}
          className="cms-rich-text max-w-none whitespace-pre-wrap px-4 py-3 text-sm leading-7 text-slate-700 outline-none"
          style={{ minHeight }}
        />
      </div>
    </div>
  );
}
