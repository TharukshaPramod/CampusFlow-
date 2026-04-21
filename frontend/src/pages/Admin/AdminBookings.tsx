import { useState, useEffect } from "react";
import { Check, X, Trash2, ChevronDown, ListFilter } from "lucide-react";
import { bookingService } from "../../services/api/bookings";
import { Booking, BookingStatus } from "../../types/booking";

const statusColors: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [BookingStatus.APPROVED]: "bg-green-100 text-green-800",
  [BookingStatus.REJECTED]: "bg-red-100 text-red-800",
  [BookingStatus.CANCELLED]: "bg-slate-100 text-slate-600",
};

const parseDate = (dateVal: any) => {
  if (Array.isArray(dateVal)) {
    const [y, m, d, h = 0, min = 0, s = 0] = dateVal;
    return new Date(y, m - 1, d, h, min, s);
  }
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

  const handleBulkDelete = async (timeRange: string) => {
    if (window.confirm(`Are you sure you want to delete bookings for the range: '${timeRange}'? This action cannot be undone.`)) {
      try {
        await bookingService.deleteBookings(timeRange);
        setShowDeleteDropdown(false);
        fetchBookings();
      } catch (err) {
        alert("Failed to delete bookings. Please try again.");
      }
    }
  };

  const handleStatusUpdate = async (id: string, status: BookingStatus) => {
    try {
      const reason = status === BookingStatus.REJECTED ? rejectionReason : undefined;
      if (status === BookingStatus.REJECTED && (!reason || reason.trim() === "")) {
         alert("Please provide a rejection reason.");
         return;
      }
      
      await bookingService.updateBookingStatus(id, { status, reason });
      setRejectionReason("");
      setRejectingId(null);
      fetchBookings(); // Refresh the list
    } catch (err) {
      alert("Failed to update status. Please try again.");
    }
  };

  const handleDeleteSingle = async (id: string, bookingNumber: string) => {
    if (window.confirm(`Permanently delete booking ${bookingNumber}? This cannot be undone.`)) {
      try {
        await bookingService.deleteBooking(id);
        fetchBookings();
      } catch {
        alert("Failed to delete booking.");
      }
    }
  };

  const filteredBookings = filterStatus === "ALL" 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Booking Administration</h1>
          <p className="text-slate-600 mt-1">Review, approve, and manage all campus reservations.</p>
        </div>

        <div className="flex items-center space-x-3 relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="border border-slate-200 bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 outline-none flex items-center justify-center gap-2 font-medium text-sm appearance-none pr-10"
            style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1.25rem" }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <div className="relative">
            <button 
              onClick={() => setShowDeleteDropdown(!showDeleteDropdown)}
              className="flex justify-center items-center space-x-1 border border-red-200 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl shadow-sm hover:bg-red-100 transition font-medium text-sm"
              title="Delete Bookings History"
            >
              <Trash2 size={16} />
              <span>Purge History</span>
              <ChevronDown size={14} className="ml-1" />
            </button>

            {showDeleteDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2">
                <button onClick={() => handleBulkDelete('yesterday')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition">Delete &gt; 1 Day Ago</button>
                <button onClick={() => handleBulkDelete('week')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition">Delete &gt; 1 Week Ago</button>
                <button onClick={() => handleBulkDelete('month')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition">Delete &gt; 1 Month Ago</button>
                <div className="border-t border-slate-100 my-1"></div>
                <button onClick={() => handleBulkDelete('all')} className="w-full text-left px-4 py-2.5 text-sm text-red-600 font-bold hover:bg-red-50 transition">Delete All Time (WIPE)</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 font-medium text-sm shadow-sm">{error}</div>}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Resource / User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Time Range</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Purpose</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">Loading bookings into Admin grid...</td></tr>
              ) : filteredBookings.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 border-b-0 border-white">No bookings align with your filters.</td></tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800 text-sm">{b.resourceName || 'Unknown Resource'}</div>
                      <div className="text-slate-500 text-sm mt-0.5">{b.userName || 'System Placeholder'}</div>
                      <div className="text-xs font-mono text-slate-400 mt-1">{b.bookingNumber}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-700">{parseDate(b.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                      <div className="text-slate-500 text-sm flex items-center gap-1.5"><span className="w-1 h-1 bg-slate-300 rounded-full inline-block"></span> {parseDate(b.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 max-w-xs">
                      <p className="line-clamp-2" title={b.purpose}>{b.purpose}</p>
                      {b.expectedAttendees > 0 && <span className="text-xs inline-flex items-center gap-1 mt-2 bg-slate-100 px-2 py-0.5 rounded text-slate-500">{b.expectedAttendees} Expected</span>}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-bold tracking-wider rounded-md ${statusColors[b.status] || ''}`}>
                        {b.status}
                      </span>
                      {b.status === BookingStatus.REJECTED && b.rejectionReason && (
                        <div className="text-xs text-red-500 mt-2 max-w-[150px] whitespace-normal break-words leading-tight bg-red-50 p-2 rounded border border-red-100" title={b.rejectionReason}>
                           Admin Note: {b.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap text-sm">
                      <div className="flex flex-col items-end gap-2 isolate">
                        {b.status === BookingStatus.PENDING && rejectingId !== b.id && (
                          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                            <button
                              onClick={() => handleStatusUpdate(b.id, BookingStatus.APPROVED)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-green-700 shadow-sm hover:shadow hover:text-green-800 rounded-md text-xs font-bold transition"
                            >
                              <Check size={14} strokeWidth={3} /> Approve
                            </button>
                            <div className="w-px bg-slate-200 mx-1"></div>
                            <button
                              onClick={() => setRejectingId(b.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-md text-xs font-bold transition"
                            >
                              <X size={14} strokeWidth={3} /> Reject
                            </button>
                          </div>
                        )}

                        {rejectingId === b.id && (
                          <div className="flex flex-col items-end space-y-2 bg-red-50 p-3 rounded-xl border border-red-100 shadow-sm z-10 relative">
                            <input 
                              type="text" 
                              placeholder="Why are you rejecting this?" 
                              className="border border-red-200 rounded-lg px-3 py-2 text-xs w-48 focus:ring-2 focus:ring-red-200 focus:outline-none placeholder-red-300 text-red-900"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              autoFocus
                            />
                            <div className="flex gap-2 w-full justify-end">
                              <button
                                onClick={() => setRejectingId(null)}
                                className="px-3 py-1.5 text-slate-500 hover:bg-slate-200 rounded bg-slate-100 text-xs font-bold transition"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(b.id, BookingStatus.REJECTED)}
                                className="px-3 py-1.5 bg-red-600 text-white shadow-sm hover:bg-red-700 rounded text-xs font-bold transition"
                              >
                                Confirm Reject
                              </button>
                            </div>
                          </div>
                        )}

                        {b.status !== BookingStatus.PENDING && (
                           <div className="flex items-center gap-2">
                             <div className="text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                               Processed
                             </div>
                             <button
                               onClick={() => handleDeleteSingle(b.id, b.bookingNumber)}
                               className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-100"
                               title="Delete this booking"
                             >
                               <Trash2 size={15} />
                             </button>
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
      </div>
    </section>
  );
}
