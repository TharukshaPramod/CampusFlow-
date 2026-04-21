import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Box, Tags, BarChart2, Calendar, AlertTriangle, Users, Layers, LayoutDashboard } from "lucide-react";

/** Module link groups */
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
  { to: "/admin/incident-analytics", label: "Incident Analytics", icon: BarChart2 },
];

const systemLinks = [
  { to: "/admin/users", label: "User Management", icon: Users },
];

const moduleConfig: Record<string, { links: typeof resourceLinks; title: string; gradient: string; icon: typeof Box }> = {
  resource: { links: resourceLinks, title: "Resources Module", gradient: "from-blue-500 to-cyan-500", icon: Box },
  booking: { links: bookingLinks, title: "Bookings Module", gradient: "from-violet-500 to-purple-500", icon: Calendar },
  incident: { links: incidentLinks, title: "Support Module", gradient: "from-rose-500 to-orange-500", icon: AlertTriangle },
  system: { links: systemLinks, title: "System Module", gradient: "from-slate-600 to-slate-700", icon: Users },
};

export function Sidebar() {
  const location = useLocation();
  const path = location.pathname;

  let moduleKey = "system";
  if (path.startsWith("/admin/resource")) moduleKey = "resource";
  else if (path.startsWith("/admin/booking")) moduleKey = "booking";
  else if (path.startsWith("/admin/incident")) moduleKey = "incident";

  const mod = moduleConfig[moduleKey];

  return (
    <aside className="w-64 border-r border-slate-200/80 bg-white shrink-0 overflow-y-auto flex flex-col">
      {/* Brand header */}
      <div className="p-4 pb-0">
        <NavLink to="/admin" end className="flex items-center gap-2.5 group px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              Campus<span className="text-blue-500">Flow</span>
            </span>
            <p className="text-[10px] text-slate-400 font-medium -mt-0.5">Admin Panel</p>
          </div>
        </NavLink>
      </div>

      {/* Dashboard quick link */}
      <div className="px-4 pt-3 pb-1">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </NavLink>
      </div>

      {/* Module section */}
      <div className="flex-1 px-4 pt-4">
        <div className="mb-3 px-3 flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${mod.gradient}`} />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
            {mod.title}
          </p>
        </div>

        <nav className="space-y-1">
          {mod.links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-gradient-to-b ${mod.gradient}`}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-700" : ""}`} />
                    <span className="truncate">{link.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="p-4 border-t border-slate-100">
        <div className="px-3 py-2">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Quick Nav</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[
              { to: "/admin/resources", label: "Resources", color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
              { to: "/admin/bookings", label: "Bookings", color: "bg-violet-100 text-violet-700 hover:bg-violet-200" },
              { to: "/admin/incidents", label: "Incidents", color: "bg-rose-100 text-rose-700 hover:bg-rose-200" },
              { to: "/admin/users", label: "Users", color: "bg-slate-100 text-slate-700 hover:bg-slate-200" },
            ].map((q) => (
              <NavLink
                key={q.to}
                to={q.to}
                className={`text-[10px] px-2 py-1 rounded-md font-semibold transition-colors ${q.color}`}
              >
                {q.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
