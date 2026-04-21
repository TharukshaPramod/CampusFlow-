import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar/Navbar";
import { Footer } from "./Footer/Footer";

export const PublicLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative">
      <Navbar />
      <main className={`flex-1 w-full flex flex-col ${!isHome ? "pt-24" : ""}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
