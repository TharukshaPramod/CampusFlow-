import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { bookingService } from "../../services/api/bookings";
import { useAuth } from "../../hooks/useAuth";
import { Booking, BookingStatus } from "../../types/booking";

const statusColors: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [BookingStatus.APPROVED]: "bg-green-100 text-green-800",
  [BookingStatus.REJECTED]: "bg-red-100 text-red-800",
  [BookingStatus.CANCELLED]: "bg-slate-100 text-slate-600",
};

function Bookings() {
  const { user } = useAuth();
  // Ensure we safely map user role to see if they are admin
  const isAdmin = user?.roles?.includes("ADMIN") || user?.roles === "ADMIN";

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

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
      const reason = status === BookingStatus.REJECTED ? rejectionReason : undefined;
      if (status === BookingStatus.REJECTED && (!reason || reason.trim() === "")) {
         alert("Please provide a rejection reason.");
         return;
      }
      
      await bookingService.updateBookingStatus(id, { status, reason });
      setRejectionReason("");
      fetchBookings(); // Refresh the list
    } catch (err) {
      alert("Failed to update status. Please try again.");
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Bookings</h1>
          <p className="text-slate-600">Manage resource reservations and approvals.</p>
        </div>
        <Link
          to="/bookings/new"
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          Request Booking
        </Link>
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
                    <div>{new Date(b.startTime).toLocaleString()}</div>
                    <div className="text-slate-400 text-xs">to {new Date(b.endTime).toLocaleString()}</div>
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
                    {isAdmin && b.status === BookingStatus.PENDING ? (
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
                    ) : (
                      (!isAdmin && (b.status === BookingStatus.PENDING || b.status === BookingStatus.APPROVED)) && (
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
                      )
                    )}
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
