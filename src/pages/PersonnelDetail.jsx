const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { useParams, Link, useOutletContext } from "react-router-dom";

import { ArrowLeft, User, Award, Calendar, Building2, Shield, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import ClearanceBadge from "@/components/scp/ClearanceBadge";
import StatusIndicator from "@/components/scp/StatusIndicator";
import AccessDenied from "@/components/scp/AccessDenied";
import LoadingScreen from "@/components/scp/LoadingScreen";
import { hasAccess } from "@/lib/clearance";
import moment from "moment";

export default function PersonnelDetail() {
  const { id } = useParams();
  const { clearanceLevel } = useOutletContext();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await db.entities.Personnel.get(id);
        setPerson(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <LoadingScreen message="RETRIEVING PERSONNEL FILE" />;
  if (!person) return <div className="text-center py-20 text-muted-foreground font-mono">RECORD NOT FOUND</div>;
  if (!hasAccess(clearanceLevel, person.clearance_level)) return <AccessDenied requiredLevel={person.clearance_level} />;

  const fields = [
    { label: "Rank", value: person.rank, icon: Shield },
    { label: "Position", value: person.position, icon: Briefcase },
    { label: "Department", value: person.department, icon: Building2 },
    { label: "Division", value: person.division, icon: Building2 },
    { label: "Task Force", value: person.task_force, icon: Shield },
    { label: "Discord", value: person.discord_username, icon: User },
    { label: "Joined", value: person.join_date ? moment(person.join_date).format("YYYY.MM.DD") : null, icon: Calendar },
  ].filter(f => f.value);

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/personnel" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Personnel
      </Link>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center flex-shrink-0 border-2 border-border">
            {person.avatar_url ? (
              <img src={person.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">{person.name}</h1>
            <p className="text-sm text-muted-foreground font-mono mb-3">{person.rank} {person.position ? `· ${person.position}` : ""}</p>
            <div className="flex items-center gap-3">
              <StatusIndicator status={person.status} />
              <ClearanceBadge level={person.clearance_level} size="md" />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {fields.map(f => (
          <div key={f.label} className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
            <f.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-[10px] font-mono text-muted-foreground tracking-wider">{f.label.toUpperCase()}</p>
              <p className="text-sm">{f.value}</p>
            </div>
          </div>
        ))}
      </div>

      {person.biography && (
        <div className="bg-card border border-border rounded-lg p-5 mb-6">
          <h2 className="text-sm font-mono text-muted-foreground tracking-wider mb-3">BIOGRAPHY</h2>
          <div className="prose-scp text-sm" dangerouslySetInnerHTML={{ __html: person.biography }} />
        </div>
      )}

      {person.awards?.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-sm font-mono text-muted-foreground tracking-wider mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" /> AWARDS & COMMENDATIONS
          </h2>
          <div className="flex flex-wrap gap-2">
            {person.awards.map((a, i) => (
              <span key={i} className="px-3 py-1 bg-primary/10 border border-primary/20 rounded text-xs font-mono text-primary">{a}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}