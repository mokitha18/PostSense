import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  gradient?: "purple" | "teal" | "pink" | "none";
  delay?: number;
}

export function GlassCard({ children, className, hover = false, onClick, gradient = "none", delay = 0 }: GlassCardProps) {
  const gradientStyles = {
    purple: "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:pointer-events-none",
    teal: "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-secondary/5 before:to-transparent before:pointer-events-none",
    pink: "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-accent/5 before:to-transparent before:pointer-events-none",
    none: "",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={cn(
        "relative",
        hover ? "glass-card-hover cursor-pointer" : "glass-card",
        "p-6",
        gradientStyles[gradient],
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
