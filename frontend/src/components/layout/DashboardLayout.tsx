import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { DashboardNavbar } from "./Navbar/DashboardNavbar";
import { Sidebar } from "./Sidebar/Sidebar";

export const DashboardLayout = () => {
  const location = useLocation();
  const isProfileRoute = location.pathname === "/profile";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <DashboardNavbar />
      <div className="flex flex-1 overflow-hidden">
        {!isProfileRoute && <Sidebar />}
        <main className={`flex-1 overflow-y-auto w-full ${isProfileRoute ? "p-0" : "p-6"}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
