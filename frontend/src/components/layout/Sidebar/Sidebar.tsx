import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/resources", label: "Resources" },
  { to: "/bookings", label: "Bookings" },
  { to: "/incidents", label: "Incidents" },
  { to: "/notifications", label: "Notifications" },
  { to: "/admin", label: "Admin" }
];

export function Sidebar() {
  return (
    <aside className="w-56 border-r border-slate-200 bg-white/70 p-4">
      <nav className="space-y-2 text-sm font-medium text-slate-700">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block rounded px-3 py-2 ${isActive ? "bg-primary/10 text-primary" : "hover:bg-slate-100"}`
            }
            end={link.to === "/"}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
