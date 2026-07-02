const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";

import { BookOpen, Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SCPHeader from "@/components/scp/SCPHeader";
import ClearanceBadge from "@/components/scp/ClearanceBadge";
import LoadingScreen from "@/components/scp/LoadingScreen";
import EmptyState from "@/components/scp/EmptyState";
import { hasAccess } from "@/lib/clearance";

const categories = ["Timeline", "Historical Event", "Important Character", "Facility", "Department", "Canon Event", "Community Lore"];

export default function Lore() {
  const { clearanceLevel } = useOutletContext();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const data = await db.entities.LoreEntry.filter({ status: "Published" }, "-updated_date", 999);
        setEntries(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingScreen message="ACCESSING LORE ARCHIVE" />;

  const filtered = entries.filter(e => {
    if (!hasAccess(clearanceLevel, e.clearance_level)) return false;
    if (catFilter !== "all" && e.category !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.title?.toLowerCase().includes(q) || e.summary?.toLowerCase().includes(q) || e.tags?.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div>
      <SCPHeader title="Lore Archive" subtitle={`${filtered.length} ENTRIES`} icon={BookOpen} />

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search lore..." className="pl-9 bg-card border-border font-mono text-sm" />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-full md:w-[200px] bg-card border-border">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No Lore Entries" description="No lore entries found." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Link
                to={`/lore/${entry.id}`}
                className="flex flex-col bg-card border border-border rounded-lg p-4 hover:border-primary/40 transition-all group h-full"
              >
                {entry.image_url && (
                  <img src={entry.image_url} alt="" className="w-full h-32 object-cover rounded mb-3" />
                )}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono text-primary tracking-wider">{entry.category?.toUpperCase()}</span>
                  <ClearanceBadge level={entry.clearance_level} />
                </div>
                <h3 className="text-sm font-semibold mb-1 group-hover:text-primary transition-colors">{entry.title}</h3>
                {entry.summary && <p className="text-xs text-muted-foreground line-clamp-2">{entry.summary}</p>}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}