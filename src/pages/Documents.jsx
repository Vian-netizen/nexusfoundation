const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";

import { FileText, Search, Filter, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SCPHeader from "@/components/scp/SCPHeader";
import ClearanceBadge from "@/components/scp/ClearanceBadge";
import LoadingScreen from "@/components/scp/LoadingScreen";
import EmptyState from "@/components/scp/EmptyState";
import { hasAccess, CLEARANCE_LEVELS } from "@/lib/clearance";
import moment from "moment";

const docTypes = ["Intelligence Report", "Operation Briefing", "Mission Report", "Research Paper", "Internal Memorandum", "Directive", "Incident Report"];
const classifications = ["Unclassified", "Restricted", "Confidential", "Secret", "Top Secret", "Eyes Only"];

export default function Documents() {
  const { clearanceLevel } = useOutletContext();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const data = await db.entities.SecureDocument.filter({ status: "Published" }, "-updated_date", 999);
        setDocs(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingScreen message="ACCESSING DOCUMENT ARCHIVE" />;

  const filtered = docs.filter(d => {
    if (!hasAccess(clearanceLevel, d.clearance_level)) return false;
    if (typeFilter !== "all" && d.document_type !== typeFilter) return false;
    if (classFilter !== "all" && d.classification !== classFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return d.title?.toLowerCase().includes(q) || d.author_name?.toLowerCase().includes(q) || d.tags?.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const classificationColors = {
    "Unclassified": "text-gray-400",
    "Restricted": "text-green-400",
    "Confidential": "text-blue-400",
    "Secret": "text-yellow-400",
    "Top Secret": "text-orange-400",
    "Eyes Only": "text-red-400"
  };

  return (
    <div>
      <SCPHeader title="Document Archive" subtitle={`${filtered.length} DOCUMENTS ACCESSIBLE`} icon={FileText} />

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="pl-9 bg-card border-border font-mono text-sm" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-[200px] bg-card border-border">
            <SelectValue placeholder="Document Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {docTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-full md:w-[180px] bg-card border-border">
            <SelectValue placeholder="Classification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classifications</SelectItem>
            {classifications.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No Documents Found" description="No documents match your criteria or clearance level." />
      ) : (
        <div className="space-y-2">
          {filtered.map((doc, i) => (
            <motion.div key={doc.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <Link
                to={`/documents/${doc.id}`}
                className="flex items-center gap-4 bg-card border border-border rounded-lg p-4 hover:border-primary/40 transition-all group"
              >
                <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">{doc.document_type}</span>
                    {doc.classification && (
                      <span className={`text-[10px] font-mono ${classificationColors[doc.classification] || "text-gray-400"}`}>
                        {doc.classification.toUpperCase()}
                      </span>
                    )}
                    {doc.author_name && <span className="text-xs text-muted-foreground">by {doc.author_name}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <ClearanceBadge level={doc.clearance_level} />
                  <span className="text-[10px] font-mono text-muted-foreground">{moment(doc.updated_date).format("YYYY.MM.DD")}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}