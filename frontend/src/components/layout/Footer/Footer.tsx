import { Link } from 'react-router-dom';
import { Layers, Mail, MapPin, Phone, Globe, MessageCircle, Users, Send, Heart } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const quickLinks = [
    { to: '/resources', label: 'Facilities Catalogue' },
    { to: '/bookings', label: 'Make a Booking' },
    { to: '/incidents', label: 'Report an Incident' },
    { to: '/admin', label: 'Staff Dashboard' },
  ];

  const supportLinks = [
    { href: '#', label: 'Help Center & FAQ' },
    { href: '#', label: 'IT Service Desk' },
    { href: '#', label: 'Terms of Service' },
    { href: '#', label: 'Privacy Policy' },
  ];

  const socials = [
    { icon: <MessageCircle className="w-4 h-4" />, href: '#', label: 'Twitter', color: 'hover:bg-sky-500/20 hover:text-sky-400 hover:border-sky-500/30' },
    { icon: <Globe className="w-4 h-4" />, href: '#', label: 'Website', color: 'hover:bg-white/10 hover:text-white hover:border-white/20' },
    { icon: <Users className="w-4 h-4" />, href: '#', label: 'LinkedIn', color: 'hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500/30' },
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300 relative overflow-hidden">
      {/* Decorative top border gradient */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-20 right-[10%] w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px]" />
      </div>

      {/* ── Newsletter Banner ── */}
      <div className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Stay in the loop</h3>
              <p className="text-sm text-slate-400">Get the latest updates on campus features and maintenance schedules.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
              <div className="relative flex-1 md:w-72">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 shrink-0"
              >
                {subscribed ? 'Subscribed ✓' : <><Send className="w-4 h-4" /> Subscribe</>}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Main Footer Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">

          {/* Brand & About */}
          <div className="space-y-5">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Campus<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Flow</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
              The smart operations hub unifying facility booking, resource management, and incident resolution for modern educational institutions.
            </p>
            {/* Social icons */}
            <div className="flex gap-2 pt-2">
              {socials.map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 transition-all duration-300 ${social.color}`}
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
              Quick Links
              <span className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent" />
            </h3>
            <ul className="space-y-3 text-sm">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.to}
                    className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-500 transition-colors" />
                    <span className="relative">
                      {link.label}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-blue-400 group-hover:w-full transition-all duration-300" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
              Support
              <span className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent" />
            </h3>
            <ul className="space-y-3 text-sm">
              {supportLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-500 transition-colors" />
                    <span className="relative">
                      {link.label}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-blue-400 group-hover:w-full transition-all duration-300" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
              Contact Us
              <span className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent" />
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-400 shrink-0 mt-0.5 group-hover:bg-blue-500/10 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-slate-400">SLIIT Malabe Campus, <br/>New Kandy Rd, Malabe 10115</span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-400 shrink-0 group-hover:bg-blue-500/10 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-slate-400">+94 11 241 3900</span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-400 shrink-0 group-hover:bg-blue-500/10 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <a href="mailto:support@campusflow.edu" className="text-slate-400 hover:text-white transition-colors">support@campusflow.edu</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            &copy; {currentYear} CampusFlow System. Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> by SLIIT
          </p>
          <div className="flex gap-6 text-sm font-medium">
            <a href="#" className="text-slate-500 hover:text-white transition-colors relative group">
              Privacy
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-blue-400 group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors relative group">
              Terms
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-blue-400 group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors relative group">
              Cookies
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-blue-400 group-hover:w-full transition-all duration-300" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
