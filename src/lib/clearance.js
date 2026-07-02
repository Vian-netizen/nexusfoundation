export const CLEARANCE_LEVELS = [
  "Public",
  "Level 0",
  "Level 1",
  "Level 2",
  "Level 3",
  "Level 4",
  "Level 5",
  "O5",
  "Administrator"
];

export const CLEARANCE_RANK = {
  "Public": 0,
  "Level 0": 1,
  "Level 1": 2,
  "Level 2": 3,
  "Level 3": 4,
  "Level 4": 5,
  "Level 5": 6,
  "O5": 7,
  "Administrator": 8
};

export function getClearanceRank(level) {
  return CLEARANCE_RANK[level] ?? 0;
}

export function hasAccess(userClearance, requiredClearance) {
  return getClearanceRank(userClearance) >= getClearanceRank(requiredClearance);
}

export function getClearanceColor(level) {
  const colors = {
    "Public": "text-gray-400",
    "Level 0": "text-gray-300",
    "Level 1": "text-green-400",
    "Level 2": "text-blue-400",
    "Level 3": "text-yellow-400",
    "Level 4": "text-orange-400",
    "Level 5": "text-red-400",
    "O5": "text-red-500",
    "Administrator": "text-purple-400"
  };
  return colors[level] || "text-gray-400";
}

export function getClearanceBg(level) {
  const colors = {
    "Public": "bg-gray-800/50 border-gray-600",
    "Level 0": "bg-gray-800/50 border-gray-500",
    "Level 1": "bg-green-950/30 border-green-700",
    "Level 2": "bg-blue-950/30 border-blue-700",
    "Level 3": "bg-yellow-950/30 border-yellow-700",
    "Level 4": "bg-orange-950/30 border-orange-700",
    "Level 5": "bg-red-950/30 border-red-700",
    "O5": "bg-red-950/40 border-red-600",
    "Administrator": "bg-purple-950/30 border-purple-600"
  };
  return colors[level] || "bg-gray-800/50 border-gray-600";
}

export function getClassColor(objectClass) {
  const colors = {
    "Safe": "text-green-400",
    "Euclid": "text-yellow-400",
    "Keter": "text-red-400",
    "Thaumiel": "text-blue-400",
    "Neutralized": "text-gray-500",
    "Apollyon": "text-red-600",
    "Archon": "text-purple-400",
    "Uncontained": "text-orange-500",
    "Explained": "text-gray-400",
    "Pending": "text-yellow-300"
  };
  return colors[objectClass] || "text-gray-400";
}