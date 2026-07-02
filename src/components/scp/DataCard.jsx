import React from "react";
import { motion } from "framer-motion";

export default function DataCard({ children, className = "", onClick, hoverable = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverable ? { y: -2, borderColor: "hsl(35, 100%, 50%)" } : undefined}
      onClick={onClick}
      className={`bg-card border border-border rounded-lg p-4 transition-colors ${hoverable ? "cursor-pointer hover:bg-accent/50" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}