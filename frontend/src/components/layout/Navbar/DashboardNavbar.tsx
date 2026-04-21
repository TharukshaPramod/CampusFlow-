import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, User, Menu, X, Bell, Layers } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

export const DashboardNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();

  const getLinkStyle = (path: string) => {
    return location.pathname.startsWith(path)
      ? "text-primary font-semibold"
      : "text-slate-600 hover:text-primary";
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Left side - Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary p-2 rounded-lg group-hover:bg-primary-light transition-colors">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Campus<span className="text-primary">Flow</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6 mr-4 border-r border-slate-200 pr-6">
              <Link to="/admin/resources" className={`text-sm font-medium transition-colors ${getLinkStyle('/admin/resource')}`}>Resources</Link>
              <Link to="/admin/bookings" className={`text-sm font-medium transition-colors ${getLinkStyle('/admin/booking')}`}>Bookings</Link>
              <Link to="/admin/incidents" className={`text-sm font-medium transition-colors ${getLinkStyle('/admin/incident')}`}>Support</Link>
              <Link to="/admin/users" className={`text-sm font-medium transition-colors ${getLinkStyle('/admin/user')}`}>System</Link>
            </nav>
            {/* Notifications */}
            <button className="relative p-2 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors text-sm"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left flex items-center gap-2 text-red-600 hover:bg-red-50 transition-colors text-sm border-t border-slate-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button className="p-2 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg">
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-primary hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mt-4 flex flex-col gap-2 md:hidden">
            <nav className="flex flex-col gap-1 border-b border-slate-200 pb-3 mb-3">
              <Link onClick={() => setMobileMenuOpen(false)} to="/admin/resources" className={`px-3 py-2 rounded-lg text-sm font-medium ${getLinkStyle('/admin/resource')}`}>Resources</Link>
              <Link onClick={() => setMobileMenuOpen(false)} to="/admin/bookings" className={`px-3 py-2 rounded-lg text-sm font-medium ${getLinkStyle('/admin/booking')}`}>Bookings</Link>
              <Link onClick={() => setMobileMenuOpen(false)} to="/admin/incidents" className={`px-3 py-2 rounded-lg text-sm font-medium ${getLinkStyle('/admin/incident')}`}>Support</Link>
              <Link onClick={() => setMobileMenuOpen(false)} to="/admin/users" className={`px-3 py-2 rounded-lg text-sm font-medium ${getLinkStyle('/admin/user')}`}>System</Link>
            </nav>
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <p className="text-sm font-medium text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500 mb-2">{user?.email}</p>
            <button
              onClick={() => {
                navigate('/profile');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm"
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
