const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { useParams, Link, useOutletContext } from "react-router-dom";

import { ArrowLeft, BookOpen, Tag } from "lucide-react";
import { motion } from "framer-motion";
import ClearanceBadge from "@/components/scp/ClearanceBadge";
import AccessDenied from "@/components/scp/AccessDenied";
import LoadingScreen from "@/components/scp/LoadingScreen";
import { hasAccess, getClearanceBg } from "@/lib/clearance";
import moment from "moment";

export default function LoreDetail() {
  const { id } = useParams();
  const { clearanceLevel } = useOutletContext();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await db.entities.LoreEntry.get(id);
        setEntry(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <LoadingScreen message="LOADING LORE ENTRY" />;
  if (!entry) return <div className="text-center py-20 text-muted-foreground font-mono">ENTRY NOT FOUND</div>;
  if (!hasAccess(clearanceLevel, entry.clearance_level)) return <AccessDenied requiredLevel={entry.clearance_level} />;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/lore" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Lore Archive
      </Link>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className={`border rounded-lg p-6 mb-6 ${getClearanceBg(entry.clearance_level)}`}>
          <span className="text-[10px] font-mono text-primary tracking-wider">{entry.category?.toUpperCase()}</span>
          <h1 className="text-2xl font-bold mt-1 mb-2">{entry.title}</h1>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
            <ClearanceBadge level={entry.clearance_level} />
            {entry.date_in_lore && <span>Date: {entry.date_in_lore}</span>}
            {entry.author_name && <span>Author: {entry.author_name}</span>}
          </div>
        </div>
      </motion.div>

      {entry.image_url && (
        <img src={entry.image_url} alt="" className="w-full max-h-64 object-cover rounded-lg border border-border mb-6" />
      )}

      {entry.content && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="prose-scp text-sm" dangerouslySetInnerHTML={{ __html: entry.content }} />
        </div>
      )}

      {entry.tags?.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="w-4 h-4 text-muted-foreground" />
          {entry.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-muted rounded text-xs font-mono text-muted-foreground">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}