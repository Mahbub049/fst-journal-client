"use client";

import Swal from "sweetalert2";

export const showAdminSuccessToast = (message = "Saved successfully") => {
  return Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    iconColor: "#7de4ee",
    title: message,
    showConfirmButton: false,
    timer: 2100,
    timerProgressBar: false,
    heightAuto: false,
    background: "#071a33",
    color: "#ffffff",
    padding: "0.8rem 1rem",
    showClass: {
      popup: "swal2-show",
    },
    hideClass: {
      popup: "swal2-hide",
    },
    customClass: {
      popup:
        "!flex !w-auto !min-w-[250px] !max-w-[360px] !items-center !gap-3 !rounded-[18px] !border !border-[#7de4ee]/30 !bg-[#071a33] !px-4 !py-3 !shadow-[0_18px_50px_rgba(2,12,27,0.28)]",
      icon:
        "!m-0 !h-8 !w-8 !min-w-8 !border-[2px] !text-[16px]",
      title:
        "!m-0 !p-0 !text-left !text-[13px] !font-bold !leading-5 !text-white",
    },
  });
};
