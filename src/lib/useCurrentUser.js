const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [personnel, setPersonnel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const me = await db.auth.me();
        setUser(me);
        try {
          const records = await db.entities.Personnel.filter({ user_id: me.id });
          if (records.length > 0) setPersonnel(records[0]);
        } catch (e) { /* no personnel record yet */ }
      } catch (e) { /* not logged in */ }
      setLoading(false);
    }
    load();
  }, []);

  const clearanceLevel = personnel?.clearance_level || user?.clearance_level || "Level 1";
  const isAdmin = user?.role === "admin" || clearanceLevel === "Administrator" || clearanceLevel === "O5";

  return { user, personnel, loading, clearanceLevel, isAdmin };
}