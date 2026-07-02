import React from "react";
import { motion } from "framer-motion";

export default function SCPHeader({ title, subtitle, icon: Icon, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            {Icon && <Icon className="w-6 h-6 text-primary" />}
            <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight">{title}</h1>
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground font-mono ml-9">{subtitle}</p>
          )}
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
      <div className="mt-4 h-px bg-gradient-to-r from-primary/50 via-border to-transparent" />
    </motion.div>
  );
}