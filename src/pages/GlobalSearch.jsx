const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";

import { Search, Database, Users, FileText, BookOpen, Scale, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SCPHeader from "@/components/scp/SCPHeader";
import ClearanceBadge from "@/components/scp/ClearanceBadge";
import EmptyState from "@/components/scp/EmptyState";
import { hasAccess } from "@/lib/clearance";

export default function GlobalSearch() {
  const { clearanceLevel } = useOutletContext();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const doSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    const q = query.toLowerCase();

    try {
      const [scps, personnel, docs, lore, rules] = await Promise.all([
        db.entities.SCPEntry.list("designation", 999),
        db.entities.Personnel.list("name", 999),
        db.entities.SecureDocument.list("-updated_date", 999),
        db.entities.LoreEntry.list("-updated_date", 999),
        db.entities.Rule.list("order_index", 999),
      ]);

      const match = (text) => text?.toLowerCase().includes(q);

      setResults({
        scps: scps.filter(s => hasAccess(clearanceLevel, s.clearance_level) && (match(s.designation) || match(s.title) || s.tags?.some(t => match(t)))),
        personnel: personnel.filter(p => hasAccess(clearanceLevel, p.clearance_level) && (match(p.name) || match(p.rank) || match(p.position) || match(p.department))),
        docs: docs.filter(d => hasAccess(clearanceLevel, d.clearance_level) && d.status === "Published" && (match(d.title) || match(d.author_name) || d.tags?.some(t => match(t)))),
        lore: lore.filter(l => hasAccess(clearanceLevel, l.clearance_level) && l.status === "Published" && (match(l.title) || match(l.summary) || l.tags?.some(t => match(t)))),
        rules: rules.filter(r => hasAccess(clearanceLevel, r.clearance_level || "Public") && r.status === "Active" && (match(r.title) || match(r.content))),
      });
    } catch (e) { console.error(e); }
    setSearching(false);
  };

  const totalResults = results ? Object.values(results).reduce((sum, arr) => sum + arr.length, 0) : 0;

  const ResultSection = ({ title, icon: Icon, items, linkBase }) => {
    if (!items?.length) return null;
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-mono tracking-wider text-muted-foreground">{title} ({items.length})</h2>
        </div>
        <div className="space-y-1">
          {items.slice(0, 10).map(item => (
            <Link
              key={item.id}
              to={`${linkBase}/${item.id}`}
              className="flex items-center gap-3 bg-card border border-border rounded-lg p-3 hover:border-primary/40 transition-colors"
            >
              <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm truncate flex-1">{item.designation || item.name || item.title}</span>
              {item.clearance_level && <ClearanceBadge level={item.clearance_level} />}
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <SCPHeader title="Global Search" subtitle="CROSS-DATABASE QUERY SYSTEM" icon={Search} />

      <div className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && doSearch()}
            placeholder="Search across all databases..."
            className="pl-9 bg-card border-border font-mono text-sm"
          />
        </div>
        <Button onClick={doSearch} disabled={searching} className="font-mono">
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "SEARCH"}
        </Button>
      </div>

      {searching && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin mb-3" />
          <p className="text-sm font-mono text-muted-foreground">SEARCHING DATABASES...</p>
        </div>
      )}

      {results && !searching && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-xs font-mono text-muted-foreground mb-4">{totalResults} RESULT(S) FOUND</p>
          {totalResults === 0 ? (
            <EmptyState icon={Search} title="No Results" description="No matching records found within your clearance level." />
          ) : (
            <>
              <ResultSection title="SCP ENTRIES" icon={Database} items={results.scps} linkBase="/scp-database" />
              <ResultSection title="PERSONNEL" icon={Users} items={results.personnel} linkBase="/personnel" />
              <ResultSection title="DOCUMENTS" icon={FileText} items={results.docs} linkBase="/documents" />
              <ResultSection title="LORE" icon={BookOpen} items={results.lore} linkBase="/lore" />
              {results.rules?.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Scale className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-mono tracking-wider text-muted-foreground">RULES ({results.rules.length})</h2>
                  </div>
                  <div className="space-y-1">
                    {results.rules.slice(0, 10).map(r => (
                      <Link
                        key={r.id}
                        to="/rules"
                        className="flex items-center gap-3 bg-card border border-border rounded-lg p-3 hover:border-primary/40 transition-colors"
                      >
                        <Scale className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate">{r.title}</span>
                        <span className="text-xs text-muted-foreground font-mono">{r.category}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}