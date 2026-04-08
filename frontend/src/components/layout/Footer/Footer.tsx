import { Link } from 'react-router-dom';
import { Layers, Mail, MapPin, Phone } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-dark text-slate-300 pt-16 pb-8 border-t border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          
          {/* Brand & About */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Layers className="w-8 h-8 text-accent" />
              <span className="text-2xl font-bold tracking-tight text-white">
                Campus<span className="text-accent">Flow</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 mt-4 max-w-xs">
              The smart operations hub unifying facility booking, resource management, and incident resolution for modern educational institutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6 flex items-center">
              Quick Links
              <span className="ml-2 w-8 h-0.5 bg-accent rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/resources" className="hover:text-accent transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-600"></span> Facilities Catalogue
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-accent transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-600"></span> Make a Booking
                </Link>
              </li>
              <li>
                <Link to="/incidents" className="hover:text-accent transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-600"></span> Report an Incident
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-accent transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-600"></span> Staff Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-6 flex items-center">
              Support
              <span className="ml-2 w-8 h-0.5 bg-accent rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Help Center & FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">IT Service Desk</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-semibold mb-6 flex items-center">
              Contact Us
              <span className="ml-2 w-8 h-0.5 bg-accent rounded-full"></span>
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span>SLIIT Malabe Campus, <br/>New Kandy Rd, Malabe 10115</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <span>+94 11 241 3900</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <a href="mailto:support@campusflow.edu" className="hover:text-white transition-colors">support@campusflow.edu</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">
            &copy; {currentYear} CampusFlow System. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-medium">
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
