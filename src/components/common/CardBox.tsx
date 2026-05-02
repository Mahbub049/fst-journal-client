import { ReactNode } from "react";

type CardBoxProps = {
  children: ReactNode;
  className?: string;
};

export default function CardBox({ children, className = "" }: CardBoxProps) {
  return <div className={`journal-surface p-6 ${className}`}>{children}</div>;
}
