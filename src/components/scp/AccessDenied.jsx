import React from "react";
import { ShieldAlert, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function AccessDenied({ requiredLevel }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-red-950/30 border-2 border-red-600/50 flex items-center justify-center mb-6">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <Lock className="w-6 h-6 text-red-400 absolute -top-1 -right-1" />
      </div>
      <h2 className="text-2xl font-bold font-mono text-red-400 mb-2 tracking-wider">ACCESS DENIED</h2>
      <p className="text-muted-foreground text-sm font-mono">
        INSUFFICIENT CLEARANCE — REQUIRED: <span className="text-red-400">{requiredLevel}</span>
      </p>
      <div className="mt-6 px-4 py-2 border border-red-800/50 bg-red-950/20 rounded text-xs font-mono text-red-400/70">
        This incident has been logged. Contact your supervisor for access.
      </div>
    </motion.div>
  );
}