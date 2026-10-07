import { NavLink, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Lead List", path: "/leads" },
  { label: "Filters", path: "/settings/filters" },
  { label: "Viability", path: "/settings/viability" },
  { label: "Refresh", path: "/settings/refresh" }
];

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__name">Lead Discovery</span>
          <span className="brand__subtext">Annual report intelligence for NSE-listed companies</span>
        </div>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? "nav-link--active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span>Current route</span>
          <strong>{location.pathname}</strong>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
