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
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

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

  const handleDelete = async (id: string) => {
    if (window.confirm("Permanently delete this ticket?")) {
      try {
        await incidentService.deleteIncident(id);
        fetchIncidents();
      } catch {
        alert("Failed to delete incident.");
      }
    }
  };

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
              <div 
                key={inc.id} 
                className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col relative overflow-hidden"
              >
                {/* Visual Status Cap */}
                <div className={`absolute top-0 left-0 w-full h-1.5 ${inc.status === IncidentStatus.OPEN ? 'bg-yellow-400' : inc.status === IncidentStatus.IN_PROGRESS ? 'bg-blue-400' : inc.status === IncidentStatus.REJECTED ? 'bg-red-400' : 'bg-slate-200'}`}></div>

                {inc.attachments && inc.attachments.length > 0 && (
                  <div className="h-36 w-full overflow-hidden relative bg-slate-100">
                    {imageErrors[inc.attachments[0].id] ? (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                         <span className="font-medium">Image Not Public</span>
                      </div>
                    ) : (
                      <img 
                        src={inc.attachments[0].fileUrl} 
                        alt="Incident Evidence" 
                        onError={() => setImageErrors(prev => ({...prev, [inc.attachments[0].id]: true}))}
                        className="w-full h-full object-cover transition duration-500" 
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                         📎 {inc.attachments.length} Images
                      </span>
                    </div>
                  </div>
                )}

                <div className={`p-5 flex-1 flex flex-col ${!(inc.attachments && inc.attachments.length > 0) && "pt-6"}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-md uppercase tracking-wide ${priorityColors[inc.priority].bg}`}>
                       {priorityColors[inc.priority].icon} {inc.priority}
                    </span>
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border ${statusColors[inc.status]}`}>
                      {inc.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-1">
                    {inc.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-2">
                     <p className="text-xs font-mono font-medium text-slate-500">{inc.ticketNumber}</p>
                     <p className="text-xs text-slate-400">{inc.category}</p>
                  </div>

                  <div className="text-sm text-slate-600 mt-4 line-clamp-2 pb-4 flex-1">
                    {inc.description}
                  </div>

                  <div className="pt-4 flex flex-col gap-3">
                     <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                        <span className="text-xs text-slate-500 font-medium tracking-wide">
                          💬 {inc.comments ? inc.comments.length : 0} Comments
                        </span>
                        {inc.technicianName ? (
                           <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                             Tech: {inc.technicianName.split(' ')[0]}
                           </span>
                        ) : (
                           <span className="text-xs font-medium text-slate-400 italic px-2 py-1">
                             Unassigned
                           </span>
                        )}
                     </div>

                     <div className="flex items-center gap-2 mt-2">
                        <Link 
                          to={`/incidents/${inc.id}`}
                          className="flex-1 bg-primary text-white text-center py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-primary-dark transition"
                        >
                           Inspect Thread
                        </Link>
                        {inc.creatorId === user?.id && (
                           <>
                              <Link 
                                to={`/incidents/${inc.id}/edit`}
                                className="px-3 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition"
                                title="Edit Ticket"
                              >
                                Edit
                              </Link>
                              <button 
                                onClick={(e) => { e.preventDefault(); handleDelete(inc.id); }}
                                className="px-3 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 hover:bg-red-100 transition"
                                title="Delete Ticket"
                              >
                                Delete
                              </button>
                           </>
                        )}
                     </div>
                  </div>
                </div>

                {warning && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] rotate-12 bg-red-600 text-white text-[10px] font-bold text-center py-0.5 opacity-90 shadow-sm pointer-events-none uppercase tracking-widest whitespace-nowrap">
                    {warning}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
