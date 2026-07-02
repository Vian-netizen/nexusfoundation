import React from "react";

const statusConfig = {
  Active: "bg-green-500",
  Published: "bg-green-500",
  Draft: "bg-yellow-500",
  Archived: "bg-gray-500",
  Redacted: "bg-red-500",
  Reserve: "bg-blue-500",
  KIA: "bg-red-600",
  MIA: "bg-orange-500",
  Retired: "bg-gray-400",
  Suspended: "bg-yellow-600",
  Terminated: "bg-red-700",
  Deceased: "bg-gray-600",
  Scheduled: "bg-blue-400",
  Completed: "bg-green-400",
  Cancelled: "bg-gray-500"
};

export default function StatusIndicator({ status }) {
  const dotColor = statusConfig[status] || "bg-gray-500";

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider">
      <span className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
      {status}
    </span>
  );
}