"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type MotionCardProps = {
  children: ReactNode;
  className?: string;
};

export default function MotionCard({ children, className = "" }: MotionCardProps) {
  return (
    <motion.div
      className={className}
      whileHover={{
        y: -4,
        scale: 1.01,
      }}
      whileTap={{
        scale: 0.98,
      }}
      transition={{
        duration: 0.22,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}