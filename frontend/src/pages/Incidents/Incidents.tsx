import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Clock, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { incidentService } from "../../services/api/incidents";
import { useAuth } from "../../hooks/useAuth";
import { Incident, IncidentPriority, IncidentStatus } from "../../types/incident";

const priorityColors: Record<IncidentPriority, { bg: string; icon: JSX.Element; label: string }> = {
  [IncidentPriority.LOW]: { bg: "bg-slate-100 text-slate-700", icon: <CheckCircle2 size={14} />, label: "Low Priority" },
  [IncidentPriority.MEDIUM]: { bg: "bg-blue-100 text-blue-800", icon: <Clock size={14} />, label: "Medium Priority" },
  [IncidentPriority.HIGH]: { bg: "bg-orange-100 text-orange-800", icon: <AlertTriangle size={14} />, label: "High Priority" },
  [IncidentPriority.CRITICAL]: { bg: "bg-red-100 text-red-800 border border-red-200 shadow-sm", icon: <ShieldAlert size={14} />, label: "Critical Priority" },
};

const statusColors: Record<IncidentStatus, string> = {
  [IncidentStatus.OPEN]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [IncidentStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800 border-blue-200",
  [IncidentStatus.RESOLVED]: "bg-green-100 text-green-800 border-green-200",
  [IncidentStatus.CLOSED]: "bg-slate-100 text-slate-600 border-slate-200",
  [IncidentStatus.REJECTED]: "bg-red-100 text-red-800 border-red-200",
};

export default function Incidents() {
  const { user } = useAuth();
  const isAdminOrTech = user?.roles?.some(r => r === "ADMIN" || r === "ROLE_ADMIN");

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const data = await incidentService.getAllIncidents();
      
      // Sort: Open/Critical float to the top
      data.sort((a, b) => {
         if (a.status === IncidentStatus.OPEN && b.status !== IncidentStatus.OPEN) return -1;
         if (a.status !== IncidentStatus.OPEN && b.status === IncidentStatus.OPEN) return 1;
         return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setIncidents(data);
    } catch {
      setError("Failed to load incidents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const calculateSLAWarning = (incident: Incident) => {
    if (incident.status === IncidentStatus.RESOLVED || incident.status === IncidentStatus.CLOSED || incident.status === IncidentStatus.REJECTED) return null;
    
    const created = new Date(incident.createdAt).getTime();
    const now = new Date().getTime();
    const hoursOpen = (now - created) / (1000 * 60 * 60);

    // Dynamic SLA bounded rules
    if (incident.priority === IncidentPriority.CRITICAL && hoursOpen > 2 && incident.status === IncidentStatus.OPEN) {
       return "SLA BREACHED: Over 2 hours response time";
    }
    if (incident.priority === IncidentPriority.HIGH && hoursOpen > 24) {
       return "SLA WARNING: Over 24 hours open";
    }
    if (hoursOpen > 72) {
       return "SLA WARNING: Ticket stale (>72 hours)";
    }
    return null;
  };

  return (
    <section className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <AlertCircle className="text-slate-400" />
            {isAdminOrTech ? "Incident Command Center" : "My IT/Maintenance Tickets"}
          </h1>
          <p className="text-slate-600 mt-1">
            {isAdminOrTech ? "Monitor active campus incidents, enforce SLAs, and assign support staff." : "Track your reported issues and communicate with campus support."}
          </p>
        </div>
        <Link
          to="/incidents/new"
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 text-sm font-semibold rounded-xl shadow-sm transition"
        >
          + Report Incident
        </Link>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 font-medium text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-500 font-medium">Loading tickets...</div>
        ) : incidents.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
            No incidents found. The campus is running smoothly!
          </div>
        ) : (
          incidents.map((inc) => {
            const warning = calculateSLAWarning(inc);

            return (
              <Link 
                to={`/incidents/${inc.id}`}
                key={inc.id} 
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition flex flex-col relative overflow-hidden"
              >
                {/* Visual Status Cap */}
                <div className={`absolute top-0 left-0 w-full h-1.5 ${inc.status === IncidentStatus.OPEN ? 'bg-yellow-400' : inc.status === IncidentStatus.IN_PROGRESS ? 'bg-blue-400' : inc.status === IncidentStatus.REJECTED ? 'bg-red-400' : 'bg-slate-200'}`}></div>

                <div className="flex justify-between items-start mb-3 pt-2">
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-md uppercase tracking-wide ${priorityColors[inc.priority].bg}`}>
                     {priorityColors[inc.priority].icon} {inc.priority}
                  </span>
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border ${statusColors[inc.status]}`}>
                    {inc.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-1 group-hover:text-primary transition">{inc.title}</h3>
                
                <div className="flex items-center justify-between mt-2">
                   <p className="text-xs font-mono font-medium text-slate-500">{inc.ticketNumber}</p>
                   <p className="text-xs text-slate-400">{inc.category}</p>
                </div>

                <div className="text-sm text-slate-600 mt-4 line-clamp-2 pb-4 flex-1">
                  {inc.description}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                         {inc.creatorName ? inc.creatorName.substring(0, 2).toUpperCase() : '?'}
                      </div>
                      <span className="text-xs text-slate-500">Reported by {inc.creatorName || "System"}</span>
                   </div>
                   {inc.technicianName && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        Tech: {inc.technicianName.split(' ')[0]}
                      </span>
                   )}
                </div>

                {warning && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] rotate-12 bg-red-600 text-white text-[10px] font-bold text-center py-0.5 opacity-90 shadow-sm pointer-events-none uppercase tracking-widest whitespace-nowrap">
                    {warning}
                  </div>
                )}
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
