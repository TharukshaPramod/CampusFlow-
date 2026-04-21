import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, PenSquare, Trash2, Clock, X, Printer, CalendarCheck, Plus, Sparkles } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { bookingService } from "../../services/api/bookings";
import { Booking, BookingStatus } from "../../types/booking";

const statusConfig: Record<BookingStatus, { bg: string; dot: string; strip: string }> = {
  [BookingStatus.PENDING]: { bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", strip: "from-amber-400 to-orange-400" },
  [BookingStatus.APPROVED]: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", strip: "from-emerald-400 to-teal-400" },
  [BookingStatus.REJECTED]: { bg: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500", strip: "from-red-400 to-rose-400" },
  [BookingStatus.CANCELLED]: { bg: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-400", strip: "from-slate-300 to-slate-400" },
};

const parseDate = (dateVal: any) => {
  if (Array.isArray(dateVal)) {
    const [y, m, d, h = 0, min = 0, s = 0] = dateVal;
    return new Date(y, m - 1, d, h, min, s);
  }
  return new Date(dateVal);
};

function LiveCountdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      if (diff <= 0) { setTimeLeft("Started"); return; }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const parts = [];
      if (d > 0) parts.push(`${d}d`);
      if (h > 0) parts.push(`${h}h`);
      if (m > 0 || parts.length === 0) parts.push(`${m}m`);
      setTimeLeft(parts.join(" "));
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return <span className="font-mono font-bold text-slate-800 text-sm">{timeLeft}</span>;
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    try { setLoading(true); setError(null); setBookings(await bookingService.getAllBookings()); }
    catch { setError("Failed to load bookings."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id: string) => {
    if (window.confirm("Cancel this booking?")) {
      try { await bookingService.updateBookingStatus(id, { status: BookingStatus.CANCELLED }); fetchBookings(); }
      catch { alert("Failed to cancel booking."); }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Permanently delete this booking?")) {
      try { await bookingService.deleteBooking(id); fetchBookings(); }
      catch { alert("Failed to delete booking."); }
    }
  };

  const handlePrint = () => { window.print(); };

  return (
    <section className="space-y-6 max-w-5xl mx-auto pb-12 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Bookings</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage your active reservations and passes</p>
          </div>
        </div>
        <Link
          to="/bookings/new"
          className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white px-6 py-2.5 text-sm font-semibold rounded-xl shadow-sm shadow-violet-500/20 hover:shadow-md transition-all"
        >
          <Plus className="w-4 h-4" /> Request Booking
        </Link>
      </motion.div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-200 font-medium text-sm flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> {error}</div>}

      {/* Cards */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
              <div className="p-5 space-y-4">
                <div className="flex justify-between"><div className="h-5 bg-slate-100 rounded-lg w-1/2" /><div className="h-5 bg-slate-100 rounded-full w-20" /></div>
                <div className="h-12 bg-slate-50 rounded-lg" />
                <div className="grid grid-cols-2 gap-2"><div className="h-14 bg-slate-50 rounded-lg" /><div className="h-14 bg-slate-50 rounded-lg" /></div>
              </div>
            </div>
          ))
        ) : bookings.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full bg-white p-16 text-center rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-violet-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">No bookings yet</h3>
            <p className="text-slate-500 text-sm mb-6">Start by reserving a room, lab, or piece of equipment.</p>
            <Link to="/bookings/new" className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm">
              <Plus className="w-4 h-4" /> Create First Booking
            </Link>
          </motion.div>
        ) : (
          bookings.map((b) => {
            const startDate = parseDate(b.startTime);
            const endDate = parseDate(b.endTime);
            const isApproved = b.status === BookingStatus.APPROVED;
            const isPending = b.status === BookingStatus.PENDING;
            const cfg = statusConfig[b.status];

            return (
              <motion.div
                key={b.id}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-slate-300/60 transition-all duration-300 flex overflow-hidden"
              >
                {/* Left status strip */}
                <div className={`w-1.5 bg-gradient-to-b ${cfg.strip} shrink-0`} />

                <div className="p-5 flex flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-lg leading-tight truncate">{b.resourceName || "Resource"}</h3>
                      <p className="text-xs text-slate-400 mt-1 font-mono tracking-tight">{b.bookingNumber}</p>
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border shrink-0 ${cfg.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {b.status}
                    </span>
                  </div>

                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 line-clamp-2 mb-3">
                    {b.purpose}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Start</p>
                      <p className="font-medium text-slate-800 text-xs">{startDate.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">End</p>
                      <p className="font-medium text-slate-800 text-xs">{endDate.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-3 mt-auto">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Clock size={10} /> Starts In</span>
                        <LiveCountdown targetDate={startDate} />
                      </div>
                      {isApproved && (
                        <button
                          onClick={() => setSelectedTicket(b)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-xl text-sm font-semibold hover:from-slate-700 hover:to-slate-600 transition shadow-sm"
                        >
                          <QrCode size={16} /> Get Ticket
                        </button>
                      )}
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2">
                        <Link to={`/bookings/${b.id}/edit`} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-sm font-semibold transition">
                          <PenSquare size={14} /> Edit
                        </Link>
                        <button onClick={() => handleCancel(b.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-xl text-sm font-semibold transition">
                          <X size={14} /> Cancel
                        </button>
                        <button onClick={() => handleDelete(b.id)} className="py-2 px-3 text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl text-sm font-semibold transition" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}

                    {!isPending && !isApproved && (
                      <div className="flex justify-end">
                        <button onClick={() => handleDelete(b.id)} className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition" title="Remove">
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* QR Code Ticket Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:bg-white print:p-0"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 relative print:shadow-none print:border-0"
            >
              <button onClick={() => setSelectedTicket(null)} className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm text-slate-600 rounded-full hover:bg-slate-100 transition z-10 print:hidden">
                <X size={20} />
              </button>

              <div className="bg-gradient-to-br from-violet-600 to-purple-600 p-8 text-center text-white pb-10">
                <p className="text-white/70 font-mono text-sm tracking-widest mb-1.5 uppercase">CampusFlow Ticket</p>
                <h2 className="text-2xl font-bold">{selectedTicket.resourceName}</h2>
                <p className="text-white/80 text-sm mt-2 max-w-[200px] mx-auto line-clamp-1">{selectedTicket.purpose}</p>
              </div>

              <div className="px-8 pb-8 pt-6 text-center relative -mt-6 bg-white rounded-t-3xl text-sm">
                <div className="inline-block p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 mx-auto relative z-10">
                  <QRCodeSVG
                    value={JSON.stringify({ id: selectedTicket.bookingNumber, purpose: selectedTicket.purpose })}
                    size={180} level="H" includeMargin={false}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-left border-y border-dashed border-slate-200 py-4 mb-6">
                  <div>
                    <p className="text-xs uppercase text-slate-400 font-bold tracking-wider">Start Time</p>
                    <p className="font-semibold text-slate-800">{parseDate(selectedTicket.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-xs text-slate-500">{parseDate(selectedTicket.startTime).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase text-slate-400 font-bold tracking-wider">End Time</p>
                    <p className="font-semibold text-slate-800">{parseDate(selectedTicket.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-xs text-slate-500">{parseDate(selectedTicket.endTime).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="text-center font-mono text-slate-500 tracking-[0.25em] text-xs">{selectedTicket.bookingNumber}</div>

                <button onClick={handlePrint} className="w-full mt-8 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition flex items-center justify-center gap-2 print:hidden">
                  <Printer size={18} /> Print as PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Bookings;
