import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
// Layout
import AppLayout from '@/components/layout/AppLayout';
// Pages
import Home from '@/pages/Home';
import SCPDatabase from '@/pages/SCPDatabase';
import SCPDetail from '@/pages/SCPDetail';
import PersonnelDatabase from '@/pages/PersonnelDatabase';
import PersonnelDetail from '@/pages/PersonnelDetail';
import Documents from '@/pages/Documents';
import DocumentDetail from '@/pages/DocumentDetail';
import Lore from '@/pages/Lore';
import LoreDetail from '@/pages/LoreDetail';
import Rules from '@/pages/Rules';
import Departments from '@/pages/Departments';
import Events from '@/pages/Events';
import GlobalSearch from '@/pages/GlobalSearch';
import Admin from '@/pages/Admin';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-2 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-2 border-transparent border-t-primary rounded-full animate-spin" />
          </div>
          <p className="text-xs font-mono text-muted-foreground tracking-widest">ESTABLISHING SECURE CONNECTION</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
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
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App