import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Lead List", path: "/leads" },
  { label: "Filters", path: "/settings/filters" },
  { label: "Viability", path: "/settings/viability" },
  { label: "Refresh", path: "/settings/refresh" }
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span>Lead Discovery</span>
        </div>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link--active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span>{location.pathname}</span>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
