import { Outlet } from "react-router-dom";
import { DashboardNavbar } from "./Navbar/DashboardNavbar";
import { Sidebar } from "./Sidebar/Sidebar";

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <DashboardNavbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
