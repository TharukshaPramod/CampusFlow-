import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Resources from "./pages/Resources/Resources";
import ResourceDetail from "./pages/Resources/ResourceDetail";
import ResourceCreate from "./pages/Resources/ResourceCreate";
import Bookings from "./pages/Bookings/Bookings";
import Incidents from "./pages/Incidents/Incidents";
import Notifications from "./pages/Notifications/Notifications";
import Dashboard from "./pages/Admin/Dashboard";
import Login from "./pages/Auth/Login";
import { PublicLayout } from "./components/layout/PublicLayout";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import ResourceTypes from "./pages/Admin/ResourceTypes";

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="/resources" element={<Resources />} />
        <Route path="/resources/create" element={<ResourceCreate />} />
        <Route path="/resources/:id" element={<ResourceDetail />} />
        <Route path="/resources/:id/edit" element={<ResourceCreate />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/resource-types" element={<ResourceTypes />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;