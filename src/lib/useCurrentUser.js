import { useState, useEffect } from "react";

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [personnel, setPersonnel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function loadDiscordUser() {
      const uid = localStorage.getItem("uid");
      const username = localStorage.getItem("username");
      const clearance = localStorage.getItem("clearance") || "Public";

      if (!uid) {
        setUser(null);
        setPersonnel(null);
        setLoading(false);
        return;
      }

      const discordUser = {
        id: uid,
        discord_id: uid,
        username: username || "Discord User",
        full_name: username || "Discord User",
        email: null,
        role: clearance === "Administrator" || clearance === "O5" ? "admin" : "user",
        clearance_level: clearance
      };

      setUser(discordUser);
      setPersonnel(null);
      setLoading(false);
    }

    loadDiscordUser();
  }, []);

  const clearanceLevel = user?.clearance_level || "Public";
  const isAdmin =
    clearanceLevel === "Administrator" ||
    clearanceLevel === "O5";

  return {
    user,
    personnel,
    loading,
    clearanceLevel,
    isAdmin
  };
}