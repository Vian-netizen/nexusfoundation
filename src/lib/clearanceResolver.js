import { DISCORD_ROLE_TO_CLEARANCE } from "./discordRoleMap.js";

const CLEARANCE_ORDER = {
  "Public": 0,
  "Level 1": 1,
  "Level 2": 2,
  "Level 3": 3,
  "Level 4": 4,
  "Level 5": 5,
  "Administrator": 6
};

export function resolveClearanceFromRoles(roleIds) {
  let highest = "Public";

  for (const roleId of roleIds) {
    const mapped = DISCORD_ROLE_TO_CLEARANCE[roleId];

    if (!mapped) continue;

    if (CLEARANCE_ORDER[mapped] > CLEARANCE_ORDER[highest]) {
      highest = mapped;
    }
  }

  return highest;
}