import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Search, RotateCcw, Users, MapPin, Plus, Sparkles, SlidersHorizontal } from "lucide-react";
import { resourceService } from "../../services/api/resourceService";
import { resourceTypeService } from "../../services/api/resourceTypeService";
import { useAuth } from "../../hooks/useAuth";
import type { Resource, ResourceFilters, ResourceStatus } from "../../types/resource";
import type { ResourceType } from "../../types/ResourceType";

const statusConfig: Record<ResourceStatus, { bg: string; dot: string }> = {
  ACTIVE: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  OUT_OF_SERVICE: { bg: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
  MAINTENANCE: { bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  INACTIVE: { bg: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export default function Resources() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("ADMIN");

  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [filters, setFilters] = useState<ResourceFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await resourceService.getAll(filters);
      setResources(data);
    } catch {
      setError("Failed to load resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    resourceTypeService.getAll().then(setResourceTypes);
  }, []);

  useEffect(() => {
    fetchResources();
  }, [filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  const handleReset = () => {
    setFilters({});
    resourceService.getAll({}).then(setResources);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Campus Resources</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Browse and discover {resources.length} available facilities
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              showFilters
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          {isAdmin && (
            <Link
              to="/resources/create"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-blue-500/20 hover:shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Resource
            </Link>
          )}
        </div>
      </motion.div>

      {/* Collapsible Filter Bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.form
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={handleSearch}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[140px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Status</label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10 transition"
                  value={filters.status || ""}
                  onChange={(e) => setFilters((f) => ({ ...f, status: (e.target.value as ResourceStatus) || undefined }))}
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Type</label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10 transition"
                  value={filters.resourceTypeId || ""}
                  onChange={(e) => setFilters((f) => ({ ...f, resourceTypeId: e.target.value || undefined }))}
                >
                  <option value="">All Types</option>
                  {resourceTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>{rt.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[120px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Building</label>
                <input
                  type="text"
                  placeholder="e.g. Block A"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10 transition"
                  value={filters.building || ""}
                  onChange={(e) => setFilters((f) => ({ ...f, building: e.target.value || undefined }))}
                />
              </div>

              <div className="flex-1 min-w-[120px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Floor 2"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10 transition"
                  value={filters.location || ""}
                  onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value || undefined }))}
                />
              </div>

              <div className="w-24">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Min Cap.</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10 transition"
                  value={filters.minCapacity || ""}
                  onChange={(e) => setFilters((f) => ({ ...f, minCapacity: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition"
              >
                <Search className="w-4 h-4" /> Search
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* States */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
              <div className="h-36 bg-slate-100" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-slate-100 rounded-lg w-3/4" />
                <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
                <div className="h-16 bg-slate-50 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-200 font-medium text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500" /> {error}
        </div>
      )}

      {!loading && !error && resources.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-16 text-center rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No resources found</h3>
          <p className="text-slate-500 text-sm">Try adjusting your filters or add a new resource.</p>
        </motion.div>
      )}

      {/* Resource Cards */}
      {!loading && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {resources.map((r) => (
              <motion.article
                variants={itemVariants}
                layout
                key={r.id}
                whileHover={{ y: -6 }}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 border border-slate-200 hover:border-blue-200/50 overflow-hidden flex flex-col"
              >
                <div className="p-1.5">
                  <div className="h-36 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl overflow-hidden relative">
                    {r.images && r.images.length > 0 ? (
                      <img src={r.images[0]} alt={r.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-slate-200" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border backdrop-blur-md bg-white/90 ${statusConfig[r.status].bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[r.status].dot}`} />
                        {r.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div>
                    <h2 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors leading-tight">{r.name}</h2>
                    {r.resourceType && (
                      <p className="text-xs font-semibold text-blue-500/80 uppercase tracking-wider mt-1">
                        {r.resourceType.name}
                      </p>
                    )}
                  </div>

                  <div className="flex bg-slate-50 rounded-xl p-3 gap-3 border border-slate-100">
                    <div className="flex-1">
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Location
                      </p>
                      <p className="text-xs font-medium text-slate-700 truncate">
                        {[r.building, r.floor].filter(Boolean).join(" · ") || "N/A"}
                      </p>
                    </div>
                    {r.capacity && (
                      <div className="flex-1 border-l border-slate-200 pl-3">
                        <p className="text-[10px] uppercase text-slate-400 font-bold mb-1 flex items-center gap-1">
                          <Users className="w-3 h-3" /> Capacity
                        </p>
                        <p className="text-xs font-medium text-slate-700">{r.capacity}</p>
                      </div>
                    )}
                  </div>

                  {r.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 mt-auto pt-1">{r.description}</p>
                  )}

                  {r.requiresApproval && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 w-fit">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                        Requires Approval
                      </span>
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}