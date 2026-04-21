import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2, AlertTriangle, UserCircle2, Clock, Activity, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { incidentService } from "../../services/api/incidents";
import { Incident, IncidentStatus, IncidentPriority } from "../../types/incident";

const priorityConfig: Record<IncidentPriority, { bg: string; dot: string }> = {
  [IncidentPriority.LOW]: { bg: "bg-slate-100 text-slate-700 border-slate-200", dot: "bg-slate-400" },
  [IncidentPriority.MEDIUM]: { bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  [IncidentPriority.HIGH]: { bg: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  [IncidentPriority.CRITICAL]: { bg: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
};

const statusConfig: Record<IncidentStatus, { bg: string; dot: string }> = {
  [IncidentStatus.OPEN]: { bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  [IncidentStatus.IN_PROGRESS]: { bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  [IncidentStatus.RESOLVED]: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  [IncidentStatus.CLOSED]: { bg: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-400" },
  [IncidentStatus.REJECTED]: { bg: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
};

export default function AdminIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | "ALL">("ALL");

  const fetchIncidents = async () => {
    try { setLoading(true); setIncidents((await incidentService.getAllIncidents()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())); }
    catch { setError("Failed to load incidents."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchIncidents(); }, []);

  const handleDelete = async (id: string, code: string) => {
    if (window.confirm(`Permanently delete ticket ${code}?`)) {
      try { await incidentService.deleteIncident(id); fetchIncidents(); }
      catch { alert("Failed to delete incident."); }
    }
  };

  const filtered = filterStatus === "ALL" ? incidents : incidents.filter(i => i.status === filterStatus);

  return (
    <section className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Administrative Ticketing</h1>
            <p className="text-slate-500 text-sm mt-0.5">Command center for tracking and managing campus tickets</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-rose-500/20">
          <SlidersHorizontal size={14} className="text-slate-400" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-transparent text-slate-700 font-medium text-sm py-2.5 pl-1 pr-6 appearance-none outline-none">
            <option value="ALL">All Tickets</option>
            <option value={IncidentStatus.OPEN}>Open</option>
            <option value={IncidentStatus.IN_PROGRESS}>In Progress</option>
            <option value={IncidentStatus.RESOLVED}>Resolved</option>
            <option value={IncidentStatus.CLOSED}>Closed</option>
            <option value={IncidentStatus.REJECTED}>Rejected</option>
          </select>
        </div>
      </motion.div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-200 font-medium text-sm flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> {error}</div>}

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ticket Ref</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject & Creator</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status / Priority</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timeline / Assign</th>
                <th className="px-6 py-3.5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="space-y-1.5"><div className="h-4 bg-slate-100 rounded w-20" /><div className="h-3 bg-slate-100 rounded w-16" /></div></td>
                    <td className="px-6 py-4"><div className="space-y-1.5"><div className="h-4 bg-slate-100 rounded w-32" /><div className="h-3 bg-slate-100 rounded w-24" /></div></td>
                    <td className="px-6 py-4"><div className="space-y-2"><div className="h-5 bg-slate-100 rounded-full w-16" /><div className="h-5 bg-slate-100 rounded-full w-14" /></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-28" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No tickets match your filter</td></tr>
              ) : (
                filtered.map((inc) => (
                  <tr key={inc.id} className="hover:bg-rose-50/30 transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <Link to={`/incidents/${inc.id}`} className="font-mono text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline">{inc.ticketNumber}</Link>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1 uppercase tracking-wider">{inc.category}</p>
                    </td>
                    <td className="px-6 py-5 max-w-[250px]">
                      <div className="font-semibold text-slate-800 text-sm truncate group-hover:text-rose-600 transition-colors" title={inc.title}>{inc.title}</div>
                      <div className="flex gap-2 items-center mt-1.5">
                        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">Creator: {inc.creatorName || 'System'}</span>
                        {inc.attachments && inc.attachments.length > 0 && (
                          <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">📎 {inc.attachments.length}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap space-y-2">
                      <div>
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border w-fit ${statusConfig[inc.status].bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[inc.status].dot}`} />{inc.status}
                        </span>
                      </div>
                      <div>
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border w-fit ${priorityConfig[inc.priority].bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig[inc.priority].dot}`} />{inc.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium"><Clock size={12} /> {new Date(inc.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <UserCircle2 size={14} className={inc.technicianName ? "text-blue-500" : "text-slate-300"} />
                        {inc.technicianName ? inc.technicianName.split(" ")[0] : <span className="text-slate-400 font-medium italic">Unassigned</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/incidents/${inc.id}`} className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition border border-blue-100">Inspect</Link>
                        <button onClick={() => handleDelete(inc.id, inc.ticketNumber)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={15} /></button>
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
