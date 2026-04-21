import { NavLink, useLocation } from "react-router-dom";
import { Box, Tags, BarChart2, Calendar, AlertTriangle, Users } from "lucide-react";

/** Modules Arrays */
const resourceLinks = [
  { to: "/admin/resources", label: "Resource Management", icon: Box },
  { to: "/admin/resource-types", label: "Resource Types", icon: Tags },
  { to: "/admin/resource-analytics", label: "Analytics", icon: BarChart2 },
];

const bookingLinks = [
  { to: "/admin/bookings", label: "Booking Management", icon: Calendar },
];

const incidentLinks = [
  { to: "/admin/incidents", label: "Incident Management", icon: AlertTriangle },
];

const systemLinks = [
  { to: "/admin/users", label: "User Management", icon: Users },
];

export function Sidebar() {
  const location = useLocation();
  const path = location.pathname;

  let links = systemLinks; 
  let moduleTitle = "System Module";

  if (path.startsWith("/admin/resource")) {
    links = resourceLinks;
    moduleTitle = "Resources Module";
  } else if (path.startsWith("/admin/booking")) {
    links = bookingLinks;
    moduleTitle = "Bookings Module";
  } else if (path.startsWith("/admin/incident")) {
    links = incidentLinks;
    moduleTitle = "Support Module";
  }

  return (
    <aside className="w-64 border-r border-slate-200 bg-white/70 p-4 shrink-0 overflow-y-auto">
      <nav className="space-y-1.5 text-sm font-medium text-slate-700">
        <div className="mb-6 px-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {moduleTitle}
          </p>
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "hover:bg-slate-100/80 text-slate-600 hover:text-slate-900"
                }`
              }
              end={link.to === "/" || link.to === "/admin"}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
