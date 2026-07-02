import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import { useCurrentUser } from "@/lib/useCurrentUser";
import LoadingScreen from "@/components/scp/LoadingScreen";

export default function AppLayout() {
  const { user, personnel, loading, clearanceLevel, isAdmin } = useCurrentUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingScreen message="INITIALIZING SECURE CONNECTION" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="scanline-overlay" />
      <Sidebar user={user} clearanceLevel={clearanceLevel} isAdmin={isAdmin} />
      <main className="lg:ml-[240px] min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 pt-14 lg:pt-8">
          <Outlet context={{ user, personnel, clearanceLevel, isAdmin }} />
        </div>
      </main>
    </div>
  );
}