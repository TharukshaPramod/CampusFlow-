import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Resources from "./pages/Resources/Resources";
import ResourceDetail from "./pages/Resources/ResourceDetail";
import ResourceCreate from "./pages/Resources/ResourceCreate";
import Bookings from "./pages/Bookings/Bookings";
import Incidents from "./pages/Incidents/Incidents";
import Notifications from "./pages/Notifications/Notifications";
import Dashboard from "./pages/Admin/Dashboard";
import Users from "./pages/Admin/Users";
import Profile from "./pages/Profile/Profile";
import Login from "./pages/Auth/Login";
import AuthCallback from "./pages/Auth/Callback";
import AcceptInvite from "./pages/Auth/AcceptInvite";
import { PublicLayout } from "./components/layout/PublicLayout";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { useAuth } from "./hooks/useAuth";

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const RequireAdmin = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.roles?.includes("ADMIN")) {
    return <Navigate to="/" replace />;
  }

  return children;
};

import BookingCreate from "./pages/Bookings/BookingCreate";

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/accept-invite" element={<AcceptInvite />} />
      </Route>

      <Route
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Navigate to="/resources" replace />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/resources/:id" element={<ResourceDetail />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/bookings/new" element={<BookingCreate />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route
        element={
          <RequireAdmin>
            <DashboardLayout />
          </RequireAdmin>
        }
      >
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/resources/create" element={<ResourceCreate />} />
        <Route path="/resources/:id/edit" element={<ResourceCreate />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;