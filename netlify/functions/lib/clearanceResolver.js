// netlify/functions/lib/clearanceResolver.js

import { DISCORD_ROLE_MAP, CLEARANCE_PRIORITY } from "./discordRoleMap.js";

/**
 * Resolves the highest Foundation clearance level from a Discord member's roles.
 *
 * @param {string[]} discordRoleIds Array of Discord role IDs
 * @returns {string} Foundation clearance level
 */
export function resolveClearanceFromRoles(discordRoleIds = []) {
  // No roles at all
  if (!Array.isArray(discordRoleIds) || discordRoleIds.length === 0) {
    return "Public";
  }

  // Convert Discord role IDs into Foundation clearance names
  const clearances = discordRoleIds
    .map(roleId => DISCORD_ROLE_MAP[roleId])
    .filter(Boolean);

  // No mapped clearance roles
  if (clearances.length === 0) {
    return "Public";
  }

  // Return the highest clearance according to priority
  for (const level of CLEARANCE_PRIORITY) {
    if (clearances.includes(level)) {
      return level;
    }
  }

  return "Public";
}

/**
 * Checks if a clearance level meets or exceeds another.
 *
 * Example:
 * hasClearance("Level 4", "Level 2") -> true
 * hasClearance("Level 1", "Level 3") -> false
 */
export function hasClearance(userClearance, requiredClearance) {
  const userRank = CLEARANCE_PRIORITY.indexOf(userClearance);
  const requiredRank = CLEARANCE_PRIORITY.indexOf(requiredClearance);

  if (userRank === -1 || requiredRank === -1) {
    return false;
  }

  return userRank <= requiredRank;
}

/**
 * Returns the numeric rank of a clearance.
 * Lower numbers indicate higher authority.
 */
export function getClearanceRank(clearance) {
  const index = CLEARANCE_PRIORITY.indexOf(clearance);

  if (index === -1) {
    return CLEARANCE_PRIORITY.length;
  }

  return index;
}