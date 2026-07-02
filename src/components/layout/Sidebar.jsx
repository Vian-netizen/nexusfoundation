const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Database, Users, FileText, BookOpen,
  Scale, Shield, Search, Settings, ChevronLeft, ChevronRight,
  Menu, X, AlertTriangle, Calendar, Building2, LogOut, User
} from "lucide-react";

import ClearanceBadge from "@/components/scp/ClearanceBadge";

const navItems = [
  { label: "Logistics Hub", path: "/", icon: LayoutDashboard },
  { label: "SCP Database", path: "/scp-database", icon: Database },
  { label: "Personnel", path: "/personnel", icon: Users },
  { label: "Documents", path: "/documents", icon: FileText },
  { label: "Lore Archive", path: "/lore", icon: BookOpen },
  { label: "Rules & Regs", path: "/rules", icon: Scale },
  { label: "Departments", path: "/departments", icon: Building2 },
  { label: "Events", path: "/events", icon: Calendar },
  { label: "Search", path: "/search", icon: Search },
];

const adminItems = [
  { label: "Admin Panel", path: "/admin", icon: Settings },
];

export default function Sidebar({ user, clearanceLevel, isAdmin }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    db.auth.logout("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
              <h1 className="text-sm font-bold font-mono tracking-wider text-foreground truncate">SCP FOUNDATION</h1>
              <p className="text-[10px] text-muted-foreground font-mono tracking-widest">SECURE · CONTAIN · PROTECT</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        <p className={`text-[10px] font-mono text-muted-foreground tracking-widest px-3 py-2 ${collapsed ? "text-center" : ""}`}>
          {collapsed ? "NAV" : "NAVIGATION"}
        </p>
        {navItems.map(item => {
          const active = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all group
                ${active
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent"
                }`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="my-3 h-px bg-sidebar-border" />
            <p className={`text-[10px] font-mono text-muted-foreground tracking-widest px-3 py-2 ${collapsed ? "text-center" : ""}`}>
              {collapsed ? "ADM" : "ADMINISTRATION"}
            </p>
            {adminItems.map(item => {
              const active = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all group
                    ${active
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent"
                    }`}
                >
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="mb-2">
            <ClearanceBadge level={clearanceLevel} />
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{user?.full_name || user?.email || "Operator"}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{user?.role?.toUpperCase()}</p>
            </div>
          )}
          <button onClick={handleLogout} className="p-1 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapse toggle (desktop) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center py-2 border-t border-sidebar-border text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-card border border-border rounded-lg text-foreground"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[260px] bg-sidebar z-50 border-r border-sidebar-border"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-3 right-3 p-1 text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:block fixed left-0 top-0 bottom-0 bg-sidebar border-r border-sidebar-border z-30 transition-all duration-300 ${collapsed ? "w-[60px]" : "w-[240px]"}`}>
        <SidebarContent />
      </aside>
    </>
  );
}