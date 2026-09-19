import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  GitBranch,
  BriefcaseBusiness,
  Users,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

/**
 * Shared application sidebar.
 *
 * Extracted from Dashboard.tsx so every screen uses one copy. Dashboard.tsx
 * still has its own inline version — switch it to this component when
 * convenient, then delete the duplicate.
 */
export default function Sidebar() {
  const { profile } = useAuth();
  const location = useLocation();

  const displayName = profile?.displayName || "User";
  const role = profile?.role || "User";

  const isAdmin = role.toLowerCase() === "administrator";

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside className="sidebar">
      <div className="sidebar-title">Food Systems Collective</div>

      <nav className="sidebar-nav">
        <Link
          to="/dashboard"
          className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/organisations"
          className={`nav-item ${isActive("/organisations") ? "active" : ""}`}
        >
          <Building2 size={20} />
          <span>Organisations</span>
        </Link>

        <Link
          to="/pipeline"
          className={`nav-item ${isActive("/pipeline") ? "active" : ""}`}
        >
          <GitBranch size={20} />
          <span>Relationship Pipeline</span>
        </Link>

        <Link
          to="/opportunities"
          className={`nav-item ${isActive("/opportunities") ? "active" : ""}`}
        >
          <BriefcaseBusiness size={20} />
          <span>Opportunities</span>
        </Link>

        {isAdmin && (
          <Link
            to="/admin/users"
            className={`nav-item ${isActive("/admin/users") ? "active" : ""}`}
          >
            <Users size={20} />
            <span>User Management</span>
          </Link>
        )}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">
          {displayName.charAt(0).toUpperCase()}
        </div>

        <div>
          <strong>{displayName}</strong>
          <span>[{role}]</span>
        </div>
      </div>
    </aside>
  );
}
