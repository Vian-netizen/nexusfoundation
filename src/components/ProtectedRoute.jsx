import { Outlet, useLocation } from "react-router-dom";

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

export default function ProtectedRoute({
  fallback = <DefaultFallback />,
  unauthenticatedElement
}) {
  const location = useLocation();

  const params = new URLSearchParams(location.search);

  const uid =
    params.get("uid") ||
    localStorage.getItem("uid");

  const username =
    params.get("username") ||
    localStorage.getItem("username");

  const clearance =
    params.get("clearance") ||
    localStorage.getItem("clearance");

  // Save session
  if (uid) {
    localStorage.setItem("uid", uid);
  }

  if (username) {
    localStorage.setItem("username", username);
  }

  if (clearance) {
    localStorage.setItem("clearance", clearance);
  }

  if (!uid) {
    return unauthenticatedElement;
  }

  return <Outlet />;
}