import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Resources from "./pages/Resources/Resources";
import Bookings from "./pages/Bookings/Bookings";
import Incidents from "./pages/Incidents/Incidents";
import Notifications from "./pages/Notifications/Notifications";
import Dashboard from "./pages/Admin/Dashboard";
import Login from "./pages/Auth/Login";
import { Header } from "./components/layout/Header/Header";
import { Sidebar } from "./components/layout/Sidebar/Sidebar";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
