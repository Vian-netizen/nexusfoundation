const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { useParams, Link, useOutletContext } from "react-router-dom";

import { ArrowLeft, FileText, Tag, Paperclip } from "lucide-react";
import { motion } from "framer-motion";
import ClearanceBadge from "@/components/scp/ClearanceBadge";
import AccessDenied from "@/components/scp/AccessDenied";
import LoadingScreen from "@/components/scp/LoadingScreen";
import { hasAccess, getClearanceBg } from "@/lib/clearance";
import moment from "moment";

export default function DocumentDetail() {
  const { id } = useParams();
  const { clearanceLevel } = useOutletContext();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await db.entities.SecureDocument.get(id);
        setDoc(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <LoadingScreen message="RETRIEVING DOCUMENT" />;
  if (!doc) return <div className="text-center py-20 text-muted-foreground font-mono">DOCUMENT NOT FOUND</div>;
  if (!hasAccess(clearanceLevel, doc.clearance_level)) return <AccessDenied requiredLevel={doc.clearance_level} />;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/documents" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Archive
      </Link>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className={`border rounded-lg p-6 mb-6 ${getClearanceBg(doc.clearance_level)}`}>
          <div className="flex items-start gap-3 mb-3">
            <FileText className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold">{doc.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground font-mono">
                <span>{doc.document_type}</span>
                {doc.classification && <span className="text-yellow-400">{doc.classification}</span>}
                {doc.author_name && <span>Author: {doc.author_name}</span>}
                <span>{moment(doc.created_date).format("YYYY.MM.DD")}</span>
                {doc.version && <span>v{doc.version}</span>}
              </div>
            </div>
          </div>
          <ClearanceBadge level={doc.clearance_level} size="md" />
        </div>
      </motion.div>

      {doc.content && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="prose-scp text-sm" dangerouslySetInnerHTML={{ __html: doc.content }} />
        </div>
      )}

      {doc.attachment_urls?.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-5 mb-6">
          <h2 className="text-sm font-mono text-muted-foreground tracking-wider mb-3 flex items-center gap-2">
            <Paperclip className="w-4 h-4" /> ATTACHMENTS
          </h2>
          <div className="space-y-2">
            {doc.attachment_urls.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                <FileText className="w-4 h-4" /> Attachment {i + 1}
              </a>
            ))}
          </div>
        </div>
      )}

      {doc.tags?.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="w-4 h-4 text-muted-foreground" />
          {doc.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-muted rounded text-xs font-mono text-muted-foreground">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}