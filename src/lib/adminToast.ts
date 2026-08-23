"use client";

import Swal from "sweetalert2";

export const showAdminSuccessToast = (message = "Saved successfully") => {
  return Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: message,
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
    heightAuto: false,
    customClass: {
      popup:
        "!w-auto !max-w-[360px] !rounded-2xl !border !border-emerald-200 !bg-white !px-4 !py-3 !shadow-2xl",
      title: "!m-0 !text-[14px] !font-bold !text-slate-800",
      timerProgressBar: "!bg-emerald-500",
    },
  });
};
