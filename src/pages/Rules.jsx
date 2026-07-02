const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";

import { Scale, Search, ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SCPHeader from "@/components/scp/SCPHeader";
import LoadingScreen from "@/components/scp/LoadingScreen";
import EmptyState from "@/components/scp/EmptyState";
import { hasAccess } from "@/lib/clearance";

const ruleCategories = ["Community Rules", "RP Rules", "Department SOPs", "Staff Guidelines", "Security Procedures", "Code of Conduct"];

export default function Rules() {
  const { clearanceLevel } = useOutletContext();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    async function load() {
      try {
        const data = await db.entities.Rule.filter({ status: "Active" }, "order_index", 999);
        setRules(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingScreen message="LOADING REGULATIONS" />;

  const filtered = rules.filter(r => {
    if (!hasAccess(clearanceLevel, r.clearance_level || "Public")) return false;
    if (catFilter !== "all" && r.category !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.title?.toLowerCase().includes(q) || r.content?.toLowerCase().includes(q);
    }
    return true;
  });

  const grouped = {};
  filtered.forEach(r => {
    if (!grouped[r.category]) grouped[r.category] = [];
    grouped[r.category].push(r);
  });

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div>
      <SCPHeader title="Rules & Regulations" subtitle="FOUNDATION PROTOCOLS" icon={Scale} />

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rules..." className="pl-9 bg-card border-border font-mono text-sm" />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-full md:w-[200px] bg-card border-border">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {ruleCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <EmptyState icon={Scale} title="No Rules Found" description="No rules match your criteria." />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-sm font-mono tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" />
                {category.toUpperCase()}
              </h2>
              <div className="space-y-1">
                {items.map(rule => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-card border border-border rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggle(rule.id)}
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-accent/50 transition-colors"
                    >
                      {expanded[rule.id] ? (
                        <ChevronDown className="w-4 h-4 text-primary flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium">{rule.title}</span>
                    </button>
                    {expanded[rule.id] && rule.content && (
                      <div className="px-4 pb-4 pl-11">
                        <div className="prose-scp text-sm" dangerouslySetInnerHTML={{ __html: rule.content }} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}