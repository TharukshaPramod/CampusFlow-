import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Resources from "./pages/Resources/Resources";
import Bookings from "./pages/Bookings/Bookings";
import Incidents from "./pages/Incidents/Incidents";
import Notifications from "./pages/Notifications/Notifications";
import Dashboard from "./pages/Admin/Dashboard";
import Profile from "./pages/Profile/Profile";
import Login from "./pages/Auth/Login";
import AuthCallback from "./pages/Auth/Callback";
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

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Route>

      <Route
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
