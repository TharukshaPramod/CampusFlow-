import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Check, Wrench, Hourglass, Circle } from "lucide-react";
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
};

type ActivityItem = {
  id: string;
  title: string;
  meta: string;
  tone: "blue" | "amber" | "green" | "slate" | "red";
};

type BookingRequest = {
  id: string;
  title: string;
  requestedBy: string;
  slot: string;
};

const activityDotTone: Record<ActivityItem["tone"], string> = {
  blue: "text-blue-400",
  amber: "text-amber-400",
  green: "text-emerald-400",
  slate: "text-slate-400",
  red: "text-rose-400",
};

const subLabelTone: Record<MetricCard["subTone"], string> = {
  positive: "text-emerald-600",
  negative: "text-rose-600",
  neutral: "text-slate-600",
};

const parseDate = (value?: string) => {
  if (value == null) return null;

  if (Array.isArray(value)) {
    const [y, m, d, h = 0, min = 0, s = 0] = value as number[];
    const dateFromArray = new Date(y, m - 1, d, h, min, s);
    return Number.isNaN(dateFromArray.getTime()) ? null : dateFromArray;
  }

  if (typeof value === "number") {
    const millis = value < 1_000_000_000_000 ? value * 1000 : value;
    const dateFromNumber = new Date(millis);
    return Number.isNaN(dateFromNumber.getTime()) ? null : dateFromNumber;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (/^\d+$/.test(trimmed)) {
      const numeric = Number(trimmed);
      const millis = numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;
      const dateFromNumericString = new Date(millis);
      return Number.isNaN(dateFromNumericString.getTime()) ? null : dateFromNumericString;
    }
  }

  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toRelativeTime = (date: Date) => {
  const diffMs = Date.now() - date.getTime();
  const absMinutes = Math.round(Math.abs(diffMs) / 60000);

  if (!Number.isFinite(absMinutes)) {
    return date.toLocaleDateString();
  }

  const absDays = Math.round(absMinutes / (60 * 24));
  if (absDays > 3650) {
    return date.toLocaleDateString();
  }

  const suffix = diffMs >= 0 ? "ago" : "from now";

  if (absMinutes < 60) {
    const value = Math.max(1, absMinutes);
    return `${value} minute${value === 1 ? "" : "s"} ${suffix}`;
  }

  const absHours = Math.round(absMinutes / 60);
  if (absHours < 24) {
    return `${absHours} hour${absHours === 1 ? "" : "s"} ${suffix}`;
  }

  return `${absDays} day${absDays === 1 ? "" : "s"} ${suffix}`;
};

const toSlotLabel = (startTime?: string, endTime?: string) => {
  const start = parseDate(startTime);
  const end = parseDate(endTime);
  if (!start || !end) return "Time not available";

  return `${start.toLocaleDateString([], { month: "short", day: "numeric" })}, ${start.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}-${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}`;
};

const incidentTone = (status: IncidentStatus): ActivityItem["tone"] => {
  if (status === IncidentStatus.RESOLVED) return "green";
  if (status === IncidentStatus.REJECTED) return "red";
  if (status === IncidentStatus.OPEN) return "amber";
  if (status === IncidentStatus.IN_PROGRESS) return "blue";
  return "slate";
};

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<ResourceAnalytics | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsData, bookingData, incidentData] = await Promise.all([
        analyticsService.getResourceAnalytics(),
        bookingService.getAllBookings(),
        incidentService.getAllIncidents(),
      ]);

      setAnalytics(analyticsData);
      setBookings(bookingData);
      setIncidents(incidentData);
    } catch {
      setError("Failed to load admin dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const pendingBookings = useMemo(
    () => bookings.filter((item) => item.status === BookingStatus.PENDING),
    [bookings]
  );

  const activeBookingCount = useMemo(
    () =>
      bookings.filter(
        (item) => item.status === BookingStatus.PENDING || item.status === BookingStatus.APPROVED
      ).length,
    [bookings]
  );

  const openTicketCount = useMemo(
    () =>
      incidents.filter(
        (item) => item.status === IncidentStatus.OPEN || item.status === IncidentStatus.IN_PROGRESS
      ).length,
    [incidents]
  );

  const openSinceYesterday = useMemo(() => {
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    return incidents.filter((item) => {
      const createdAt = parseDate(item.createdAt);
      if (!createdAt) return false;
      return (
        createdAt.getTime() >= yesterday &&
        (item.status === IncidentStatus.OPEN || item.status === IncidentStatus.IN_PROGRESS)
      );
    }).length;
  }, [incidents]);

  const metricCards: MetricCard[] = [
    {
      title: "Total Resources",
      value: analytics?.totalResources ?? 0,
      subLabel: `${analytics?.activeResources ?? 0} active resources`,
      subTone: "positive",
      icon: <Building2 className="h-4 w-4" />,
    },
    {
      title: "Active Bookings",
      value: activeBookingCount,
      subLabel: `${pendingBookings.length} pending review`,
      subTone: pendingBookings.length > 0 ? "neutral" : "positive",
      icon: <Check className="h-4 w-4" />,
    },
    {
      title: "Open Tickets",
      value: openTicketCount,
      subLabel: `${openSinceYesterday} since yesterday`,
      subTone: openTicketCount > 0 ? "negative" : "positive",
      icon: <Wrench className="h-4 w-4" />,
    },
    {
      title: "Pending Approval",
      value: pendingBookings.length,
      subLabel: pendingBookings.length > 0 ? "Needs attention" : "All clear",
      subTone: pendingBookings.length > 0 ? "neutral" : "positive",
      icon: <Hourglass className="h-4 w-4" />,
    },
  ];

  const recentActivity: ActivityItem[] = useMemo(() => {
    const incidentActivity = incidents
      .map((item) => {
        const createdAt = parseDate(item.createdAt);
        return {
          id: `inc-${item.id}`,
          sortTime: createdAt?.getTime() ?? 0,
          title: `${item.ticketNumber} ${item.status.toLowerCase().replace("_", " ")}`,
          meta: `${item.creatorName || "User"} - ${createdAt ? toRelativeTime(createdAt) : "recently"}`,
          tone: incidentTone(item.status),
        };
      })
      .slice(0, 8);

    const bookingActivity = pendingBookings.map((item) => {
      const start = parseDate(item.startTime);
      return {
        id: `bk-${item.id}`,
        sortTime: start?.getTime() ?? 0,
        title: `${item.resourceName || "Resource"} booking requested`,
        meta: `${item.userName || "User"} - ${toSlotLabel(item.startTime, item.endTime)}`,
        tone: "blue" as const,
      };
    });

    return [...incidentActivity, ...bookingActivity]
      .sort((a, b) => b.sortTime - a.sortTime)
      .slice(0, 5)
      .map(({ id, title, meta, tone }) => ({ id, title, meta, tone }));
  }, [incidents, pendingBookings]);

  const bookingRequests: BookingRequest[] = useMemo(
    () =>
      [...pendingBookings]
        .sort((a, b) => {
          const left = parseDate(a.startTime)?.getTime() ?? 0;
          const right = parseDate(b.startTime)?.getTime() ?? 0;
          return left - right;
        })
        .slice(0, 3)
        .map((item) => ({
          id: item.id,
          title: item.resourceName || "Resource booking",
          requestedBy: item.userName || "Unknown user",
          slot: toSlotLabel(item.startTime, item.endTime),
        })),
    [pendingBookings]
  );

  const handleApprove = async (id: string) => {
    try {
      await bookingService.updateBookingStatus(id, { status: BookingStatus.APPROVED });
      await fetchDashboardData();
    } catch {
      setError("Failed to approve booking request.");
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Enter rejection reason:")?.trim();
    if (!reason) {
      return;
    }

    try {
      await bookingService.updateBookingStatus(id, { status: BookingStatus.REJECTED, reason });
      await fetchDashboardData();
    } catch {
      setError("Failed to reject booking request.");
    }
  };

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-7xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
          Loading admin dashboard...
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                  {card.title}
                </p>
                <span className="text-slate-400">{card.icon}</span>
              </div>
              <p className="text-4xl font-bold leading-none text-slate-900">{card.value}</p>
              <p className={`mt-4 text-sm font-medium ${subLabelTone[card.subTone]}`}>
                {card.subLabel}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Recent Activity</h2>
                <p className="mt-0.5 text-sm text-slate-500">Last 24 hours</p>
              </div>
              <Link to="/admin/incidents" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
                View all
              </Link>
            </div>

            <ul className="space-y-4">
              {recentActivity.length === 0 && (
                <li className="text-sm text-slate-500">No activity found.</li>
              )}

              {recentActivity.map((item, idx) => (
                <li key={item.id} className="relative pl-6">
                  {idx < recentActivity.length - 1 && (
                    <span className="absolute left-[7px] top-5 h-12 w-px bg-slate-200" aria-hidden="true" />
                  )}
                  <Circle
                    className={`absolute left-0 top-1 h-3.5 w-3.5 fill-current ${activityDotTone[item.tone]}`}
                  />
                  <p className="text-xl font-semibold text-slate-800">{item.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{item.meta}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Booking Requests</h2>
                <p className="mt-0.5 text-sm text-slate-500">Awaiting your approval</p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                {pendingBookings.length} pending
              </span>
            </div>

            <div className="space-y-3">
              {bookingRequests.length === 0 && (
                <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No pending booking approvals.
                </p>
              )}

              {bookingRequests.map((request) => (
                <article
                  key={request.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-xl font-semibold text-slate-800">{request.title}</h3>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                      PENDING
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Requested by {request.requestedBy} - {request.slot}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="rounded-lg border border-emerald-600 bg-emerald-500/15 px-4 py-1.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/25"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="rounded-lg border border-rose-600 bg-rose-500/15 px-4 py-1.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/25"
                    >
                      Reject
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
