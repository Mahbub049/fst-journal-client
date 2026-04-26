"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type SearchInputProps = {
  placeholder?: string;
};

export default function SearchInput({
  placeholder = "Search here...",
}: SearchInputProps) {
  return (
    <div className="relative w-full min-w-[200px] max-w-[260px]">
      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      <Input
        placeholder={placeholder}
        className="h-9 rounded-none border-slate-300 bg-white pl-9 text-[12px] focus-visible:ring-[#003B5C]"
      />
    </div>
  );
}