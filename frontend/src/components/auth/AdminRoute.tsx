import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function AdminRoute() {
  const { profile, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (profile?.role !== "administrator") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
