import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { QrCode, PenSquare, Trash2, Clock, X, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { bookingService } from "../../services/api/bookings";
import { Booking, BookingStatus } from "../../types/booking";

const statusColors: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [BookingStatus.APPROVED]: "bg-green-100 text-green-800 border-green-200",
  [BookingStatus.REJECTED]: "bg-red-100 text-red-800 border-red-200",
  [BookingStatus.CANCELLED]: "bg-slate-100 text-slate-600 border-slate-200",
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

      if (diff <= 0) {
        setTimeLeft("Started/Expired");
        return;
      }

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

  return <span className="font-mono font-medium text-slate-600">{timeLeft}</span>;
}

function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // QR Modal State
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getAllBookings();
      setBookings(data);
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusUpdate = async (id: string, status: BookingStatus) => {
    try {
      await bookingService.updateBookingStatus(id, { status });
      fetchBookings();
    } catch {
      alert("Failed to update status. Please try again.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Bookings</h1>
          <p className="text-slate-600 mt-1">Manage your active reservations and passes.</p>
        </div>
        <Link
          to="/bookings/new"
          className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 text-sm font-semibold rounded-xl shadow-sm transition"
        >
          + Request Booking
        </Link>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 font-medium text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-slate-500">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm text-slate-500">
            No bookings found. Try requesting a new resource!
          </div>
        ) : (
          bookings.map((b) => {
            const startDate = parseDate(b.startTime);
            const endDate = parseDate(b.endTime);
            const isApproved = b.status === BookingStatus.APPROVED;
            const isPending = b.status === BookingStatus.PENDING;

            return (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col transition hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{b.resourceName || "Resource"}</h3>
                    <p className="text-sm text-slate-500 mt-1 font-mono tracking-tight">{b.bookingNumber}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${statusColors[b.status]}`}>
                    {b.status}
                  </span>
                </div>

                <div className="space-y-2 mb-6 flex-1">
                  <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 line-clamp-2">
                    {b.purpose}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm pt-2">
                    <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Start Time</p>
                      <p className="font-medium text-slate-800">{startDate.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">End Time</p>
                      <p className="font-medium text-slate-800">{endDate.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> Live Status
                    </span>
                    <LiveCountdown targetDate={startDate} />
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <Link
                          to={`/bookings/${b.id}/edit`}
                          className="p-2 text-slate-500 bg-slate-50 hover:text-primary hover:bg-primary/10 border border-slate-200 rounded-lg transition"
                          title="Edit Booking"
                        >
                          <PenSquare size={16} />
                        </Link>
                        <button
                          onClick={() => {
                            if (window.confirm("Cancel this booking?")) {
                              handleStatusUpdate(b.id, BookingStatus.CANCELLED);
                            }
                          }}
                          className="p-2 text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition"
                          title="Cancel Booking"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <button
                        onClick={() => setSelectedTicket(b)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition shadow-sm"
                      >
                        <QrCode size={16} /> Get Ticket
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* QR Code Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:bg-white print:p-0">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 relative print:shadow-none print:border-0 print:max-w-full">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition z-10 print:hidden"
            >
              <X size={20} />
            </button>

            <div className="bg-gradient-to-br from-primary-dark to-primary p-8 text-center text-white pb-10">
              <p className="text-white/80 font-mono text-sm tracking-widest mb-1.5 uppercase">CampusFlow Ticket</p>
              <h2 className="text-2xl font-bold">{selectedTicket.resourceName}</h2>
              <p className="text-white/90 text-sm mt-2 max-w-[200px] mx-auto line-clamp-1">{selectedTicket.purpose}</p>
            </div>

            <div className="px-8 pb-8 pt-6 text-center relative -mt-6 bg-white rounded-t-3xl text-sm">
              <div className="inline-block p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 mx-auto relative z-10">
                <QRCodeSVG 
                  value={JSON.stringify({
                    id: selectedTicket.bookingNumber,
                    purpose: selectedTicket.purpose,
                  })} 
                  size={180} 
                  level="H"
                  includeMargin={false}
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

              <div className="text-center font-mono text-slate-500 tracking-[0.25em] text-xs">
                 {selectedTicket.bookingNumber}
              </div>

              <button 
                onClick={handlePrint}
                className="w-full mt-8 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition flex items-center justify-center gap-2 print:hidden"
              >
                <Printer size={18} /> Print as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Bookings;
