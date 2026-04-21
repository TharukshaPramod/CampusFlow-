import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { Building2, CalendarCheck, ShieldAlert, ArrowRight, CheckCircle2, Sparkles, Zap, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/* ───────────────────── Hero Slides Data ───────────────────── */
const heroSlides = [
  {
    image: '/images/hero/campus-1.png',
    title: 'Modernize Your Campus Operations',
    subtitle: 'A unified hub for facility bookings, asset management, and instant maintenance reporting.',
  },
  {
    image: '/images/hero/campus-2.png',
    title: 'Smart Spaces, Smarter Scheduling',
    subtitle: 'Conflict-free room booking, real-time availability, and automated approval workflows.',
  },
  {
    image: '/images/hero/campus-3.png',
    title: 'Report. Resolve. Repeat.',
    subtitle: 'Instant incident tracking with image evidence, technician assignment, and live status updates.',
  },
];

/* ───────────────────── Features Data ───────────────────── */
const features = [
  {
    icon: <Building2 className="w-7 h-7" />,
    title: 'Facilities & Assets',
    description: 'Comprehensive catalogue of all campus resources. Check availability and metadata in real-time.',
    link: '/resources',
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    icon: <CalendarCheck className="w-7 h-7" />,
    title: 'Smart Booking',
    description: 'Conflict-free scheduling for rooms, labs, and equipment with automated approval workflows.',
    link: '/bookings',
    gradient: 'from-violet-500 to-purple-400',
  },
  {
    icon: <ShieldAlert className="w-7 h-7" />,
    title: 'Incident Tracking',
    description: 'Report faults globally with image evidence. Real-time updates and technician assignment.',
    link: '/incidents',
    gradient: 'from-rose-500 to-orange-400',
  },
];

/* ───────────────────── Process Steps ───────────────────── */
const steps = [
  { num: '01', title: 'Discover', desc: 'Browse the full catalogue of campus facilities and resources.', icon: <Building2 className="w-5 h-5" /> },
  { num: '02', title: 'Reserve', desc: 'Book rooms, labs, or equipment with real-time conflict checks.', icon: <CalendarCheck className="w-5 h-5" /> },
  { num: '03', title: 'Report', desc: 'Flag issues instantly with photo evidence and location tagging.', icon: <ShieldAlert className="w-5 h-5" /> },
  { num: '04', title: 'Resolve', desc: 'Track progress with live status updates and technician assignments.', icon: <CheckCircle2 className="w-5 h-5" /> },
];

/* ───────────────────── Animated Counter ───────────────────── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ───────────────────── 3D Tilt Card ───────────────────── */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-300 ease-out ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}

/* ───────────────────── Section Wrapper ───────────────────── */
function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*                        HOME PAGE                          */
/* ═══════════════════════════════════════════════════════════ */
function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  /* ── Login celebration toast ── */
  useEffect(() => {
    if (sessionStorage.getItem('showLoginCelebration') === '1') {
      setShowCelebration(true);
      sessionStorage.removeItem('showLoginCelebration');
    }
  }, []);

  useEffect(() => {
    if (!showCelebration) return;
    const t = setTimeout(() => setShowCelebration(false), 1500);
    return () => clearTimeout(t);
  }, [showCelebration]);

  /* ── Auto-play slider ── */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const goTo = (idx: number) => setCurrentSlide((idx + heroSlides.length) % heroSlides.length);

  return (
    <div className="w-full bg-slate-50">
      {/* ── Celebration Toast ── */}
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
                <div className="mt-0.5 rounded-full bg-emerald-100 p-2 text-emerald-600"><Sparkles className="h-4 w-4" /></div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Signed in successfully</p>
                  <p className="text-xs text-slate-600">Welcome to CampusFlow. Ready to get started.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════ HERO SLIDER ═══════════════ */}
      <section className="relative h-[92vh] min-h-[600px] overflow-hidden">
        {/* Background images — all stacked, only active one is visible */}
        {heroSlides.map((slide, idx) => (
          <motion.div
            key={idx}
            initial={false}
            animate={{ opacity: idx === currentSlide ? 1 : 0, scale: idx === currentSlide ? 1 : 1.08 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
            style={{ zIndex: idx === currentSlide ? 1 : 0 }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80" />
          </motion.div>
        ))}

        {/* Animated floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{ left: `${15 + i * 18}%`, top: `${20 + i * 12}%` }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                delay: i * 0.8,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Glassmorphism content overlay */}
        <div className="relative z-10 h-full flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Glassmorphism card */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/20">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6"
                  >
                    <Zap className="w-4 h-4 text-yellow-300" />
                    <span className="text-sm font-medium text-white/90">Smart Campus Platform</span>
                  </motion.div>

                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
                    {heroSlides[currentSlide].title.split(' ').map((word, idx) => {
                      const highlightWords = ['Campus', 'Smart', 'Smarter', 'Resolve.'];
                      const isHighlight = highlightWords.includes(word);
                      return (
                        <span key={idx}>
                          {isHighlight ? (
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">{word}</span>
                          ) : word}{' '}
                        </span>
                      );
                    })}
                  </h1>

                  <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
                    {heroSlides[currentSlide].subtitle}
                  </p>

                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Link
                      to="/login"
                      className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5"
                    >
                      Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      to="/resources"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/25 px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:-translate-y-0.5"
                    >
                      View Facilities
                    </Link>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slide navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button onClick={() => goTo(currentSlide - 1)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/15 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                  />
                ))}
              </div>
              <button onClick={() => goTo(currentSlide + 1)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/15 transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom wave divider */}
        <div className="absolute bottom-0 left-0 w-full z-10">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40L48 36C96 32 192 24 288 28C384 32 480 48 576 52C672 56 768 48 864 40C960 32 1056 24 1152 28C1248 32 1344 48 1392 56L1440 64V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V40Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* ═══════════════ FEATURES SECTION ═══════════════ */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <RevealSection className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 rounded-full px-4 py-1.5 text-sm font-semibold mb-4 border border-blue-100">
              <Sparkles className="w-4 h-4" /> Core Modules
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Everything you need in one place</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our comprehensive suite of tools simplifies daily campus operations, keeping students and staff focused on what matters.
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <RevealSection key={index} delay={index * 0.15}>
                <TiltCard>
                  <div className="bg-white rounded-2xl p-8 border border-slate-200/80 hover:border-transparent transition-all hover:shadow-2xl group relative overflow-hidden h-full">
                    {/* Gradient glow on hover */}
                    <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.gradient} rounded-full opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`} />

                    <div className="relative z-10" style={{ transform: 'translateZ(40px)' }}>
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                      <p className="text-slate-600 mb-6 leading-relaxed">{feature.description}</p>
                      <Link
                        to={feature.link}
                        className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 group/link"
                      >
                        Explore module <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </TiltCard>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS SECTION ═══════════════ */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-violet-50 text-violet-600 rounded-full px-4 py-1.5 text-sm font-semibold mb-4 border border-violet-100">
              <Clock className="w-4 h-4" /> Simple Process
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Get started in four simple steps. From discovery to resolution, CampusFlow handles it all.</p>
          </RevealSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-blue-200 via-violet-200 to-rose-200" />

            {steps.map((step, i) => (
              <RevealSection key={i} delay={i * 0.12}>
                <div className="relative text-center group">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white text-lg font-bold mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 relative z-10">
                    {step.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Step {step.num}</span>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS SECTION ═══════════════ */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <RevealSection className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Built for Scale & Reliability</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">Trusted infrastructure designed for the demands of modern educational institutions.</p>
          </RevealSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: 99.9, suffix: '%', label: 'Uptime SLA', icon: <CheckCircle2 className="w-6 h-6" /> },
              { value: 500, suffix: '+', label: 'Active Users', icon: <Users className="w-6 h-6" /> },
              { value: 10, suffix: 'K+', label: 'Bookings Made', icon: <CalendarCheck className="w-6 h-6" /> },
              { value: 24, suffix: '/7', label: 'Support Coverage', icon: <Zap className="w-6 h-6" /> },
            ].map((stat, i) => (
              <RevealSection key={i} delay={i * 0.1}>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300 group">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-1">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </h3>
                  <p className="text-sm text-slate-400 uppercase tracking-wider font-medium">{stat.label}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA SECTION ═══════════════ */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <RevealSection>
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-10 md:p-16 shadow-2xl shadow-blue-500/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2NEgzNnptMC0xMGg0djRIMzZ6bTEwIDBoNHY0SDQ2em0wIDEwaDR2NEg0NnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Transform Your Campus?</h2>
                <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Join hundreds of institutions already using CampusFlow to streamline their daily operations.</p>
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Start Now — It's Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}

export default Home;
