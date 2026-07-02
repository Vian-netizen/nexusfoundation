import { DISCORD_ROLE_MAP, CLEARANCE_PRIORITY } from "./discordRoleMap.js";

export function resolveClearanceFromRoles(discordRoleIds = []) {
  if (!Array.isArray(discordRoleIds) || discordRoleIds.length === 0) {
    return "Public";
  }

  const clearances = discordRoleIds
    .map((roleId) => DISCORD_ROLE_MAP[roleId])
    .filter(Boolean);

  if (clearances.length === 0) {
    return "Public";
  }

  for (const level of CLEARANCE_PRIORITY) {
    if (clearances.includes(level)) {
      return level;
    }
  }

  return "Public";
}