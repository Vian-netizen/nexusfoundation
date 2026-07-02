const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { useParams, Link, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Database, ArrowLeft, Shield, AlertTriangle, Tag, LinkIcon,
  FileText, FlaskConical, Siren
} from "lucide-react";
import ClearanceBadge from "@/components/scp/ClearanceBadge";
import AccessDenied from "@/components/scp/AccessDenied";
import LoadingScreen from "@/components/scp/LoadingScreen";
import { hasAccess, getClassColor, getClearanceBg } from "@/lib/clearance";
import moment from "moment";

function Section({ title, content, icon: Icon }) {
  if (!content) return null;
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        {Icon && <Icon className="w-4 h-4 text-primary" />}
        <h2 className="text-sm font-mono tracking-wider text-muted-foreground uppercase">{title}</h2>
      </div>
      <div className="prose-scp text-sm" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}

export default function SCPDetail() {
  const { id } = useParams();
  const { clearanceLevel } = useOutletContext();
  const [scp, setScp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await db.entities.SCPEntry.get(id);
        setScp(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <LoadingScreen message="RETRIEVING SCP FILE" />;
  if (!scp) return <div className="text-center py-20 text-muted-foreground font-mono">FILE NOT FOUND</div>;
  if (!hasAccess(clearanceLevel, scp.clearance_level)) return <AccessDenied requiredLevel={scp.clearance_level} />;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/scp-database" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Database
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className={`border rounded-lg p-6 mb-6 ${getClearanceBg(scp.clearance_level)}`}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-6 h-6 text-primary" />
                <h1 className="text-2xl md:text-3xl font-bold font-mono">{scp.designation}</h1>
              </div>
              <p className="text-lg text-foreground/80 mb-3">{scp.title}</p>
              <ClearanceBadge level={scp.clearance_level} size="md" />
            </div>
            {scp.image_urls?.length > 0 && (
              <img
                src={scp.image_urls[0]}
                alt={scp.designation}
                className="w-full md:w-48 h-48 object-cover rounded border border-border"
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* Classification Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
      >
        {[
          { label: "Object Class", value: scp.object_class, colorFn: getClassColor },
          { label: "Risk Class", value: scp.risk_class },
          { label: "Containment", value: scp.containment_class },
          { label: "Disruption", value: scp.disruption_class },
        ].map(item => item.value && (
          <div key={item.label} className="bg-card border border-border rounded-lg p-3 text-center">
            <p className="text-[10px] font-mono text-muted-foreground tracking-wider mb-1">{item.label.toUpperCase()}</p>
            <p className={`text-sm font-mono font-bold ${item.colorFn ? item.colorFn(item.value) : "text-foreground"}`}>
              {item.value}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Content sections */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <Section title="Special Containment Procedures" content={scp.containment_procedures} icon={Shield} />
        <Section title="Description" content={scp.description_text} icon={FileText} />
        <Section title="Addenda" content={scp.addenda} icon={FileText} />
        <Section title="Discovery Log" content={scp.discovery_log} icon={FlaskConical} />
        <Section title="Incident Reports" content={scp.incident_reports} icon={Siren} />
        <Section title="Testing Logs" content={scp.testing_logs} icon={FlaskConical} />
      </motion.div>

      {/* Tags */}
      {scp.tags?.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mt-6 pt-6 border-t border-border">
          <Tag className="w-4 h-4 text-muted-foreground" />
          {scp.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-muted rounded text-xs font-mono text-muted-foreground">{tag}</span>
          ))}
        </div>
      )}

      {/* Related SCPs */}
      {scp.related_scps?.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <LinkIcon className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-mono text-muted-foreground tracking-wider">RELATED SCPS</h3>
          </div>
          <div className="flex gap-2 flex-wrap">
            {scp.related_scps.map(r => (
              <span key={r} className="px-3 py-1 bg-card border border-border rounded text-sm font-mono text-primary">{r}</span>
            ))}
          </div>
        </div>
      )}

      {/* Meta */}
      <div className="mt-8 pt-4 border-t border-border text-xs font-mono text-muted-foreground flex flex-wrap gap-4">
        {scp.author_name && <span>Author: {scp.author_name}</span>}
        <span>Created: {moment(scp.created_date).format("YYYY.MM.DD")}</span>
        <span>Updated: {moment(scp.updated_date).format("YYYY.MM.DD HH:mm")}</span>
      </div>
    </div>
  );
}