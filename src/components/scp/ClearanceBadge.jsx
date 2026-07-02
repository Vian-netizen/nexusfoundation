import React from "react";
import { Shield, Lock } from "lucide-react";
import { getClearanceColor } from "@/lib/clearance";

export default function ClearanceBadge({ level, size = "sm" }) {
  const color = getClearanceColor(level);
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span className={`inline-flex items-center gap-1 font-mono font-semibold ${sizeClasses} rounded border border-current/20 ${color} bg-current/5`}>
      {level === "O5" || level === "Administrator" ? (
        <Lock className="w-3 h-3" />
      ) : (
        <Shield className="w-3 h-3" />
      )}
      {level}
    </span>
  );
}