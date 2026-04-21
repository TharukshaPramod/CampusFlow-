import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, Trash2, ChevronDown, CalendarCheck, SlidersHorizontal } from "lucide-react";
import { bookingService } from "../../services/api/bookings";
import { Booking, BookingStatus } from "../../types/booking";

const statusConfig: Record<BookingStatus, { bg: string; dot: string }> = {
  [BookingStatus.PENDING]: { bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  [BookingStatus.APPROVED]: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  [BookingStatus.REJECTED]: { bg: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
  [BookingStatus.CANCELLED]: { bg: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-400" },
};

const parseDate = (dateVal: any) => {
  if (Array.isArray(dateVal)) { const [y, m, d, h = 0, min = 0, s = 0] = dateVal; return new Date(y, m - 1, d, h, min, s); }
  return new Date(dateVal);
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [showDeleteDropdown, setShowDeleteDropdown] = useState(false);
  const [filterStatus, setFilterStatus] = useState<BookingStatus | "ALL">("ALL");

  const fetchBookings = async () => {
    try { setLoading(true); setError(null); setBookings(await bookingService.getAllBookings()); }
    catch { setError("Failed to load bookings."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleBulkDelete = async (timeRange: string) => {
    if (window.confirm(`Delete bookings for range '${timeRange}'?`)) {
      try { await bookingService.deleteBookings(timeRange); setShowDeleteDropdown(false); fetchBookings(); }
      catch { alert("Failed to delete bookings."); }
    }
  };

  const handleStatusUpdate = async (id: string, status: BookingStatus) => {
    try {
      const reason = status === BookingStatus.REJECTED ? rejectionReason : undefined;
      if (status === BookingStatus.REJECTED && (!reason || reason.trim() === "")) { alert("Please provide a rejection reason."); return; }
      await bookingService.updateBookingStatus(id, { status, reason });
      setRejectionReason(""); setRejectingId(null); fetchBookings();
    } catch { alert("Failed to update status."); }
  };

  const handleDeleteSingle = async (id: string, bookingNumber: string) => {
    if (window.confirm(`Permanently delete booking ${bookingNumber}?`)) {
      try { await bookingService.deleteBooking(id); fetchBookings(); }
      catch { alert("Failed to delete booking."); }
    }
  };

  const filteredBookings = filterStatus === "ALL" ? bookings : bookings.filter(b => b.status === filterStatus);

  return (
    <section className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Booking Administration</h1>
            <p className="text-slate-500 text-sm mt-0.5">Review, approve, and manage all campus reservations</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-violet-500/20">
            <SlidersHorizontal size={14} className="text-slate-400" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-transparent text-slate-700 font-medium text-sm py-2.5 pl-1 pr-6 appearance-none outline-none">
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="relative">
            <button onClick={() => setShowDeleteDropdown(!showDeleteDropdown)}
              className="flex items-center gap-1.5 border border-red-200 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl shadow-sm hover:bg-red-100 transition font-semibold text-sm">
              <Trash2 size={14} /> Purge <ChevronDown size={12} />
            </button>
            {showDeleteDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-1">
                <button onClick={() => handleBulkDelete('yesterday')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition">&gt; 1 Day Ago</button>
                <button onClick={() => handleBulkDelete('week')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition">&gt; 1 Week Ago</button>
                <button onClick={() => handleBulkDelete('month')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition">&gt; 1 Month Ago</button>
                <div className="border-t border-slate-100 my-1" />
                <button onClick={() => handleBulkDelete('all')} className="w-full text-left px-4 py-2.5 text-sm text-red-600 font-bold hover:bg-red-50 transition">Wipe All</button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-200 font-medium text-sm flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> {error}</div>}

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resource / User</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time Range</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purpose</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="space-y-1.5"><div className="h-4 bg-slate-100 rounded w-32" /><div className="h-3 bg-slate-100 rounded w-24" /></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-28" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-36" /></td>
                    <td className="px-6 py-4"><div className="h-5 bg-slate-100 rounded-full w-16" /></td>
                    <td className="px-6 py-4"><div className="h-8 bg-slate-100 rounded w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredBookings.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No bookings match your filter</td></tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-violet-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-semibold text-slate-800 text-sm group-hover:text-violet-600 transition-colors">{b.resourceName || 'Unknown'}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{b.userName || 'System'}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1">{b.bookingNumber}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-xs font-medium text-slate-700">{parseDate(b.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                      <div className="text-slate-400 text-xs flex items-center gap-1.5 mt-1"><span className="w-1 h-1 bg-slate-300 rounded-full" /> {parseDate(b.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 max-w-xs">
                      <p className="line-clamp-2" title={b.purpose}>{b.purpose}</p>
                      {b.expectedAttendees > 0 && <span className="text-[10px] inline-flex items-center gap-1 mt-2 bg-slate-100 px-2 py-0.5 rounded text-slate-500">{b.expectedAttendees} Expected</span>}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border w-fit ${statusConfig[b.status].bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[b.status].dot}`} />{b.status}
                      </span>
                      {b.status === BookingStatus.REJECTED && b.rejectionReason && (
                        <div className="text-[10px] text-red-600 mt-2 max-w-[150px] bg-red-50 p-2 rounded-lg border border-red-100 line-clamp-2" title={b.rejectionReason}>Note: {b.rejectionReason}</div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap text-sm">
                      <div className="flex flex-col items-end gap-2">
                        {b.status === BookingStatus.PENDING && rejectingId !== b.id && (
                          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-0.5">
                            <button onClick={() => handleStatusUpdate(b.id, BookingStatus.APPROVED)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-700 shadow-sm hover:shadow rounded-lg text-xs font-bold transition">
                              <Check size={13} strokeWidth={3} /> Approve
                            </button>
                            <button onClick={() => setRejectingId(b.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition">
                              <X size={13} strokeWidth={3} /> Reject
                            </button>
                          </div>
                        )}
                        {rejectingId === b.id && (
                          <div className="flex flex-col items-end gap-2 bg-red-50 p-3 rounded-xl border border-red-100 shadow-sm">
                            <input type="text" placeholder="Why reject?" className="border border-red-200 rounded-lg px-3 py-2 text-xs w-48 focus:ring-2 focus:ring-red-200 focus:outline-none placeholder-red-300 text-red-900" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} autoFocus />
                            <div className="flex gap-2">
                              <button onClick={() => setRejectingId(null)} className="px-3 py-1.5 text-slate-500 hover:bg-slate-200 rounded-lg bg-slate-100 text-xs font-bold transition">Cancel</button>
                              <button onClick={() => handleStatusUpdate(b.id, BookingStatus.REJECTED)} className="px-3 py-1.5 bg-red-600 text-white shadow-sm hover:bg-red-700 rounded-lg text-xs font-bold transition">Confirm</button>
                            </div>
                          </div>
                        )}
                        {b.status !== BookingStatus.PENDING && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">Processed</span>
                            <button onClick={() => handleDeleteSingle(b.id, b.bookingNumber)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={14} /></button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </section>
  );
}
