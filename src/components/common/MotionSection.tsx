"use client";

import { motion, type Variants } from "framer-motion";
import { ReactNode } from "react";

type MotionSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
};

export default function MotionSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: MotionSectionProps) {
  const position =
    direction === "down"
      ? { y: -18, x: 0 }
      : direction === "left"
        ? { x: 18, y: 0 }
        : direction === "right"
          ? { x: -18, y: 0 }
          : direction === "none"
            ? { x: 0, y: 0 }
            : { y: 18, x: 0 };

  const variants: Variants = {
    hidden: {
      opacity: 0,
      ...position,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.45,
        delay,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial={false}
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
    >
      {children}
    </motion.div>
  );
}