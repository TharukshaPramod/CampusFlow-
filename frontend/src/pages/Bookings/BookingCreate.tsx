// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { bookingService } from "../../services/api/bookings";
// import { resourceService } from "../../services/api/resourceService";
// import type { Resource } from "../../types/resource";

// function BookingCreate() {
//   const navigate = useNavigate();
//   const [resources, setResources] = useState<Resource[]>([]);
  
//   const [resourceId, setResourceId] = useState("");
//   const [startTime, setStartTime] = useState("");
//   const [endTime, setEndTime] = useState("");
//   const [purpose, setPurpose] = useState("");
//   const [expectedAttendees, setExpectedAttendees] = useState<number>(1);
  
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     // Fetch available resources to choose from
//     resourceService.getAll({}).then(data => {
//       // Temporary log to check status and resourceType are returned by API
//       console.log("Fetched resources data:", data);
//       setResources(data);
//     }).catch(() => setError("Could not load resources list."));
//   }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!resourceId || !startTime || !endTime || !purpose) {
//        setError("Please fill in all required fields.");
//        return;
//     }
    
//     if (new Date(startTime) >= new Date(endTime)) {
//        setError("Chronological error: End time must be after the Start time.");
//        return;
//     }

//     try {
//       setLoading(true);
//       setError("");
      
//       await bookingService.createBooking({
//          resourceId,
//          startTime: new Date(startTime).toISOString(),
//          endTime: new Date(endTime).toISOString(),
//          purpose,
//          expectedAttendees
//       });
      
//       // Successfully created, navigate back to list
//       navigate("/bookings");
//     } catch (err: any) {
//        setError(err.response?.data?.message || err.message || "Failed to create booking.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="max-w-2xl mx-auto space-y-6">
//       <div>
//         <h1 className="text-2xl font-semibold text-slate-800">Request a Booking</h1>
//         <p className="text-slate-600">Reserve an active campus resource for an event or session.</p>
//       </div>
      
//       <div className="bg-white p-8 rounded-lg shadow border border-slate-200">
//         {error && <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200 mb-6 font-medium text-sm">{error}</div>}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block text-sm font-semibold text-slate-700 mb-1.5">Resource *</label>
//             <select
//               value={resourceId}
//               onChange={(e) => setResourceId(e.target.value)}
//               className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500 transition"
//               required
//             >
//               <option value="" disabled>-- Select a campus resource --</option>
//               {resources.map(r => (
//                  <option 
//                    key={r.id} 
//                    value={r.id}
//                    disabled={r.status !== 'ACTIVE'}
//                  >
//                    {r.name} {r.resourceType?.name ? `(${r.resourceType.name})` : ''} 
//                    {r.status !== 'ACTIVE' ? ` [${r.status}]` : ''}
//                  </option>
//               ))}
//             </select>
//             <p className="text-xs text-slate-500 mt-1">Note: Resources in MAINTENANCE or OUT_OF_SERVICE cannot be selected.</p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date & Time *</label>
//               <input
//                 type="datetime-local"
//                 value={startTime}
//                 onChange={(e) => setStartTime(e.target.value)}
//                 className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500 transition"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date & Time *</label>
//               <input
//                 type="datetime-local"
//                 value={endTime}
//                 onChange={(e) => setEndTime(e.target.value)}
//                 className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500 transition"
//                 required
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-semibold text-slate-700 mb-1.5">Purpose *</label>
//             <textarea
//               value={purpose}
//               onChange={(e) => setPurpose(e.target.value)}
//               className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500 transition"
//               rows={3}
//               placeholder="Briefly describe why you are requesting this resource..."
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expected Attendees Count</label>
//             <input
//               type="number"
//               min="1"
//               value={expectedAttendees}
//               onChange={(e) => setExpectedAttendees(parseInt(e.target.value) || 0)}
//               className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500 transition"
//             />
//           </div>

//           <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
//             <button
//               type="button"
//               onClick={() => navigate("/bookings")}
//               className="px-5 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-md hover:bg-slate-50 transition"
//               disabled={loading}
//             >
//               Back
//             </button>
//             <button
//               type="submit"
//               className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition shadow"
//               disabled={loading}
//             >
//               {loading ? "Submitting Request..." : "Confirm Booking"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </section>
//   );
// }

// export default BookingCreate;




import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bookingService } from "../../services/api/bookings";
import { resourceService } from "../../services/api/resourceService";
import type { Resource } from "../../types/resource";

function BookingCreate() {
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);

  const [resourceId, setResourceId] = useState("");
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [expectedAttendees, setExpectedAttendees] = useState<number>(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    resourceService
      .getAll({})
      .then((data) => {
        setResources(data);
      })
      .catch(() => setError("Could not load resources list."));
  }, []);

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

    if (selectedResource && selectedResource.status !== "ACTIVE") {
      setError(
        `This resource is currently ${selectedResource.status.replace("_", " ")} and cannot be booked.`
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      await bookingService.createBooking({
        resourceId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        purpose,
        expectedAttendees,
      });

      navigate("/bookings");
    } catch (err: any) {
      const status = err.response?.status;
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to create booking.";

      if (status === 409) {
        setError(
          "⚠️ Time slot conflict: This resource is already booked for that period. Please choose a different time."
        );
      } else if (status === 400) {
        setError(`⚠️ ${msg}`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Request a Booking</h1>
        <p className="text-slate-600">Reserve a campus resource for an event or session.</p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow border border-slate-200">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200 mb-6 font-medium text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Resource *</label>
            <select
              value={resourceId}
              onChange={(e) => {
                setResourceId(e.target.value);
                const found = resources.find((r) => String(r.id) === e.target.value) ?? null;
                setSelectedResource(found);
                setError("");
              }}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            >
              <option value="" disabled>
                -- Select a campus resource --
              </option>
              {resources.map((r) => (
                <option key={r.id} value={r.id} disabled={r.status !== "ACTIVE"}>
                  {r.name} - {r.resourceType?.name}
                  {r.status !== "ACTIVE" ? ` (${r.status.replace("_", " ")})` : ""}
                </option>
              ))}
            </select>

            {selectedResource && selectedResource.status !== "ACTIVE" && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 font-medium">
                ⚠️ This resource is currently{" "}
                <strong>{selectedResource.status.replace("_", " ")}</strong> and cannot be booked.
              </div>
            )}

            {selectedResource && selectedResource.status === "ACTIVE" && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
                ✓ This resource is available for booking.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Purpose *</label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500 transition"
              rows={3}
              placeholder="Briefly describe why you are requesting this resource..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Expected Attendees Count
            </label>
            <input
              type="number"
              min="1"
              value={expectedAttendees}
              onChange={(e) => setExpectedAttendees(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate("/bookings")}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-md hover:bg-slate-50 transition"
              disabled={loading}
            >
              Back
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition shadow"
              disabled={loading || (!!selectedResource && selectedResource.status !== "ACTIVE")}
            >
              {loading ? "Submitting Request..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default BookingCreate;
