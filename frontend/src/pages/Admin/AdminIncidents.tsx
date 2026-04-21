import { useState, useEffect } from "react";
import { Trash2, AlertTriangle, UserCircle2, Filter, Activity, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { incidentService } from "../../services/api/incidents";
import { Incident, IncidentStatus, IncidentPriority } from "../../types/incident";

const priorityColors: Record<IncidentPriority, string> = {
  [IncidentPriority.LOW]: "bg-slate-100 text-slate-700",
  [IncidentPriority.MEDIUM]: "bg-blue-100 text-blue-800",
  [IncidentPriority.HIGH]: "bg-orange-100 text-orange-800",
  [IncidentPriority.CRITICAL]: "bg-red-100 text-red-800 font-bold",
};

const statusColors: Record<IncidentStatus, string> = {
  [IncidentStatus.OPEN]: "bg-yellow-100 text-yellow-800",
  [IncidentStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800",
  [IncidentStatus.RESOLVED]: "bg-green-100 text-green-800",
  [IncidentStatus.CLOSED]: "bg-slate-100 text-slate-600",
  [IncidentStatus.REJECTED]: "bg-red-100 text-red-800",
};

export default function AdminIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<IncidentStatus | "ALL">("ALL");

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const data = await incidentService.getAllIncidents();
      setIncidents(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch {
      setError("Failed to load incidents. Please check your privileges or backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleDelete = async (id: string, code: string) => {
    if (window.confirm(`Are you certain you want to permanently delete ticket ${code}? This is irreversible.`)) {
      try {
        await incidentService.deleteIncident(id);
        fetchIncidents();
      } catch {
        alert("Failed to delete incident. Ensure you have the required permissions.");
      }
    }
  };

  const filtered = filterStatus === "ALL" ? incidents : incidents.filter(i => i.status === filterStatus);

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
             <Activity className="text-red-500" /> Administrative Ticketing
          </h1>
          <p className="text-slate-600 mt-1">Global command center for tracking, managing, and purging campus tickets.</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 outline-none focus-within:ring-2 focus-within:ring-primary/20">
              <Filter size={16} className="text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-transparent text-slate-700 font-medium text-sm py-2.5 pl-2 pr-6 appearance-none outline-none"
              >
                <option value="ALL">All Active Tickets</option>
                <option value={IncidentStatus.OPEN}>Action Required (OPEN)</option>
                <option value={IncidentStatus.IN_PROGRESS}>Work In Progress</option>
                <option value={IncidentStatus.RESOLVED}>Resolved Tickets</option>
                <option value={IncidentStatus.CLOSED}>Closed Tickets</option>
                <option value={IncidentStatus.REJECTED}>Rejected Tickets</option>
              </select>
           </div>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 font-medium text-sm shadow-sm">{error}</div>}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket Reference</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject & Creator</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status / Priority</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timeline / Assignment</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">Synchronizing Incident Database...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No tickets found matching your filter parameters.</td></tr>
              ) : (
                filtered.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-5 whitespace-nowrap">
                       <Link to={`/incidents/${inc.id}`} className="font-mono text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline">
                         {inc.ticketNumber}
                       </Link>
                       <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">{inc.category}</p>
                    </td>

                    <td className="px-6 py-5 max-w-[250px]">
                      <div className="font-bold text-slate-800 text-sm truncate" title={inc.title}>{inc.title}</div>
                      <div className="flex gap-2 items-center mt-1">
                        <div className="text-slate-500 text-xs font-medium bg-slate-100 inline-block px-2 py-0.5 rounded">Creator: {inc.creatorName || 'System'}</div>
                        {inc.attachments && inc.attachments.length > 0 && (
                          <div className="text-blue-600 text-xs font-bold bg-blue-50 inline-flex items-center gap-1 px-2 py-0.5 rounded" title={`${inc.attachments.length} Evidence attached`}>
                            📎 {inc.attachments.length}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap space-y-2">
                       <div>
                         <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${statusColors[inc.status]}`}>
                           {inc.status}
                         </span>
                       </div>
                       <div>
                         <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider rounded-md ${priorityColors[inc.priority]}`}>
                           {inc.priority}
                         </span>
                       </div>
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">
                       <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                         <Clock size={12} /> {new Date(inc.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                       </div>
                       <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                         <UserCircle2 size={14} className={inc.technicianName ? "text-blue-500" : "text-slate-300"} />
                         {inc.technicianName ? inc.technicianName.split(" ")[0] : <span className="text-slate-400 font-medium italic">Unassigned</span>}
                       </div>
                    </td>

                    <td className="px-6 py-5 text-right whitespace-nowrap">
                       <div className="flex items-center justify-end gap-3">
                         <Link 
                           to={`/incidents/${inc.id}`} 
                           className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                         >
                           Inspect
                         </Link>
                         <button 
                           onClick={() => handleDelete(inc.id, inc.ticketNumber)}
                           className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition"
                           title="Purge Ticket"
                         >
                           <Trash2 size={16} />
                         </button>
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
