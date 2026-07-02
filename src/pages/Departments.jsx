const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";

import { Building2, Users, ChevronRight } from "lucide-react";
import SCPHeader from "@/components/scp/SCPHeader";
import ClearanceBadge from "@/components/scp/ClearanceBadge";
import StatusIndicator from "@/components/scp/StatusIndicator";
import LoadingScreen from "@/components/scp/LoadingScreen";
import EmptyState from "@/components/scp/EmptyState";
import { hasAccess } from "@/lib/clearance";

export default function Departments() {
  const { clearanceLevel } = useOutletContext();
  const [departments, setDepartments] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [depts, pers] = await Promise.all([
          db.entities.Department.list("name", 999),
          db.entities.Personnel.list("name", 999)
        ]);
        setDepartments(depts);
        setPersonnel(pers);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingScreen message="LOADING ORGANIZATIONAL DATA" />;

  const visible = departments.filter(d => hasAccess(clearanceLevel, d.clearance_level || "Public"));
  const typeGroups = {};
  visible.forEach(d => {
    const t = d.department_type || "Department";
    if (!typeGroups[t]) typeGroups[t] = [];
    typeGroups[t].push(d);
  });

  const deptPersonnel = selectedDept
    ? personnel.filter(p => p.department === selectedDept.name && hasAccess(clearanceLevel, p.clearance_level))
    : [];

  return (
    <div>
      <SCPHeader title="Departments & Units" subtitle="ORGANIZATIONAL STRUCTURE" icon={Building2} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {Object.keys(typeGroups).length === 0 ? (
            <EmptyState icon={Building2} title="No Departments" description="No departments have been created yet." />
          ) : (
            <div className="space-y-6">
              {Object.entries(typeGroups).map(([type, depts]) => (
                <div key={type}>
                  <h2 className="text-sm font-mono tracking-wider text-muted-foreground mb-3">{type.toUpperCase()}S</h2>
                  <div className="space-y-2">
                    {depts.map(dept => (
                      <motion.button
                        key={dept.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => setSelectedDept(dept)}
                        className={`w-full flex items-center gap-4 bg-card border rounded-lg p-4 text-left transition-all
                          ${selectedDept?.id === dept.id ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30"}`}
                      >
                        <Building2 className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{dept.name}</p>
                            {dept.abbreviation && <span className="text-xs font-mono text-muted-foreground">({dept.abbreviation})</span>}
                          </div>
                          {dept.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{dept.description}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIndicator status={dept.status} />
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div>
          {selectedDept ? (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="bg-card border border-border rounded-lg p-5 sticky top-8">
              <h3 className="text-lg font-semibold mb-1">{selectedDept.name}</h3>
              {selectedDept.abbreviation && <p className="text-xs font-mono text-muted-foreground mb-3">{selectedDept.abbreviation}</p>}
              <ClearanceBadge level={selectedDept.clearance_level || "Public"} />
              {selectedDept.description && <p className="text-sm text-muted-foreground mt-3">{selectedDept.description}</p>}

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-mono text-muted-foreground tracking-wider">PERSONNEL ({deptPersonnel.length})</h4>
                </div>
                {deptPersonnel.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No assigned personnel.</p>
                ) : (
                  <div className="space-y-2">
                    {deptPersonnel.slice(0, 10).map(p => (
                      <div key={p.id} className="flex items-center gap-2 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <span className="font-medium">{p.name}</span>
                        <span className="text-muted-foreground">· {p.rank}</span>
                      </div>
                    ))}
                    {deptPersonnel.length > 10 && (
                      <p className="text-xs text-muted-foreground">+{deptPersonnel.length - 10} more</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select a department to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}