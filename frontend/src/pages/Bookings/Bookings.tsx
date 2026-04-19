import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PenSquare, Trash2, ChevronDown } from "lucide-react";
import { bookingService } from "../../services/api/bookings";
import { useAuth } from "../../hooks/useAuth";
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

function Bookings() {
  const { user } = useAuth();
  // Ensure we safely map user role to see if they are admin
  const isAdmin = user?.roles?.includes("ADMIN") || user?.roles === "ADMIN";

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [showDeleteDropdown, setShowDeleteDropdown] = useState(false);

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
      setEditingBookingId(null);
      fetchBookings(); // Refresh the list
    } catch (err) {
      alert("Failed to update status. Please try again.");
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center relative">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Bookings</h1>
          <p className="text-slate-600">Manage resource reservations and approvals.</p>
        </div>
        <div className="flex items-center space-x-3 relative">
          <div className="relative">
            <button 
              onClick={() => setShowDeleteDropdown(!showDeleteDropdown)}
              className="flex justify-center items-center space-x-1 border border-red-200 bg-red-50 text-red-600 px-4 py-2 rounded shadow hover:bg-red-100 transition"
              title="Delete Bookings History"
            >
              <Trash2 size={16} />
              <span className="font-medium text-sm">Delete...</span>
              <ChevronDown size={14} className="ml-1" />
            </button>

            {showDeleteDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-md shadow-lg z-50 py-1">
                <button 
                  onClick={() => handleBulkDelete('yesterday')} 
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  Delete &gt; 1 Day Ago
                </button>
                <button 
                  onClick={() => handleBulkDelete('week')} 
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  Delete &gt; 1 Week Ago
                </button>
                <button 
                  onClick={() => handleBulkDelete('month')} 
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  Delete &gt; 1 Month Ago
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button 
                  onClick={() => handleBulkDelete('all')} 
                  className="w-full text-left px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50"
                >
                  Delete All Time
                </button>
              </div>
            )}
          </div>

          <Link
            to="/bookings/new"
            className="bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded shadow hover:bg-blue-700 transition"
          >
            Request Booking
          </Link>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">{error}</div>}

      <div className="bg-white rounded-lg shadow overflow-x-auto border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Resource</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Time Range</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Purpose</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-6 text-center text-slate-500 font-medium">Loading bookings...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-6 text-center text-slate-500">No bookings found.</td></tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{b.resourceName || 'Unknown Resource'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{b.userName || 'Me'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <div>{parseDate(b.startTime).toLocaleString()}</div>
                    <div className="text-slate-400 text-xs">to {parseDate(b.endTime).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <p className="line-clamp-2 max-w-xs" title={b.purpose}>{b.purpose}</p>
                    {b.expectedAttendees > 0 && <span className="text-xs block mt-1 text-slate-400">{b.expectedAttendees} attendees</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[b.status] || ''}`}>
                      {b.status}
                    </span>
                    {b.status === BookingStatus.REJECTED && b.rejectionReason && (
                      <div className="text-xs text-red-500 mt-1 max-w-[150px] truncate" title={b.rejectionReason}>
                         {b.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap text-sm">
                    <div className="flex flex-col items-end gap-2">
                      {isAdmin && b.status === BookingStatus.PENDING && (
                        <div className="flex flex-col items-end space-y-2">
                          <button
                            onClick={() => handleStatusUpdate(b.id, BookingStatus.APPROVED)}
                            className="px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded text-xs font-medium border border-green-200 transition"
                          >
                            Approve
                          </button>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="text" 
                              placeholder="Reason required" 
                              className="border border-slate-300 rounded px-2 py-1 text-xs w-32 focus:ring-red-500 focus:border-red-500 focus:outline-none"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                            />
                            <button
                              onClick={() => handleStatusUpdate(b.id, BookingStatus.REJECTED)}
                              className="px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded text-xs font-medium border border-red-200 transition"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {!isAdmin && (b.status === BookingStatus.PENDING || b.status === BookingStatus.APPROVED) && (
                        <button
                          onClick={() => {
                            if(window.confirm('Are you sure you want to cancel this booking?')) {
                               handleStatusUpdate(b.id, BookingStatus.CANCELLED);
                            }
                          }}
                          className="px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-xs font-medium border border-slate-300 transition"
                        >
                          Cancel Booking
                        </button>
                      )}

                      {isAdmin && (b.status === BookingStatus.APPROVED || b.status === BookingStatus.REJECTED) && (
                        <button
                          onClick={() => setEditingBookingId(editingBookingId === b.id ? null : b.id)}
                          className={`p-1.5 mt-1 rounded-full transition-colors ${editingBookingId === b.id ? 'text-blue-700 bg-blue-100' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                          title="Edit Booking"
                        >
                          <PenSquare size={16} />
                        </button>
                      )}

                      {isAdmin && editingBookingId === b.id && b.status === BookingStatus.APPROVED && (
                        <div className="flex items-center space-x-2 mt-2">
                          <input 
                            type="text" 
                            placeholder="Reason required" 
                            className="border border-slate-300 rounded px-2 py-1 text-xs w-32 focus:ring-red-500 focus:border-red-500 focus:outline-none"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                          />
                          <button
                            onClick={() => handleStatusUpdate(b.id, BookingStatus.REJECTED)}
                            className="px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded text-xs font-medium border border-red-200 transition"
                          >
                            Reject Booking
                          </button>
                        </div>
                      )}

                      {isAdmin && editingBookingId === b.id && b.status === BookingStatus.REJECTED && (
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => handleStatusUpdate(b.id, BookingStatus.APPROVED)}
                            className="px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded text-xs font-medium border border-green-200 transition"
                          >
                            Approve Booking
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
    </section>
  );
}

export default Bookings;
