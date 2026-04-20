import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { bookingService } from "../../services/api/bookings";
import { resourceService } from "../../services/api/resourceService";
import type { Resource } from "../../types/resource";

export default function BookingCreate() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // for edit mode
  const [searchParams] = useSearchParams();
  const initialResourceId = searchParams.get("resourceId") || "";

  const isEditMode = Boolean(id);

  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceId, setResourceId] = useState(initialResourceId);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [expectedAttendees, setExpectedAttendees] = useState<number>(1);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [error, setError] = useState("");

  // Gets datetime string for "min" attribute (preventing past dates visually)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  useEffect(() => {
    // Load resources
    const loadData = async () => {
      try {
        const rawResources = await resourceService.getAll({});
        setResources(rawResources);

        if (initialResourceId) {
          const matched = rawResources.find((r) => r.id === initialResourceId);
          if (matched) setSelectedResource(matched);
        }

        // If Edit Mode, heavily prepopulate the form
        if (isEditMode && id) {
          const bookingData = await bookingService.getBookingById(id);
          setResourceId(bookingData.resourceId);
          setSelectedResource(rawResources.find((r) => r.id === bookingData.resourceId) || null);
          setStartTime(bookingData.startTime.slice(0, 16));
          setEndTime(bookingData.endTime.slice(0, 16));
          setPurpose(bookingData.purpose);
          setExpectedAttendees(bookingData.expectedAttendees || 1);
        }
      } catch (err: any) {
        setError("Failed to load initial data. " + (err.response?.data?.message || err.message));
      } finally {
        setPageLoading(false);
      }
    };
    loadData();
  }, [id, isEditMode, initialResourceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resourceId || !startTime || !endTime || !purpose) {
      setError("Please fill in all required fields.");
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      setError("Chronological error: End time must be after the Start time.");
      return;
    }

    if (new Date(startTime) < new Date()) {
      setError("Temporal error: You cannot book a time in the past.");
      return;
    }

    if (selectedResource && selectedResource.status !== "ACTIVE") {
      setError(`This resource is currently ${selectedResource.status.replace("_", " ")} and cannot be booked.`);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        resourceId,
        startTime: startTime.length === 16 ? `${startTime}:00` : startTime,
        endTime: endTime.length === 16 ? `${endTime}:00` : endTime,
        purpose,
        expectedAttendees,
      };

      if (isEditMode && id) {
        await bookingService.updateBooking(id, payload);
      } else {
        await bookingService.createBooking(payload);
      }

      navigate("/bookings");
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to process booking.";

      if (status === 409) {
        setError(`⚠️ Time slot conflict: ${msg}`);
      } else if (status === 400) {
        setError(`⚠️ ${msg}`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <div className="p-8 text-center text-slate-500">Loading booking data...</div>;

  return (
    <section className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          {isEditMode ? "Modify Booking Request" : "Request a Booking"}
        </h1>
        <p className="text-slate-600 mt-1">Reserve a campus resource for an event or session.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 mb-6 font-medium text-sm">
            {error.includes("|||") ? (
              <div className="space-y-1 block">
                <span>{error.split("|||")[0].replace("Conflicting bookings:", "")}</span>
                <ul className="list-disc list-inside ml-2 mt-2 space-y-1 text-xs opacity-90">
                  {error.split("|||").slice(1).map((conflictLine, i) => (
                    <li key={i}>{conflictLine}</li>
                  ))}
                </ul>
              </div>
            ) : (
              error
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Resource *</label>
            <select
              value={resourceId}
              onChange={(e) => {
                setResourceId(e.target.value);
                const found = resources.find((r) => String(r.id) === e.target.value) ?? null;
                setSelectedResource(found);
                setError("");
              }}
              className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none"
              required
            >
              <option value="" disabled>-- Select a campus resource --</option>
              {resources.map((r) => (
                <option key={r.id} value={r.id} disabled={r.status !== "ACTIVE"}>
                  {r.name} - {r.resourceType?.name}
                  {r.status !== "ACTIVE" ? ` (${r.status.replace("_", " ")})` : ""}
                </option>
              ))}
            </select>

            {selectedResource && selectedResource.status !== "ACTIVE" && (
              <div className="mt-3 p-3 bg-red-50/50 border border-red-100 rounded-xl text-sm text-red-600 font-medium flex items-center gap-2">
                ⚠️ This resource is currently {selectedResource.status.replace("_", " ")} and cannot be booked.
              </div>
            )}
            {selectedResource && selectedResource.status === "ACTIVE" && (
              <div className="mt-3 p-3 bg-green-50/50 border border-green-100 rounded-xl text-sm text-green-700 font-medium flex items-center gap-2">
                ✓ Available for booking. Capacity: {selectedResource.capacity || "N/A"}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date & Time *</label>
              <input
                type="datetime-local"
                value={startTime}
                min={getMinDateTime()}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">End Date & Time *</label>
              <input
                type="datetime-local"
                value={endTime}
                min={startTime || getMinDateTime()}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Purpose *</label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none resize-none"
              rows={3}
              placeholder="Briefly describe why you are requesting this resource..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Expected Attendees Count</label>
            <input
              type="number"
              min="1"
              value={expectedAttendees}
              onChange={(e) => setExpectedAttendees(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate("/bookings")}
              className="px-6 py-2.5 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-50 transition shadow-sm"
              disabled={loading || (!!selectedResource && selectedResource.status !== "ACTIVE")}
            >
              {loading ? "Processing..." : isEditMode ? "Save Changes" : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
