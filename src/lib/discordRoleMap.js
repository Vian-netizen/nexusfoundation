
// netlify/functions/lib/discordRoleMap.js

export const DISCORD_ROLE_MAP = {
  // OMNI Clearance
  "1521647891595264251": "Administrator",

  // Foundation Clearance Levels
  "1521647876151967815": "Level 5",
  "1521647870938320996": "Level 4",
  "1521647867041677382": "Level 3",
  "1521647858368122883": "Level 2",
  "1521647803741241444": "Level 1"
};

export const CLEARANCE_PRIORITY = [
  "Administrator",
  "O5",
  "Level 5",
  "Level 4",
  "Level 3",
  "Level 2",
  "Level 1",
  "Level 0",
  "Public"
];