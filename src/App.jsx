import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

import AppLayout from "@/components/layout/AppLayout";

import Home from "@/pages/Home";
import SCPDatabase from "@/pages/SCPDatabase";
import SCPDetail from "@/pages/SCPDetail";
import PersonnelDatabase from "@/pages/PersonnelDatabase";
import PersonnelDetail from "@/pages/PersonnelDetail";
import Documents from "@/pages/Documents";
import DocumentDetail from "@/pages/DocumentDetail";
import Lore from "@/pages/Lore";
import LoreDetail from "@/pages/LoreDetail";
import Rules from "@/pages/Rules";
import Departments from "@/pages/Departments";
import Events from "@/pages/Events";
import GlobalSearch from "@/pages/GlobalSearch";
import Admin from "@/pages/Admin";

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <ScrollToTop />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            element={
              <ProtectedRoute
                unauthenticatedElement={<Navigate to="/login" replace />}
              />
            }
          >
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/scp-database" element={<SCPDatabase />} />
              <Route path="/scp-database/:id" element={<SCPDetail />} />
              <Route path="/personnel" element={<PersonnelDatabase />} />
              <Route path="/personnel/:id" element={<PersonnelDetail />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/documents/:id" element={<DocumentDetail />} />
              <Route path="/lore" element={<Lore />} />
              <Route path="/lore/:id" element={<LoreDetail />} />
              <Route path="/rules" element={<Rules />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/events" element={<Events />} />
              <Route path="/search" element={<GlobalSearch />} />
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Route>

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>

      <Toaster />
    </QueryClientProvider>
  );
}

export default App;