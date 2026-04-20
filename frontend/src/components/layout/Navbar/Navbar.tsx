import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Resources', path: '/resources' },
    { name: 'Bookings', path: '/bookings' },
    { name: 'Support', path: '/incidents' }
  ];

  const resolvedNavLinks = navLinks.map((link) => ({
    ...link,
    path: user || link.path === '/' ? link.path : '/login'
  }));
  const dashboardPath = user
    ? user.roles?.includes('ADMIN')
      ? '/admin'
      : '/resources'
    : '/login';

  return (
    <>
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/50 py-3' 
            : 'bg-white/50 backdrop-blur-sm border-b border-white/20 py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary p-2 rounded-lg group-hover:bg-primary-light transition-colors">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <span className={`text-xl font-bold tracking-tight ${isScrolled ? 'text-primary-dark' : 'text-slate-900'}`}>
                Campus<span className="text-primary">Flow</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {resolvedNavLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === link.path 
                      ? 'text-primary font-semibold' 
                      : isScrolled ? 'text-slate-600' : 'text-slate-700'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Call to Action */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                      isScrolled ? 'hover:bg-slate-100' : 'hover:bg-white/70'
                    }`}
                  >
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <span className={`text-sm font-medium ${isScrolled ? 'text-slate-700' : 'text-slate-800'}`}>
                      {user.name}
                    </span>
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
                      <Link
                        to="/profile"
                        className="w-full px-4 py-3 text-left flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors text-sm"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
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
              ) : (
                <Link 
                  to="/login" 
                  className={`text-sm font-medium hover:text-primary transition-colors ${
                    isScrolled ? 'text-slate-600' : 'text-slate-700'
                  }`}
                >
                  Log in
                </Link>
              )}
              <Link 
                to={dashboardPath}
                className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                Dashboard
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-slate-600 hover:text-primary hover:bg-slate-100 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-20 mx-auto max-w-7xl bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/50 shadow-lg overflow-hidden pointer-events-auto z-40 relative px-4 sm:px-6"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {resolvedNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-3 px-3">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="w-full text-center py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-center py-2.5 border border-red-200 rounded-lg text-red-600 font-medium hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link 
                    to="/login"
                    className="w-full text-center py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                )}
                <Link 
                  to={dashboardPath}
                  className="w-full text-center py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark shadow-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
