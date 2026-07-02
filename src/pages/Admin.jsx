const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Settings, Database, Users, FileText, BookOpen, Scale,
  Megaphone, Calendar, Building2, ClipboardList, Plus,
  Pencil, Trash2, Save, X, ChevronDown, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SCPHeader from "@/components/scp/SCPHeader";
import AccessDenied from "@/components/scp/AccessDenied";
import LoadingScreen from "@/components/scp/LoadingScreen";
import { CLEARANCE_LEVELS } from "@/lib/clearance";
import { useToast } from "@/components/ui/use-toast";
import moment from "moment";
import ReactQuill from "react-quill";

function AdminSection({ title, icon: Icon, items, onAdd, onEdit, onDelete, columns, renderRow }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-mono tracking-wider text-muted-foreground">{title} ({items.length})</h2>
        </div>
        <Button size="sm" onClick={onAdd} className="font-mono text-xs gap-1">
          <Plus className="w-3 h-3" /> NEW
        </Button>
      </div>
      {items.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
          No records. Click NEW to create one.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {columns.map(col => (
                    <th key={col} className="text-left p-3 text-[10px] font-mono text-muted-foreground tracking-wider">{col}</th>
                  ))}
                  <th className="text-right p-3 text-[10px] font-mono text-muted-foreground tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    {renderRow(item)}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => onEdit(item)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => onDelete(item)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SCPForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    designation: "", title: "", object_class: "Euclid", risk_class: "", containment_class: "",
    disruption_class: "", clearance_level: "Level 1", containment_procedures: "", description_text: "",
    addenda: "", discovery_log: "", incident_reports: "", testing_logs: "", tags: [],
    related_scps: [], status: "Draft", author_name: "", category: ""
  });
  const [tagInput, setTagInput] = useState("");

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs font-mono">Designation</Label><Input value={form.designation} onChange={e => update("designation", e.target.value)} placeholder="SCP-XXX" className="bg-background" /></div>
        <div><Label className="text-xs font-mono">Title</Label><Input value={form.title} onChange={e => update("title", e.target.value)} className="bg-background" /></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div><Label className="text-xs font-mono">Object Class</Label>
          <Select value={form.object_class} onValueChange={v => update("object_class", v)}>
            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>{["Safe","Euclid","Keter","Thaumiel","Neutralized","Apollyon","Archon","Uncontained","Explained","Pending"].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label className="text-xs font-mono">Risk Class</Label>
          <Select value={form.risk_class || "none"} onValueChange={v => update("risk_class", v === "none" ? "" : v)}>
            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="none">None</SelectItem>{["Notice","Caution","Warning","Danger","Critical"].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label className="text-xs font-mono">Clearance</Label>
          <Select value={form.clearance_level} onValueChange={v => update("clearance_level", v)}>
            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>{CLEARANCE_LEVELS.map(l=><SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label className="text-xs font-mono">Status</Label>
          <Select value={form.status} onValueChange={v => update("status", v)}>
            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>{["Draft","Published","Archived","Redacted"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div><Label className="text-xs font-mono">Author</Label><Input value={form.author_name || ""} onChange={e => update("author_name", e.target.value)} className="bg-background" /></div>
      <div><Label className="text-xs font-mono">Containment Procedures</Label><ReactQuill theme="snow" value={form.containment_procedures || ""} onChange={v => update("containment_procedures", v)} /></div>
      <div><Label className="text-xs font-mono">Description</Label><ReactQuill theme="snow" value={form.description_text || ""} onChange={v => update("description_text", v)} /></div>
      <div><Label className="text-xs font-mono">Addenda</Label><ReactQuill theme="snow" value={form.addenda || ""} onChange={v => update("addenda", v)} /></div>
      <div>
        <Label className="text-xs font-mono">Tags</Label>
        <div className="flex gap-2">
          <Input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Add tag..." className="bg-background"
            onKeyDown={e => { if (e.key === "Enter" && tagInput.trim()) { e.preventDefault(); update("tags", [...(form.tags || []), tagInput.trim()]); setTagInput(""); }}} />
        </div>
        <div className="flex gap-1 flex-wrap mt-2">
          {(form.tags || []).map((t, i) => (
            <span key={i} className="px-2 py-0.5 bg-muted rounded text-xs flex items-center gap-1">
              {t} <button onClick={() => update("tags", form.tags.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="font-mono text-xs">CANCEL</Button>
        <Button onClick={() => onSave(form)} className="font-mono text-xs gap-1"><Save className="w-3 h-3" /> SAVE</Button>
      </div>
    </div>
  );
}

function SimpleForm({ initial, fields, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {});
  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {fields.map(f => (
        <div key={f.key}>
          <Label className="text-xs font-mono">{f.label}</Label>
          {f.type === "select" ? (
            <Select value={form[f.key] || f.options[0]} onValueChange={v => update(f.key, v)}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>{f.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          ) : f.type === "richtext" ? (
            <ReactQuill theme="snow" value={form[f.key] || ""} onChange={v => update(f.key, v)} />
          ) : f.type === "textarea" ? (
            <Textarea value={form[f.key] || ""} onChange={e => update(f.key, e.target.value)} className="bg-background" />
          ) : (
            <Input value={form[f.key] || ""} onChange={e => update(f.key, e.target.value)} className="bg-background" />
          )}
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="font-mono text-xs">CANCEL</Button>
        <Button onClick={() => onSave(form)} className="font-mono text-xs gap-1"><Save className="w-3 h-3" /> SAVE</Button>
      </div>
    </div>
  );
}

export default function Admin() {
  const { isAdmin, user } = useOutletContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ scps: [], personnel: [], docs: [], lore: [], rules: [], announcements: [], departments: [], events: [], logs: [] });
  const [dialog, setDialog] = useState({ open: false, type: null, item: null });

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [scps, personnel, docs, lore, rules, announcements, departments, events, logs] = await Promise.all([
        db.entities.SCPEntry.list("designation", 999),
        db.entities.Personnel.list("name", 999),
        db.entities.SecureDocument.list("-updated_date", 999),
        db.entities.LoreEntry.list("-updated_date", 999),
        db.entities.Rule.list("order_index", 999),
        db.entities.Announcement.list("-created_date", 999),
        db.entities.Department.list("name", 999),
        db.entities.Event.list("event_date", 999),
        db.entities.AuditLog.list("-created_date", 50),
      ]);
      setData({ scps, personnel, docs, lore, rules, announcements, departments, events, logs });
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function logAction(action, entityType, entityId, entityName, details) {
    try {
      await db.entities.AuditLog.create({
        action, entity_type: entityType, entity_id: entityId, entity_name: entityName,
        user_name: user?.full_name || user?.email || "Unknown", user_id: user?.id, details
      });
    } catch (e) { /* ignore logging errors */ }
  }

  async function handleSaveSCP(form) {
    try {
      if (form.id) {
        await db.entities.SCPEntry.update(form.id, form);
        await logAction("Update", "SCPEntry", form.id, form.designation, `Updated ${form.designation}`);
      } else {
        const created = await db.entities.SCPEntry.create(form);
        await logAction("Create", "SCPEntry", created.id, form.designation, `Created ${form.designation}`);
      }
      toast({ title: "SCP saved" });
      setDialog({ open: false });
      loadAll();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }

  async function handleDeleteItem(entityKey, entityName, item) {
    if (!confirm(`Delete "${item.designation || item.name || item.title}"?`)) return;
    try {
      await db.entities[entityName].delete(item.id);
      await logAction("Delete", entityName, item.id, item.designation || item.name || item.title, `Deleted record`);
      toast({ title: "Deleted" });
      loadAll();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }

  async function handleSaveGeneric(entityName, form) {
    try {
      if (form.id) {
        await db.entities[entityName].update(form.id, form);
        await logAction("Update", entityName, form.id, form.name || form.title, "Updated record");
      } else {
        const created = await db.entities[entityName].create(form);
        await logAction("Create", entityName, created.id, form.name || form.title, "Created record");
      }
      toast({ title: "Saved" });
      setDialog({ open: false });
      loadAll();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }

  if (!isAdmin) return <AccessDenied requiredLevel="Administrator" />;
  if (loading) return <LoadingScreen message="LOADING ADMIN PANEL" />;

  const personnelFields = [
    { key: "name", label: "Name", type: "text" },
    { key: "rank", label: "Rank", type: "text" },
    { key: "position", label: "Position", type: "text" },
    { key: "department", label: "Department", type: "text" },
    { key: "division", label: "Division", type: "text" },
    { key: "task_force", label: "Task Force", type: "text" },
    { key: "clearance_level", label: "Clearance", type: "select", options: CLEARANCE_LEVELS },
    { key: "status", label: "Status", type: "select", options: ["Active","Reserve","KIA","MIA","Retired","Suspended","Terminated","Deceased"] },
    { key: "discord_username", label: "Discord Username", type: "text" },
    { key: "biography", label: "Biography", type: "richtext" },
  ];

  const docFields = [
    { key: "title", label: "Title", type: "text" },
    { key: "document_type", label: "Type", type: "select", options: ["Intelligence Report","Operation Briefing","Mission Report","Research Paper","Internal Memorandum","Directive","Incident Report"] },
    { key: "classification", label: "Classification", type: "select", options: ["Unclassified","Restricted","Confidential","Secret","Top Secret","Eyes Only"] },
    { key: "clearance_level", label: "Clearance", type: "select", options: CLEARANCE_LEVELS },
    { key: "author_name", label: "Author", type: "text" },
    { key: "status", label: "Status", type: "select", options: ["Draft","Published","Archived","Redacted"] },
    { key: "content", label: "Content", type: "richtext" },
  ];

  const announcementFields = [
    { key: "title", label: "Title", type: "text" },
    { key: "content", label: "Content", type: "textarea" },
    { key: "priority", label: "Priority", type: "select", options: ["Low","Normal","High","Critical"] },
    { key: "clearance_level", label: "Clearance", type: "select", options: CLEARANCE_LEVELS },
    { key: "status", label: "Status", type: "select", options: ["Active","Archived"] },
  ];

  const deptFields = [
    { key: "name", label: "Name", type: "text" },
    { key: "abbreviation", label: "Abbreviation", type: "text" },
    { key: "department_type", label: "Type", type: "select", options: ["Department","Division","Task Force","Committee","Office"] },
    { key: "clearance_level", label: "Clearance", type: "select", options: CLEARANCE_LEVELS },
    { key: "status", label: "Status", type: "select", options: ["Active","Inactive","Classified"] },
    { key: "description", label: "Description", type: "textarea" },
  ];

  const eventFields = [
    { key: "title", label: "Title", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "event_date", label: "Date/Time (ISO)", type: "text" },
    { key: "event_type", label: "Type", type: "select", options: ["Operation","Training","Meeting","Social","Drill","Other"] },
    { key: "clearance_level", label: "Clearance", type: "select", options: CLEARANCE_LEVELS },
    { key: "status", label: "Status", type: "select", options: ["Scheduled","Active","Completed","Cancelled"] },
    { key: "organizer_name", label: "Organizer", type: "text" },
    { key: "location", label: "Location", type: "text" },
  ];

  const loreFields = [
    { key: "title", label: "Title", type: "text" },
    { key: "category", label: "Category", type: "select", options: ["Timeline","Historical Event","Important Character","Facility","Department","Canon Event","Community Lore"] },
    { key: "clearance_level", label: "Clearance", type: "select", options: CLEARANCE_LEVELS },
    { key: "status", label: "Status", type: "select", options: ["Draft","Published","Archived"] },
    { key: "summary", label: "Summary", type: "textarea" },
    { key: "author_name", label: "Author", type: "text" },
    { key: "content", label: "Content", type: "richtext" },
  ];

  const ruleFields = [
    { key: "title", label: "Title", type: "text" },
    { key: "category", label: "Category", type: "select", options: ["Community Rules","RP Rules","Department SOPs","Staff Guidelines","Security Procedures","Code of Conduct"] },
    { key: "clearance_level", label: "Clearance", type: "select", options: CLEARANCE_LEVELS },
    { key: "order_index", label: "Order", type: "text" },
    { key: "status", label: "Status", type: "select", options: ["Active","Draft","Archived"] },
    { key: "content", label: "Content", type: "richtext" },
  ];

  return (
    <div>
      <SCPHeader title="Administration" subtitle="SYSTEM MANAGEMENT CONSOLE" icon={Settings} />

      <Tabs defaultValue="scps">
        <TabsList className="bg-card border border-border mb-6 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="scps" className="font-mono text-xs gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Database className="w-3 h-3" /> SCPs</TabsTrigger>
          <TabsTrigger value="personnel" className="font-mono text-xs gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Users className="w-3 h-3" /> Personnel</TabsTrigger>
          <TabsTrigger value="docs" className="font-mono text-xs gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><FileText className="w-3 h-3" /> Docs</TabsTrigger>
          <TabsTrigger value="lore" className="font-mono text-xs gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><BookOpen className="w-3 h-3" /> Lore</TabsTrigger>
          <TabsTrigger value="rules" className="font-mono text-xs gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Scale className="w-3 h-3" /> Rules</TabsTrigger>
          <TabsTrigger value="announcements" className="font-mono text-xs gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Megaphone className="w-3 h-3" /> Announce</TabsTrigger>
          <TabsTrigger value="departments" className="font-mono text-xs gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Building2 className="w-3 h-3" /> Depts</TabsTrigger>
          <TabsTrigger value="events" className="font-mono text-xs gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Calendar className="w-3 h-3" /> Events</TabsTrigger>
          <TabsTrigger value="logs" className="font-mono text-xs gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><ClipboardList className="w-3 h-3" /> Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="scps">
          <AdminSection
            title="SCP ENTRIES" icon={Database} items={data.scps}
            onAdd={() => setDialog({ open: true, type: "scp", item: null })}
            onEdit={item => setDialog({ open: true, type: "scp", item })}
            onDelete={item => handleDeleteItem("scps", "SCPEntry", item)}
            columns={["DESIGNATION", "TITLE", "CLASS", "CLEARANCE", "STATUS"]}
            renderRow={item => (
              <>
                <td className="p-3 font-mono text-primary font-bold text-xs">{item.designation}</td>
                <td className="p-3 text-xs truncate max-w-[200px]">{item.title}</td>
                <td className="p-3 text-xs font-mono">{item.object_class}</td>
                <td className="p-3 text-xs font-mono">{item.clearance_level}</td>
                <td className="p-3 text-xs font-mono">{item.status}</td>
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="personnel">
          <AdminSection
            title="PERSONNEL" icon={Users} items={data.personnel}
            onAdd={() => setDialog({ open: true, type: "personnel", item: null })}
            onEdit={item => setDialog({ open: true, type: "personnel", item })}
            onDelete={item => handleDeleteItem("personnel", "Personnel", item)}
            columns={["NAME", "RANK", "DEPARTMENT", "CLEARANCE", "STATUS"]}
            renderRow={item => (
              <>
                <td className="p-3 text-xs font-medium">{item.name}</td>
                <td className="p-3 text-xs font-mono">{item.rank}</td>
                <td className="p-3 text-xs">{item.department}</td>
                <td className="p-3 text-xs font-mono">{item.clearance_level}</td>
                <td className="p-3 text-xs font-mono">{item.status}</td>
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="docs">
          <AdminSection
            title="DOCUMENTS" icon={FileText} items={data.docs}
            onAdd={() => setDialog({ open: true, type: "doc", item: null })}
            onEdit={item => setDialog({ open: true, type: "doc", item })}
            onDelete={item => handleDeleteItem("docs", "SecureDocument", item)}
            columns={["TITLE", "TYPE", "CLASSIFICATION", "CLEARANCE", "STATUS"]}
            renderRow={item => (
              <>
                <td className="p-3 text-xs truncate max-w-[200px]">{item.title}</td>
                <td className="p-3 text-xs">{item.document_type}</td>
                <td className="p-3 text-xs font-mono">{item.classification}</td>
                <td className="p-3 text-xs font-mono">{item.clearance_level}</td>
                <td className="p-3 text-xs font-mono">{item.status}</td>
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="lore">
          <AdminSection
            title="LORE ENTRIES" icon={BookOpen} items={data.lore}
            onAdd={() => setDialog({ open: true, type: "lore", item: null })}
            onEdit={item => setDialog({ open: true, type: "lore", item })}
            onDelete={item => handleDeleteItem("lore", "LoreEntry", item)}
            columns={["TITLE", "CATEGORY", "CLEARANCE", "STATUS"]}
            renderRow={item => (
              <>
                <td className="p-3 text-xs truncate max-w-[200px]">{item.title}</td>
                <td className="p-3 text-xs">{item.category}</td>
                <td className="p-3 text-xs font-mono">{item.clearance_level}</td>
                <td className="p-3 text-xs font-mono">{item.status}</td>
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="rules">
          <AdminSection
            title="RULES" icon={Scale} items={data.rules}
            onAdd={() => setDialog({ open: true, type: "rule", item: null })}
            onEdit={item => setDialog({ open: true, type: "rule", item })}
            onDelete={item => handleDeleteItem("rules", "Rule", item)}
            columns={["TITLE", "CATEGORY", "ORDER", "STATUS"]}
            renderRow={item => (
              <>
                <td className="p-3 text-xs truncate max-w-[200px]">{item.title}</td>
                <td className="p-3 text-xs">{item.category}</td>
                <td className="p-3 text-xs font-mono">{item.order_index}</td>
                <td className="p-3 text-xs font-mono">{item.status}</td>
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="announcements">
          <AdminSection
            title="ANNOUNCEMENTS" icon={Megaphone} items={data.announcements}
            onAdd={() => setDialog({ open: true, type: "announcement", item: null })}
            onEdit={item => setDialog({ open: true, type: "announcement", item })}
            onDelete={item => handleDeleteItem("announcements", "Announcement", item)}
            columns={["TITLE", "PRIORITY", "CLEARANCE", "STATUS"]}
            renderRow={item => (
              <>
                <td className="p-3 text-xs truncate max-w-[200px]">{item.title}</td>
                <td className="p-3 text-xs font-mono">{item.priority}</td>
                <td className="p-3 text-xs font-mono">{item.clearance_level}</td>
                <td className="p-3 text-xs font-mono">{item.status}</td>
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="departments">
          <AdminSection
            title="DEPARTMENTS" icon={Building2} items={data.departments}
            onAdd={() => setDialog({ open: true, type: "department", item: null })}
            onEdit={item => setDialog({ open: true, type: "department", item })}
            onDelete={item => handleDeleteItem("departments", "Department", item)}
            columns={["NAME", "TYPE", "CLEARANCE", "STATUS"]}
            renderRow={item => (
              <>
                <td className="p-3 text-xs font-medium">{item.name}</td>
                <td className="p-3 text-xs">{item.department_type}</td>
                <td className="p-3 text-xs font-mono">{item.clearance_level}</td>
                <td className="p-3 text-xs font-mono">{item.status}</td>
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="events">
          <AdminSection
            title="EVENTS" icon={Calendar} items={data.events}
            onAdd={() => setDialog({ open: true, type: "event", item: null })}
            onEdit={item => setDialog({ open: true, type: "event", item })}
            onDelete={item => handleDeleteItem("events", "Event", item)}
            columns={["TITLE", "TYPE", "DATE", "STATUS"]}
            renderRow={item => (
              <>
                <td className="p-3 text-xs truncate max-w-[200px]">{item.title}</td>
                <td className="p-3 text-xs">{item.event_type}</td>
                <td className="p-3 text-xs font-mono">{item.event_date ? moment(item.event_date).format("YYYY.MM.DD") : "-"}</td>
                <td className="p-3 text-xs font-mono">{item.status}</td>
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="logs">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-mono tracking-wider text-muted-foreground">AUDIT LOG (LAST 50)</h2>
            </div>
            {data.logs.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center text-sm text-muted-foreground">No audit logs yet.</div>
            ) : (
              <div className="bg-card border border-border rounded-lg overflow-hidden overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border">
                    <th className="text-left p-3 text-[10px] font-mono text-muted-foreground tracking-wider">TIME</th>
                    <th className="text-left p-3 text-[10px] font-mono text-muted-foreground tracking-wider">USER</th>
                    <th className="text-left p-3 text-[10px] font-mono text-muted-foreground tracking-wider">ACTION</th>
                    <th className="text-left p-3 text-[10px] font-mono text-muted-foreground tracking-wider">TYPE</th>
                    <th className="text-left p-3 text-[10px] font-mono text-muted-foreground tracking-wider">DETAILS</th>
                  </tr></thead>
                  <tbody>
                    {data.logs.map(log => (
                      <tr key={log.id} className="border-b border-border/50">
                        <td className="p-3 text-xs font-mono text-muted-foreground">{moment(log.created_date).format("MM.DD HH:mm")}</td>
                        <td className="p-3 text-xs">{log.user_name}</td>
                        <td className="p-3 text-xs font-mono">{log.action}</td>
                        <td className="p-3 text-xs">{log.entity_type}</td>
                        <td className="p-3 text-xs text-muted-foreground truncate max-w-[200px]">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit/Create Dialog */}
      <Dialog open={dialog.open} onOpenChange={open => { if (!open) setDialog({ open: false }); }}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm tracking-wider">
              {dialog.item ? "EDIT RECORD" : "CREATE RECORD"}
            </DialogTitle>
          </DialogHeader>
          {dialog.type === "scp" && (
            <SCPForm initial={dialog.item} onSave={handleSaveSCP} onCancel={() => setDialog({ open: false })} />
          )}
          {dialog.type === "personnel" && (
            <SimpleForm initial={dialog.item} fields={personnelFields} onSave={f => handleSaveGeneric("Personnel", f)} onCancel={() => setDialog({ open: false })} />
          )}
          {dialog.type === "doc" && (
            <SimpleForm initial={dialog.item} fields={docFields} onSave={f => handleSaveGeneric("SecureDocument", f)} onCancel={() => setDialog({ open: false })} />
          )}
          {dialog.type === "lore" && (
            <SimpleForm initial={dialog.item} fields={loreFields} onSave={f => handleSaveGeneric("LoreEntry", f)} onCancel={() => setDialog({ open: false })} />
          )}
          {dialog.type === "rule" && (
            <SimpleForm initial={dialog.item} fields={ruleFields} onSave={f => handleSaveGeneric("Rule", f)} onCancel={() => setDialog({ open: false })} />
          )}
          {dialog.type === "announcement" && (
            <SimpleForm initial={dialog.item} fields={announcementFields} onSave={f => handleSaveGeneric("Announcement", f)} onCancel={() => setDialog({ open: false })} />
          )}
          {dialog.type === "department" && (
            <SimpleForm initial={dialog.item} fields={deptFields} onSave={f => handleSaveGeneric("Department", f)} onCancel={() => setDialog({ open: false })} />
          )}
          {dialog.type === "event" && (
            <SimpleForm initial={dialog.item} fields={eventFields} onSave={f => handleSaveGeneric("Event", f)} onCancel={() => setDialog({ open: false })} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}