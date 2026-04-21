import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Clock, CheckCircle2, AlertTriangle, ShieldAlert, Plus, Sparkles, MessageSquare, SlidersHorizontal, Search, RotateCcw } from "lucide-react";
import { incidentService } from "../../services/api/incidents";
import { useAuth } from "../../hooks/useAuth";
import { Incident, IncidentPriority, IncidentStatus } from "../../types/incident";

const priorityConfig: Record<IncidentPriority, { bg: string; icon: JSX.Element; gradient: string }> = {
  [IncidentPriority.LOW]: { bg: "bg-slate-100 text-slate-700 border-slate-200", icon: <CheckCircle2 size={13} />, gradient: "from-slate-400 to-slate-500" },
  [IncidentPriority.MEDIUM]: { bg: "bg-blue-50 text-blue-700 border-blue-200", icon: <Clock size={13} />, gradient: "from-blue-400 to-indigo-500" },
  [IncidentPriority.HIGH]: { bg: "bg-orange-50 text-orange-700 border-orange-200", icon: <AlertTriangle size={13} />, gradient: "from-orange-400 to-amber-500" },
  [IncidentPriority.CRITICAL]: { bg: "bg-red-50 text-red-700 border-red-200", icon: <ShieldAlert size={13} />, gradient: "from-red-500 to-rose-500" },
};

const statusConfig: Record<IncidentStatus, { bg: string; dot: string; strip: string }> = {
  [IncidentStatus.OPEN]: { bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", strip: "from-amber-400 to-yellow-400" },
  [IncidentStatus.IN_PROGRESS]: { bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500", strip: "from-blue-400 to-indigo-400" },
  [IncidentStatus.RESOLVED]: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", strip: "from-emerald-400 to-teal-400" },
  [IncidentStatus.CLOSED]: { bg: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-400", strip: "from-slate-300 to-slate-400" },
  [IncidentStatus.REJECTED]: { bg: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500", strip: "from-red-400 to-rose-400" },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export default function Incidents() {
  const { user } = useAuth();
  const isAdminOrTech = user?.roles?.some(r => r === "ADMIN" || r === "ROLE_ADMIN");

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterSearch, setFilterSearch] = useState("");

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const data = await incidentService.getAllIncidents();
      data.sort((a, b) => {
        if (a.status === IncidentStatus.OPEN && b.status !== IncidentStatus.OPEN) return -1;
        if (a.status !== IncidentStatus.OPEN && b.status === IncidentStatus.OPEN) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setIncidents(data);
    } catch { setError("Failed to load incidents."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchIncidents(); }, []);

  // Derive unique categories from data
  const categories = [...new Set(incidents.map(i => i.category).filter(Boolean))].sort();

  // Client-side filtering
  const filteredIncidents = incidents.filter((inc) => {
    if (filterStatus && inc.status !== filterStatus) return false;
    if (filterPriority && inc.priority !== filterPriority) return false;
    if (filterCategory && inc.category !== filterCategory) return false;
    if (filterSearch) {
      const q = filterSearch.toLowerCase();
      const matchesTitle = inc.title.toLowerCase().includes(q);
      const matchesDesc = inc.description.toLowerCase().includes(q);
      const matchesTicket = inc.ticketNumber.toLowerCase().includes(q);
      if (!matchesTitle && !matchesDesc && !matchesTicket) return false;
    }
    return true;
  });

  const activeFilterCount = [filterStatus, filterPriority, filterCategory, filterSearch].filter(Boolean).length;

  const handleResetFilters = () => {
    setFilterStatus("");
    setFilterPriority("");
    setFilterCategory("");
    setFilterSearch("");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Permanently delete this ticket?")) {
      try { await incidentService.deleteIncident(id); fetchIncidents(); }
      catch { alert("Failed to delete incident."); }
    }
  };

  const calculateSLAWarning = (inc: Incident) => {
    if ([IncidentStatus.RESOLVED, IncidentStatus.CLOSED, IncidentStatus.REJECTED].includes(inc.status)) return null;
    const hoursOpen = (Date.now() - new Date(inc.createdAt).getTime()) / (1000 * 60 * 60);
    if (inc.priority === IncidentPriority.CRITICAL && hoursOpen > 2 && inc.status === IncidentStatus.OPEN) return "SLA BREACHED — Over 2h response";
    if (inc.priority === IncidentPriority.HIGH && hoursOpen > 24) return "SLA WARNING — Over 24h open";
    if (hoursOpen > 72) return "STALE — Over 72 hours open";
    return null;
  };

  return (
    <section className="max-w-6xl mx-auto space-y-6 pb-12 pt-4 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isAdminOrTech ? "Incident Command Center" : "My IT/Maintenance Tickets"}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {filteredIncidents.length} ticket{filteredIncidents.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              showFilters ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
          <Link
            to="/incidents/new"
            className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white px-6 py-2.5 text-sm font-semibold rounded-xl shadow-sm shadow-rose-500/20 hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Report Incident
          </Link>
        </div>
      </motion.div>

      {/* Collapsible Filter Bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[140px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Status</label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-500/10 transition"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value={IncidentStatus.OPEN}>Open</option>
                  <option value={IncidentStatus.IN_PROGRESS}>In Progress</option>
                  <option value={IncidentStatus.RESOLVED}>Resolved</option>
                  <option value={IncidentStatus.CLOSED}>Closed</option>
                  <option value={IncidentStatus.REJECTED}>Rejected</option>
                </select>
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Priority</label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-500/10 transition"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="">All Priorities</option>
                  <option value={IncidentPriority.LOW}>Low</option>
                  <option value={IncidentPriority.MEDIUM}>Medium</option>
                  <option value={IncidentPriority.HIGH}>High</option>
                  <option value={IncidentPriority.CRITICAL}>Critical</option>
                </select>
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Category</label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-500/10 transition"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Title, description, or ticket #..."
                    className="w-full pl-9 pr-3 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-500/10 transition"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={handleResetFilters}
                className="flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-200 font-medium text-sm flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> {error}</div>}

      {/* Cards */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
              <div className="h-36 bg-slate-100" />
              <div className="p-5 space-y-3">
                <div className="flex justify-between"><div className="h-4 bg-slate-100 rounded-lg w-16" /><div className="h-4 bg-slate-100 rounded-full w-16" /></div>
                <div className="h-5 bg-slate-100 rounded-lg w-3/4" />
                <div className="h-10 bg-slate-50 rounded-lg" />
              </div>
            </div>
          ))
        ) : filteredIncidents.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full bg-white p-16 text-center rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{activeFilterCount > 0 ? "No matching tickets" : "All clear!"}</h3>
            <p className="text-slate-500 text-sm mb-6">{activeFilterCount > 0 ? "Try adjusting your filters to find what you're looking for." : "No incidents found. The campus is running smoothly."}</p>
            {activeFilterCount > 0 && (
              <button onClick={handleResetFilters} className="inline-flex items-center gap-2 border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
                <RotateCcw className="w-4 h-4" /> Clear Filters
              </button>
            )}
          </motion.div>
        ) : (
          filteredIncidents.map((inc) => {
            const warning = calculateSLAWarning(inc);
            const sCfg = statusConfig[inc.status];
            const pCfg = priorityConfig[inc.priority];

            return (
              <motion.div
                key={inc.id}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-slate-300/60 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Top status strip */}
                <div className={`h-1 bg-gradient-to-r ${sCfg.strip}`} />

                {/* Image */}
                {inc.attachments && inc.attachments.length > 0 && (
                  <div className="h-36 w-full overflow-hidden relative bg-slate-100">
                    {imageErrors[inc.attachments[0].id] ? (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-medium">Image Not Public</div>
                    ) : (
                      <img
                        src={inc.attachments[0].fileUrl}
                        alt="Evidence"
                        onError={() => setImageErrors(prev => ({ ...prev, [inc.attachments[0].id]: true }))}
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-2 right-2">
                      <span className="bg-black/40 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded-full font-medium">
                        📎 {inc.attachments.length}
                      </span>
                    </div>
                  </div>
                )}

                <div className={`p-5 flex-1 flex flex-col ${!(inc.attachments && inc.attachments.length > 0) ? "pt-5" : ""}`}>
                  {/* Priority + Status */}
                  <div className="flex justify-between items-start mb-3">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border ${pCfg.bg}`}>
                      {pCfg.icon} {inc.priority}
                    </span>
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border ${sCfg.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                      {inc.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-1">{inc.title}</h3>

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs font-mono font-medium text-slate-400">{inc.ticketNumber}</p>
                    <p className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">{inc.category}</p>
                  </div>

                  <div className="text-sm text-slate-600 mt-3 line-clamp-2 flex-1">{inc.description}</div>

                  {/* SLA Warning */}
                  {warning && (
                    <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold px-3 py-2 rounded-xl uppercase tracking-wider">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> {warning}
                    </div>
                  )}

                  <div className="pt-4 mt-3 flex flex-col gap-3 border-t border-slate-100">
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> {inc.comments ? inc.comments.length : 0} Comments
                      </span>
                      {inc.technicianName ? (
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                          Tech: {inc.technicianName.split(' ')[0]}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-400 italic">Unassigned</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/incidents/${inc.id}`}
                        className="flex-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-center py-2.5 rounded-xl text-sm font-bold shadow-sm hover:from-rose-600 hover:to-orange-600 transition"
                      >
                        Inspect Thread
                      </Link>
                      {inc.creatorId === user?.id && (
                        <>
                          <Link to={`/incidents/${inc.id}/edit`} className="px-3 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition" title="Edit">Edit</Link>
                          <button onClick={(e) => { e.preventDefault(); handleDelete(inc.id); }} className="px-3 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 hover:bg-red-100 transition" title="Delete">Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </section>
  );
}
