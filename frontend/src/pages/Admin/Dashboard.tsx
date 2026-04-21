import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Check, Wrench, Hourglass, Circle, ArrowRight, TrendingUp, Calendar, AlertTriangle } from "lucide-react";
import { analyticsService, type ResourceAnalytics } from "../../services/api/analyticsService";
import { bookingService } from "../../services/api/bookings";
import { incidentService } from "../../services/api/incidents";
import { Booking, BookingStatus } from "../../types/booking";
import { Incident, IncidentStatus } from "../../types/incident";

type MetricCard = {
  title: string;
  value: number;
  subLabel: string;
  subTone: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  gradient: string;
  shadowColor: string;
};

type ActivityItem = { id: string; title: string; meta: string; tone: "blue" | "amber" | "green" | "slate" | "red" };
type BookingRequest = { id: string; title: string; requestedBy: string; slot: string };

const activityDotTone: Record<ActivityItem["tone"], string> = {
  blue: "bg-blue-500", amber: "bg-amber-500", green: "bg-emerald-500", slate: "bg-slate-400", red: "bg-rose-500",
};

const parseDate = (value?: string) => {
  if (value == null) return null;
  if (Array.isArray(value)) {
    const [y, m, d, h = 0, min = 0, s = 0] = value as number[];
    const dt = new Date(y, m - 1, d, h, min, s);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  if (typeof value === "number") {
    const millis = value < 1_000_000_000_000 ? value * 1000 : value;
    const dt = new Date(millis);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^\d+$/.test(trimmed)) {
      const n = Number(trimmed);
      const millis = n < 1_000_000_000_000 ? n * 1000 : n;
      const dt = new Date(millis);
      return Number.isNaN(dt.getTime()) ? null : dt;
    }
  }
  const dt = new Date(value as string);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const toRelativeTime = (date: Date) => {
  const diffMs = Date.now() - date.getTime();
  const absMinutes = Math.round(Math.abs(diffMs) / 60000);
  if (!Number.isFinite(absMinutes)) return date.toLocaleDateString();
  const absDays = Math.round(absMinutes / (60 * 24));
  if (absDays > 3650) return date.toLocaleDateString();
  const suffix = diffMs >= 0 ? "ago" : "from now";
  if (absMinutes < 60) { const v = Math.max(1, absMinutes); return `${v}m ${suffix}`; }
  const absHours = Math.round(absMinutes / 60);
  if (absHours < 24) return `${absHours}h ${suffix}`;
  return `${absDays}d ${suffix}`;
};

const toSlotLabel = (startTime?: string, endTime?: string) => {
  const start = parseDate(startTime);
  const end = parseDate(endTime);
  if (!start || !end) return "Time not available";
  return `${start.toLocaleDateString([], { month: "short", day: "numeric" })}, ${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}-${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}`;
};

const incidentTone = (status: IncidentStatus): ActivityItem["tone"] => {
  if (status === IncidentStatus.RESOLVED) return "green";
  if (status === IncidentStatus.REJECTED) return "red";
  if (status === IncidentStatus.OPEN) return "amber";
  if (status === IncidentStatus.IN_PROGRESS) return "blue";
  return "slate";
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<ResourceAnalytics | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true); setError(null);
      const [analyticsData, bookingData, incidentData] = await Promise.all([
        analyticsService.getResourceAnalytics(), bookingService.getAllBookings(), incidentService.getAllIncidents(),
      ]);
      setAnalytics(analyticsData); setBookings(bookingData); setIncidents(incidentData);
    } catch { setError("Failed to load admin dashboard data."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const pendingBookings = useMemo(() => bookings.filter((b) => b.status === BookingStatus.PENDING), [bookings]);
  const activeBookingCount = useMemo(() => bookings.filter((b) => b.status === BookingStatus.PENDING || b.status === BookingStatus.APPROVED).length, [bookings]);
  const openTicketCount = useMemo(() => incidents.filter((i) => i.status === IncidentStatus.OPEN || i.status === IncidentStatus.IN_PROGRESS).length, [incidents]);
  const openSinceYesterday = useMemo(() => {
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    return incidents.filter((i) => { const c = parseDate(i.createdAt); return c && c.getTime() >= yesterday && (i.status === IncidentStatus.OPEN || i.status === IncidentStatus.IN_PROGRESS); }).length;
  }, [incidents]);

  const metricCards: MetricCard[] = [
    { title: "Total Resources", value: analytics?.totalResources ?? 0, subLabel: `${analytics?.activeResources ?? 0} active`, subTone: "positive", icon: <Building2 className="h-5 w-5" />, gradient: "from-blue-500 to-cyan-500", shadowColor: "shadow-blue-500/20" },
    { title: "Active Bookings", value: activeBookingCount, subLabel: `${pendingBookings.length} pending review`, subTone: pendingBookings.length > 0 ? "neutral" : "positive", icon: <Calendar className="h-5 w-5" />, gradient: "from-violet-500 to-purple-500", shadowColor: "shadow-violet-500/20" },
    { title: "Open Tickets", value: openTicketCount, subLabel: `${openSinceYesterday} since yesterday`, subTone: openTicketCount > 0 ? "negative" : "positive", icon: <AlertTriangle className="h-5 w-5" />, gradient: "from-rose-500 to-orange-500", shadowColor: "shadow-rose-500/20" },
    { title: "Pending Approval", value: pendingBookings.length, subLabel: pendingBookings.length > 0 ? "Needs attention" : "All clear", subTone: pendingBookings.length > 0 ? "neutral" : "positive", icon: <Hourglass className="h-5 w-5" />, gradient: "from-amber-500 to-orange-500", shadowColor: "shadow-amber-500/20" },
  ];

  const recentActivity: ActivityItem[] = useMemo(() => {
    const incAct = incidents.map((i) => { const c = parseDate(i.createdAt); return { id: `inc-${i.id}`, sortTime: c?.getTime() ?? 0, title: `${i.ticketNumber} ${i.status.toLowerCase().replace("_", " ")}`, meta: `${i.creatorName || "User"} - ${c ? toRelativeTime(c) : "recently"}`, tone: incidentTone(i.status) }; }).slice(0, 8);
    const bkAct = pendingBookings.map((b) => { const s = parseDate(b.startTime); return { id: `bk-${b.id}`, sortTime: s?.getTime() ?? 0, title: `${b.resourceName || "Resource"} booking requested`, meta: `${b.userName || "User"} - ${toSlotLabel(b.startTime, b.endTime)}`, tone: "blue" as const }; });
    return [...incAct, ...bkAct].sort((a, b) => b.sortTime - a.sortTime).slice(0, 5).map(({ id, title, meta, tone }) => ({ id, title, meta, tone }));
  }, [incidents, pendingBookings]);

  const bookingRequests: BookingRequest[] = useMemo(() =>
    [...pendingBookings].sort((a, b) => (parseDate(a.startTime)?.getTime() ?? 0) - (parseDate(b.startTime)?.getTime() ?? 0)).slice(0, 3).map((b) => ({ id: b.id, title: b.resourceName || "Resource booking", requestedBy: b.userName || "Unknown user", slot: toSlotLabel(b.startTime, b.endTime) })),
    [pendingBookings]
  );

  const handleApprove = async (id: string) => { try { await bookingService.updateBookingStatus(id, { status: BookingStatus.APPROVED }); await fetchDashboardData(); } catch { setError("Failed to approve booking."); } };
  const handleReject = async (id: string) => { const reason = window.prompt("Enter rejection reason:")?.trim(); if (!reason) return; try { await bookingService.updateBookingStatus(id, { status: BookingStatus.REJECTED, reason }); await fetchDashboardData(); } catch { setError("Failed to reject booking."); } };

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-7xl space-y-6">
        {/* Skeleton */}
        <div className="h-28 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-white border border-slate-200 animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          <div className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse" />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 p-6 sm:p-8 text-white"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-4 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 left-20 w-40 h-40 bg-cyan-300/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-cyan-300" />
            <span className="text-sm font-semibold text-cyan-200 uppercase tracking-wider">Admin Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, Administrator</h1>
          <p className="text-white/70 text-sm mt-1 max-w-lg">Here's what's happening across your campus today. Review pending actions and monitor system health.</p>
        </div>
      </motion.div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-200 font-medium text-sm flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> {error}</div>}

      {/* Metric Cards */}
      <motion.div
        initial="hidden" animate="show"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {metricCards.map((card) => (
          <motion.article
            key={card.title}
            variants={cardVariants}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{card.title}</p>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-md ${card.shadowColor} group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{card.value}</p>
            <p className={`mt-2 text-sm font-medium ${card.subTone === "positive" ? "text-emerald-600" : card.subTone === "negative" ? "text-rose-600" : "text-slate-500"}`}>
              {card.subLabel}
            </p>
          </motion.article>
        ))}
      </motion.div>

      {/* Activity + Booking Requests */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
              <p className="text-xs text-slate-400 mt-0.5">Latest updates across campus</p>
            </div>
            <Link to="/admin/incidents" className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ul className="space-y-4">
            {recentActivity.length === 0 && <li className="text-sm text-slate-400 py-4 text-center">No recent activity</li>}
            {recentActivity.map((item, idx) => (
              <li key={item.id} className="relative pl-6">
                {idx < recentActivity.length - 1 && <span className="absolute left-[5px] top-5 h-10 w-px bg-slate-200" />}
                <span className={`absolute left-0 top-1.5 w-3 h-3 rounded-full ${activityDotTone[item.tone]} ring-2 ring-white`} />
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.meta}</p>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Booking Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Booking Requests</h2>
              <p className="text-xs text-slate-400 mt-0.5">Awaiting your approval</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {pendingBookings.length} pending
            </span>
          </div>

          <div className="space-y-3">
            {bookingRequests.length === 0 && (
              <p className="rounded-xl bg-slate-50 border border-slate-200 p-6 text-sm text-slate-400 text-center">No pending booking approvals</p>
            )}
            {bookingRequests.map((req) => (
              <article key={req.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm truncate">{req.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{req.requestedBy} · {req.slot}</p>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-100 text-amber-700 border border-amber-200">Pending</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => handleApprove(req.id)} className="flex-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition shadow-sm flex items-center justify-center gap-1">
                    <Check size={13} strokeWidth={3} /> Approve
                  </button>
                  <button onClick={() => handleReject(req.id)} className="flex-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-2 text-xs font-bold text-red-600 transition flex items-center justify-center gap-1">
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Dashboard;
