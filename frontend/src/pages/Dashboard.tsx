import { useAuth } from "../hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  GitBranch,
  BriefcaseBusiness,
  Users,
  Plus,
  CalendarDays,
} from "lucide-react";
import "./Dashboard.css";

export default function Dashboard() {
  const { profile } = useAuth();
  const location = useLocation();

  const displayName = profile?.displayName || "User";
  const role = profile?.role || "User";

  const isAdmin = role.toLowerCase() === "administrator";

  console.log("PROFILE:", profile);
  console.log("ROLE:", role);
  console.log("IS ADMIN:", isAdmin);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-title">
          Food Systems Collective
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className={`nav-item ${
              isActive("/dashboard") ? "active" : ""
            }`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/organisations"
            className={`nav-item ${
              isActive("/organisations") ? "active" : ""
            }`}
          >
            <Building2 size={20} />
            <span>Organisations</span>
          </Link>

          <Link
            to="/pipeline"
            className={`nav-item ${
              isActive("/pipeline") ? "active" : ""
            }`}
          >
            <GitBranch size={20} />
            <span>Relationship Pipeline</span>
          </Link>

          <Link
            to="/opportunities"
            className={`nav-item ${
              isActive("/opportunities") ? "active" : ""
            }`}
          >
            <BriefcaseBusiness size={20} />
            <span>Opportunities</span>
          </Link>

          {/* Admin only */}
          {isAdmin && (
            <Link
              to="/admin/users"
              className={`nav-item ${
                isActive("/admin/users") ? "active" : ""
              }`}
            >
              <Users size={20} />
              <span>User Management "Admin only"</span>
            </Link>
          )}
        </nav>

        {/* Current user */}
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

      {/* Main content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Welcome back, {displayName}</h1>

          <p>
            Here's an overview of your active partnerships and tasks for today.
          </p>
        </header>

        {/* Summary cards */}
        <section className="summary-grid">
          <div className="summary-card">
            <span>Pending Follow-ups</span>
            <strong>12</strong>
          </div>

          <div className="summary-card">
            <span>Meetings Today</span>
            <strong>3</strong>
          </div>

          <div className="summary-card">
            <span>Total Active Organisations</span>
            <strong>40</strong>
          </div>

          <div className="summary-card">
            <span>Open Opportunities</span>
            <strong>8</strong>
          </div>
        </section>

        {/* Dashboard content */}
        <section className="dashboard-content">
          {/* Tasks */}
          <div className="tasks-section">
            <div className="section-header">
              <h2>Tasks Requiring Attention</h2>

              <button className="new-task-button">
                <Plus size={18} />
                New Task
              </button>
            </div>

            <div className="task-table">
              <div className="table-header">
                <span>Task</span>
                <span>Organisation</span>
                <span>Due Date</span>
                <span>Priority</span>
                <span>Status</span>
              </div>

              <div className="task-row">
                <span>Send contract</span>
                <span>Synthetix Global</span>
                <span>Aug 24, 2026</span>

                <span>
                  <span className="priority high">
                    ● High
                  </span>
                </span>

                <span className="status">
                  Haven’t Started
                </span>
              </div>

              <div className="task-row">
                <span>Review tech plans</span>
                <span>Aetheris Dynamics</span>
                <span>Aug 25, 2026</span>

                <span>
                  <span className="priority medium">
                    ● Medium
                  </span>
                </span>

                <span className="status">
                  In Progress
                </span>
              </div>

              <div className="task-row">
                <span>Prepare deck</span>
                <span>Vantage Point Analytics</span>
                <span>Aug 26, 2026</span>

                <span>
                  <span className="priority low">
                    ● Low
                  </span>
                </span>

                <span className="status">
                  In Progress
                </span>
              </div>

              <div className="task-row">
                <span>Schedule meeting</span>
                <span>OmniCorp Solutions</span>
                <span>Aug 27, 2026</span>

                <span>
                  <span className="priority medium">
                    ● Medium
                  </span>
                </span>

                <span className="status">
                  Haven’t Started
                </span>
              </div>
            </div>
          </div>

          {/* Meetings */}
          <div className="meetings-card">
            <h2>Meetings Today</h2>

            <div className="meeting">
              <div className="meeting-icon">
                <CalendarDays size={19} />
              </div>

              <div>
                <strong>Synthetix Global</strong>
                <p>10:00 AM • Meet the Team</p>
              </div>
            </div>

            <div className="meeting">
              <div className="meeting-icon">
                <CalendarDays size={19} />
              </div>

              <div>
                <strong>Aetheris Dynamics</strong>
                <p>1:30 PM • Technical Review</p>
              </div>
            </div>

            <div className="meeting">
              <div className="meeting-icon">
                <CalendarDays size={19} />
              </div>

              <div>
                <strong>Vantage Point Analytics</strong>
                <p>4:00 PM • Introductory Call</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
