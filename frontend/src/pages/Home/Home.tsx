import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, CalendarCheck, ShieldAlert, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

function Home() {
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const shouldCelebrate = sessionStorage.getItem('showLoginCelebration') === '1';
    if (!shouldCelebrate) {
      return;
    }

    setShowCelebration(true);
    sessionStorage.removeItem('showLoginCelebration');
  }, []);

  useEffect(() => {
    if (!showCelebration) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowCelebration(false);
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [showCelebration]);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const features = [
    {
      icon: <Building2 className="w-8 h-8 text-primary" />,
      title: "Facilities & Assets",
      description: "Comprehensive catalogue of all campus resources. Check availability and metadata in real-time.",
      link: "/resources"
    },
    {
      icon: <CalendarCheck className="w-8 h-8 text-accent" />,
      title: "Smart Booking",
      description: "Conflict-free scheduling for rooms, labs, and equipment with automated approval workflows.",
      link: "/bookings"
    },
    {
      icon: <ShieldAlert className="w-8 h-8 text-red-500" />,
      title: "Incident Tracking",
      description: "Report faults globally with image evidence. Real-time updates and technician assignment.",
      link: "/incidents"
    }
  ];

  return (
    <div className="w-full bg-slate-50">
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="fixed right-4 top-24 z-50 w-[min(92vw,22rem)]"
          >
            <div className="rounded-2xl border border-emerald-200/70 bg-gradient-to-r from-emerald-500 to-teal-500 p-[1px] shadow-2xl shadow-emerald-500/25">
              <div className="flex items-start gap-3 rounded-2xl bg-white/95 px-4 py-3 backdrop-blur">
                <div className="mt-0.5 rounded-full bg-emerald-100 p-2 text-emerald-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Signed in successfully</p>
                  <p className="text-xs text-slate-600">Welcome to CampusFlow. Ready to get started.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-40 -left-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8">
              Modernize Your <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Campus Operations
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed">
              A single unified hub for facility bookings, asset management, and instant maintenance reporting. Designed for modern universities.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link 
                to="/login"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5"
              >
                Access Hub <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/resources"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-700 hover:text-primary hover:border-primary border border-slate-200 px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-sm shadow-slate-200 hover:shadow-md hover:-translate-y-0.5"
              >
                View Facilities
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        {/* Subtle dot pattern background */}
        <div className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need in one place</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our comprehensive suite of tools simplifies daily campus operations, keeping students and staff focused on what matters.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                variants={fadeIn}
                className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/10 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-50 to-transparent opacity-80 z-0"></div>
                <div className="relative z-10">
                  <div className="bg-slate-50 border border-slate-100 w-16 h-16 rounded-xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-primary/5">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <Link 
                    to={feature.link}
                    className="inline-flex items-center text-sm font-semibold text-primary group-hover:text-primary-dark"
                  >
                    Explore module <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust & Verification Section */}
      <section className="py-20 bg-primary-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold mb-10">Built for Scale and Reliability</h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center w-full">
            <div className="flex flex-col items-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 flex-1 max-w-sm hover:bg-white/10 transition-colors">
              <CheckCircle2 className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-4xl font-extrabold mb-2 text-white">99.9%</h3>
              <p className="text-slate-300 text-sm uppercase tracking-wider">Uptime SLA</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 flex-1 max-w-sm hover:bg-white/10 transition-colors">
              <CheckCircle2 className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-4xl font-extrabold mb-2 text-white">Role-Based</h3>
              <p className="text-slate-300 text-sm uppercase tracking-wider">Secure Access Control</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 flex-1 max-w-sm hover:bg-white/10 transition-colors">
              <CheckCircle2 className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-4xl font-extrabold mb-2 text-white">Real-time</h3>
              <p className="text-slate-300 text-sm uppercase tracking-wider">Conflict Checking</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
