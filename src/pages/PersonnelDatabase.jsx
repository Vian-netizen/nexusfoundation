const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";

import { Users, Search, Filter, User, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SCPHeader from "@/components/scp/SCPHeader";
import ClearanceBadge from "@/components/scp/ClearanceBadge";
import StatusIndicator from "@/components/scp/StatusIndicator";
import LoadingScreen from "@/components/scp/LoadingScreen";
import EmptyState from "@/components/scp/EmptyState";
import { hasAccess } from "@/lib/clearance";

export default function PersonnelDatabase() {
  const { clearanceLevel } = useOutletContext();
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const data = await db.entities.Personnel.list("-created_date", 999);
        setPersonnel(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingScreen message="ACCESSING PERSONNEL FILES" />;

  const departments = [...new Set(personnel.map(p => p.department).filter(Boolean))];
  const statuses = ["Active", "Reserve", "KIA", "MIA", "Retired", "Suspended", "Terminated", "Deceased"];

  const filtered = personnel.filter(p => {
    if (!hasAccess(clearanceLevel, p.clearance_level)) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (deptFilter !== "all" && p.department !== deptFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.name?.toLowerCase().includes(q) ||
        p.rank?.toLowerCase().includes(q) ||
        p.position?.toLowerCase().includes(q) ||
        p.discord_username?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      <SCPHeader title="Personnel Database" subtitle={`${filtered.length} RECORDS`} icon={Users} />

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, rank, position..." className="pl-9 bg-card border-border font-mono text-sm" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[160px] bg-card border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-full md:w-[180px] bg-card border-border">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No Personnel Found" description="No personnel records match your criteria." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Link
                to={`/personnel/${p.id}`}
                className="flex items-center gap-4 bg-card border border-border rounded-lg p-4 hover:border-primary/40 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground font-mono">{p.rank}</span>
                    {p.department && <span className="text-xs text-muted-foreground">· {p.department}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusIndicator status={p.status} />
                  <ClearanceBadge level={p.clearance_level} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}