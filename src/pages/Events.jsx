const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";

import { Calendar, Clock, MapPin, User } from "lucide-react";
import SCPHeader from "@/components/scp/SCPHeader";
import ClearanceBadge from "@/components/scp/ClearanceBadge";
import StatusIndicator from "@/components/scp/StatusIndicator";
import LoadingScreen from "@/components/scp/LoadingScreen";
import EmptyState from "@/components/scp/EmptyState";
import { hasAccess } from "@/lib/clearance";
import moment from "moment";

export default function Events() {
  const { clearanceLevel } = useOutletContext();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await db.entities.Event.list("event_date", 999);
        setEvents(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingScreen message="LOADING EVENTS" />;

  const visible = events.filter(e => hasAccess(clearanceLevel, e.clearance_level || "Public"));
  const upcoming = visible.filter(e => e.status === "Scheduled" || e.status === "Active");
  const past = visible.filter(e => e.status === "Completed" || e.status === "Cancelled");

  const EventCard = ({ evt }) => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-primary tracking-wider">{evt.event_type?.toUpperCase()}</span>
            <ClearanceBadge level={evt.clearance_level || "Public"} />
          </div>
          <h3 className="text-sm font-semibold mb-2">{evt.title}</h3>
          {evt.description && <p className="text-xs text-muted-foreground mb-3">{evt.description}</p>}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {moment(evt.event_date).format("MMM DD, YYYY HH:mm")}
            </span>
            {evt.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {evt.location}
              </span>
            )}
            {evt.organizer_name && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {evt.organizer_name}
              </span>
            )}
          </div>
        </div>
        <StatusIndicator status={evt.status} />
      </div>
    </motion.div>
  );

  return (
    <div>
      <SCPHeader title="Operations & Events" subtitle="SCHEDULING & COORDINATION" icon={Calendar} />

      {visible.length === 0 ? (
        <EmptyState icon={Calendar} title="No Events" description="No events have been scheduled." />
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-mono tracking-wider text-muted-foreground mb-3">UPCOMING</h2>
              <div className="space-y-3">
                {upcoming.map(e => <EventCard key={e.id} evt={e} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-mono tracking-wider text-muted-foreground mb-3">PAST EVENTS</h2>
              <div className="space-y-3">
                {past.map(e => <EventCard key={e.id} evt={e} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}