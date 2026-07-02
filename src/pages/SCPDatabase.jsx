const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";

import { Database, Search, Filter, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SCPHeader from "@/components/scp/SCPHeader";
import ClearanceBadge from "@/components/scp/ClearanceBadge";
import LoadingScreen from "@/components/scp/LoadingScreen";
import EmptyState from "@/components/scp/EmptyState";
import { hasAccess, getClassColor, CLEARANCE_LEVELS } from "@/lib/clearance";
import moment from "moment";

export default function SCPDatabase() {
  const { clearanceLevel } = useOutletContext();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [clearanceFilter, setClearanceFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const data = await db.entities.SCPEntry.filter({ status: "Published" }, "designation", 999);
        setEntries(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingScreen message="ACCESSING SCP DATABASE" />;

  const filtered = entries.filter(e => {
    if (!hasAccess(clearanceLevel, e.clearance_level)) return false;
    if (classFilter !== "all" && e.object_class !== classFilter) return false;
    if (clearanceFilter !== "all" && e.clearance_level !== clearanceFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.designation?.toLowerCase().includes(q) ||
        e.title?.toLowerCase().includes(q) ||
        e.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const objectClasses = ["Safe", "Euclid", "Keter", "Thaumiel", "Neutralized", "Apollyon", "Archon", "Uncontained", "Explained", "Pending"];

  return (
    <div>
      <SCPHeader title="SCP Database" subtitle={`${filtered.length} ENTRIES ACCESSIBLE`} icon={Database} />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by designation, title, or tag..."
            className="pl-9 bg-card border-border font-mono text-sm"
          />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-full md:w-[180px] bg-card border-border">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Object Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {objectClasses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={clearanceFilter} onValueChange={setClearanceFilter}>
          <SelectTrigger className="w-full md:w-[180px] bg-card border-border">
            <SelectValue placeholder="Clearance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {CLEARANCE_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState icon={Database} title="No SCP Entries Found" description="No entries match your search or clearance level." />
      ) : (
        <div className="space-y-2">
          {filtered.map((scp, i) => (
            <motion.div
              key={scp.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link
                to={`/scp-database/${scp.id}`}
                className="flex items-center gap-4 bg-card border border-border rounded-lg p-4 hover:border-primary/40 transition-all group"
              >
                <div className="w-20 flex-shrink-0">
                  <span className="text-sm font-mono font-bold text-primary">{scp.designation}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{scp.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-xs font-mono ${getClassColor(scp.object_class)}`}>{scp.object_class}</span>
                    {scp.risk_class && <span className="text-[10px] text-muted-foreground font-mono">RISK: {scp.risk_class}</span>}
                  </div>
                </div>
                <ClearanceBadge level={scp.clearance_level} />
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}