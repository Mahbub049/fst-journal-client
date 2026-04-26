import { ReactNode } from "react";

type CardBoxProps = {
  children: ReactNode;
  className?: string;
};

export default function CardBox({ children, className = "" }: CardBoxProps) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}