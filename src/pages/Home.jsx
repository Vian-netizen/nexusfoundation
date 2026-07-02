const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";

import {
  LayoutDashboard, Database, Users, FileText, AlertTriangle,
  Clock, ArrowRight, Shield, Calendar, Megaphone, Activity
} from "lucide-react";
import SCPHeader from "@/components/scp/SCPHeader";
import ClearanceBadge from "@/components/scp/ClearanceBadge";
import StatusIndicator from "@/components/scp/StatusIndicator";
import LoadingScreen from "@/components/scp/LoadingScreen";
import { hasAccess } from "@/lib/clearance";
import moment from "moment";

function StatCard({ label, value, icon: Icon, color = "text-primary" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-muted-foreground tracking-wider uppercase">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-2xl font-bold font-mono">{value}</p>
    </motion.div>
  );
}

function QuickLink({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg hover:border-primary/40 hover:bg-accent/50 transition-all group"
    >
      <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      <span className="text-sm font-medium">{label}</span>
      <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
    </Link>
  );
}

export default function Home() {
  const { user, clearanceLevel, isAdmin } = useOutletContext();
  const [announcements, setAnnouncements] = useState([]);
  const [recentSCPs, setRecentSCPs] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ scps: 0, personnel: 0, docs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [ann, scps, docs, evts, allSCPs, allPersonnel, allDocs] = await Promise.all([
          db.entities.Announcement.filter({ status: "Active" }, "-created_date", 5),
          db.entities.SCPEntry.filter({ status: "Published" }, "-updated_date", 5),
          db.entities.SecureDocument.filter({ status: "Published" }, "-updated_date", 5),
          db.entities.Event.filter({ status: "Scheduled" }, "event_date", 5),
          db.entities.SCPEntry.list("-created_date", 1),
          db.entities.Personnel.list("-created_date", 1),
          db.entities.SecureDocument.list("-created_date", 1),
        ]);

        setAnnouncements(ann.filter(a => hasAccess(clearanceLevel, a.clearance_level || "Public")));
        setRecentSCPs(scps.filter(s => hasAccess(clearanceLevel, s.clearance_level)));
        setRecentDocs(docs.filter(d => hasAccess(clearanceLevel, d.clearance_level)));
        setEvents(evts.filter(e => hasAccess(clearanceLevel, e.clearance_level || "Public")));

        // For counts, we'll get the length of what we already loaded. 
        // The list() calls with limit 1 just give us the length indicator.
        const scpAll = await db.entities.SCPEntry.list("-created_date", 999);
        const persAll = await db.entities.Personnel.list("-created_date", 999);
        const docAll = await db.entities.SecureDocument.list("-created_date", 999);
        setStats({
          scps: scpAll.length,
          personnel: persAll.length,
          docs: docAll.length
        });
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, [clearanceLevel]);

  if (loading) return <LoadingScreen message="LOADING LOGISTICS HUB" />;

  const priorityColors = {
    Critical: "border-red-600 bg-red-950/20",
    High: "border-orange-600 bg-orange-950/20",
    Normal: "border-border",
    Low: "border-border"
  };

  return (
    <div>
      <SCPHeader title="Logistics Hub" subtitle="CENTRAL COMMAND DASHBOARD" icon={LayoutDashboard}>
        <ClearanceBadge level={clearanceLevel} size="md" />
      </SCPHeader>

      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-lg p-5 mb-6"
      >
        <div className="flex items-center gap-3 mb-1">
          <Activity className="w-5 h-5 text-green-400" />
          <span className="text-xs font-mono text-green-400 tracking-wider">SYSTEM ONLINE</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Welcome, <span className="text-foreground font-medium">{user?.full_name || user?.email || "Operator"}</span>. 
          All Foundation systems are operational. Current date: {moment().format("YYYY.MM.DD HH:mm")} UTC.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <StatCard label="SCP Entries" value={stats.scps} icon={Database} />
        <StatCard label="Personnel" value={stats.personnel} icon={Users} color="text-blue-400" />
        <StatCard label="Documents" value={stats.docs} icon={FileText} color="text-green-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Announcements */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Megaphone className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-mono tracking-wider text-muted-foreground">ANNOUNCEMENTS</h2>
            </div>
            {announcements.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-6 text-center text-sm text-muted-foreground">
                No active announcements.
              </div>
            ) : (
              <div className="space-y-2">
                {announcements.map(a => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`bg-card border rounded-lg p-4 ${priorityColors[a.priority] || "border-border"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {a.priority === "Critical" && <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                          <h3 className="font-semibold text-sm truncate">{a.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{a.content}</p>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0">
                        {moment(a.created_date).fromNow()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Recent SCPs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-mono tracking-wider text-muted-foreground">RECENT SCP UPDATES</h2>
              </div>
              <Link to="/scp-database" className="text-xs text-primary hover:underline font-mono">VIEW ALL →</Link>
            </div>
            <div className="space-y-2">
              {recentSCPs.slice(0, 4).map(scp => (
                <Link
                  key={scp.id}
                  to={`/scp-database/${scp.id}`}
                  className="flex items-center gap-3 bg-card border border-border rounded-lg p-3 hover:border-primary/40 transition-colors"
                >
                  <span className="text-sm font-mono font-bold text-primary">{scp.designation}</span>
                  <span className="text-sm text-foreground truncate flex-1">{scp.title}</span>
                  <StatusIndicator status={scp.object_class} />
                </Link>
              ))}
              {recentSCPs.length === 0 && (
                <div className="bg-card border border-border rounded-lg p-4 text-center text-sm text-muted-foreground">
                  No SCP entries available at your clearance level.
                </div>
              )}
            </div>
          </div>

          {/* Recent Documents */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-mono tracking-wider text-muted-foreground">RECENT DOCUMENTS</h2>
              </div>
              <Link to="/documents" className="text-xs text-primary hover:underline font-mono">VIEW ALL →</Link>
            </div>
            <div className="space-y-2">
              {recentDocs.slice(0, 3).map(doc => (
                <Link
                  key={doc.id}
                  to={`/documents/${doc.id}`}
                  className="flex items-center gap-3 bg-card border border-border rounded-lg p-3 hover:border-primary/40 transition-colors"
                >
                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate flex-1">{doc.title}</span>
                  <ClearanceBadge level={doc.clearance_level} />
                </Link>
              ))}
              {recentDocs.length === 0 && (
                <div className="bg-card border border-border rounded-lg p-4 text-center text-sm text-muted-foreground">
                  No documents available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar column */}
        <div className="space-y-6">
          {/* Quick Links */}
          <div>
            <h2 className="text-sm font-mono tracking-wider text-muted-foreground mb-3">QUICK ACCESS</h2>
            <div className="space-y-2">
              <QuickLink to="/scp-database" icon={Database} label="SCP Database" />
              <QuickLink to="/personnel" icon={Users} label="Personnel Files" />
              <QuickLink to="/documents" icon={FileText} label="Document Archive" />
              <QuickLink to="/search" icon={Shield} label="Global Search" />
            </div>
          </div>

          {/* Upcoming Events */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-mono tracking-wider text-muted-foreground">UPCOMING EVENTS</h2>
            </div>
            <div className="space-y-2">
              {events.slice(0, 4).map(evt => (
                <div key={evt.id} className="bg-card border border-border rounded-lg p-3">
                  <p className="text-sm font-medium truncate">{evt.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-mono">
                      {moment(evt.event_date).format("MMM DD, HH:mm")}
                    </span>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <div className="bg-card border border-border rounded-lg p-4 text-center text-sm text-muted-foreground">
                  No upcoming events.
                </div>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-mono tracking-wider text-muted-foreground mb-3">SYSTEM STATUS</h2>
            <div className="space-y-2">
              {[
                { label: "Database", status: "Online" },
                { label: "Auth System", status: "Online" },
                { label: "Comms", status: "Online" },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="flex items-center gap-1.5 text-green-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}