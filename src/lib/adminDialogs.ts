import Swal, { SweetAlertIcon } from "sweetalert2";

const popupClass =
  "rounded-[24px] border border-slate-200 bg-white px-2 pb-7 pt-3 shadow-2xl";
const titleClass = "text-[22px] font-bold text-[#111433]";
const htmlClass = "text-[14px] leading-6 text-slate-600";
const confirmButtonClass =
  "inline-flex min-w-[112px] items-center justify-center rounded-xl bg-[#111433] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1b2050] focus:outline-none focus:ring-4 focus:ring-[#111433]/15";
const destructiveButtonClass =
  "inline-flex min-w-[112px] items-center justify-center rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-500/20";
const cancelButtonClass =
  "inline-flex min-w-[100px] items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200";
const inputClass =
  "!mx-0 !mt-5 !w-full !rounded-xl !border !border-slate-200 !px-4 !py-3 !text-sm !text-slate-900 !shadow-none focus:!border-[#005A78] focus:!ring-4 focus:!ring-[#005A78]/10";

const baseOptions = {
  buttonsStyling: false,
  reverseButtons: true,
  heightAuto: false,
  customClass: {
    popup: popupClass,
    title: titleClass,
    htmlContainer: htmlClass,
    confirmButton: confirmButtonClass,
    cancelButton: cancelButtonClass,
    input: inputClass,
    actions: "gap-3",
  },
};

type ConfirmAdminActionOptions = {
  title: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  icon?: SweetAlertIcon;
  destructive?: boolean;
};

export const confirmAdminAction = async ({
  title,
  text,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  icon = "warning",
  destructive = false,
}: ConfirmAdminActionOptions) => {
  const result = await Swal.fire({
    ...baseOptions,
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    customClass: {
      ...baseOptions.customClass,
      confirmButton: destructive
        ? destructiveButtonClass
        : confirmButtonClass,
    },
  });

  return result.isConfirmed;
};

type PromptAdminTextOptions = {
  title: string;
  text?: string;
  placeholder?: string;
  initialValue?: string;
  confirmButtonText?: string;
  inputType?: "text" | "url" | "email" | "password";
  requiredMessage?: string;
  minLength?: number;
  minLengthMessage?: string;
};

export const promptAdminText = async ({
  title,
  text,
  placeholder = "",
  initialValue = "",
  confirmButtonText = "Add",
  inputType = "text",
  requiredMessage = "Please enter a value.",
  minLength,
  minLengthMessage,
}: PromptAdminTextOptions) => {
  const result = await Swal.fire({
    ...baseOptions,
    title,
    text,
    input: inputType,
    inputValue: initialValue,
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: "Cancel",
    inputValidator: (value) => {
      const normalizedValue = String(value || "").trim();

      if (!normalizedValue) return requiredMessage;
      if (minLength && normalizedValue.length < minLength) {
        return minLengthMessage || `Enter at least ${minLength} characters.`;
      }

      return undefined;
    },
  });

  if (!result.isConfirmed) return null;
  return String(result.value || "").trim() || null;
};


export type PromptAdminLinkResult = {
  text: string;
  url: string;
};

type PromptAdminLinkOptions = {
  initialText?: string;
  initialUrl?: string;
};

export const promptAdminLink = async ({
  initialText = "",
  initialUrl = "",
}: PromptAdminLinkOptions = {}): Promise<PromptAdminLinkResult | null> => {
  const result = await Swal.fire({
    ...baseOptions,
    title: "Insert link",
    html: `
      <div class="mt-3 grid gap-4 text-left">
        <label class="grid gap-2 text-sm font-semibold text-slate-700">
          Text to display
          <input id="admin-link-text" type="text" autocomplete="off"
            placeholder="Example: Manuscript template"
            class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-[#005A78] focus:ring-4 focus:ring-[#005A78]/10" />
        </label>
        <label class="grid gap-2 text-sm font-semibold text-slate-700">
          Link URL
          <input id="admin-link-url" type="text" autocomplete="off"
            placeholder="https://example.com or /call-for-papers"
            class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-[#005A78] focus:ring-4 focus:ring-[#005A78]/10" />
        </label>
        <p class="text-xs font-normal leading-5 text-slate-500">
          You may use a full URL, an email link, or an internal website path.
        </p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Insert link",
    cancelButtonText: "Cancel",
    focusConfirm: false,
    didOpen: () => {
      const textInput = document.getElementById(
        "admin-link-text"
      ) as HTMLInputElement | null;
      const urlInput = document.getElementById(
        "admin-link-url"
      ) as HTMLInputElement | null;

      if (textInput) textInput.value = initialText;
      if (urlInput) urlInput.value = initialUrl;
      (initialText ? urlInput : textInput)?.focus();
    },
    preConfirm: () => {
      const textInput = document.getElementById(
        "admin-link-text"
      ) as HTMLInputElement | null;
      const urlInput = document.getElementById(
        "admin-link-url"
      ) as HTMLInputElement | null;
      const text = String(textInput?.value || "").trim();
      const url = String(urlInput?.value || "").trim();

      if (!text) {
        Swal.showValidationMessage("Please enter the text that should be visible.");
        textInput?.focus();
        return false;
      }

      if (!url) {
        Swal.showValidationMessage("Please enter the link URL.");
        urlInput?.focus();
        return false;
      }

      return { text, url };
    },
  });

  if (!result.isConfirmed || !result.value) return null;
  return result.value as PromptAdminLinkResult;
};

export const promptTableDimensions = async () => {
  const result = await Swal.fire({
    ...baseOptions,
    title: "Generate editable table",
    html: `
      <div class="mt-3 grid gap-4 text-left">
        <label class="grid gap-2 text-sm font-semibold text-slate-700">
          Rows
          <input id="admin-table-rows" type="number" min="1" max="50" value="4"
            class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-[#005A78] focus:ring-4 focus:ring-[#005A78]/10" />
        </label>
        <label class="grid gap-2 text-sm font-semibold text-slate-700">
          Columns
          <input id="admin-table-columns" type="number" min="1" max="20" value="3"
            class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-[#005A78] focus:ring-4 focus:ring-[#005A78]/10" />
        </label>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Generate table",
    cancelButtonText: "Cancel",
    focusConfirm: false,
    preConfirm: () => {
      const rowsInput = document.getElementById(
        "admin-table-rows"
      ) as HTMLInputElement | null;
      const columnsInput = document.getElementById(
        "admin-table-columns"
      ) as HTMLInputElement | null;

      const rows = Number(rowsInput?.value);
      const columns = Number(columnsInput?.value);

      if (!Number.isInteger(rows) || rows < 1 || rows > 50) {
        Swal.showValidationMessage("Rows must be a whole number between 1 and 50.");
        return false;
      }

      if (!Number.isInteger(columns) || columns < 1 || columns > 20) {
        Swal.showValidationMessage(
          "Columns must be a whole number between 1 and 20."
        );
        return false;
      }

      return { rows, columns };
    },
  });

  if (!result.isConfirmed || !result.value) return null;
  return result.value as { rows: number; columns: number };
};
