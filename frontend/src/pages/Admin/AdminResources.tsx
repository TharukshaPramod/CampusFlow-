import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Plus, SlidersHorizontal, RotateCcw, Eye, Pencil, Trash2, MapPin, Users } from "lucide-react";
import { resourceService } from "../../services/api/resourceService";
import { resourceTypeService } from "../../services/api/resourceTypeService";
import type { Resource, ResourceFilters, ResourceStatus } from "../../types/resource";
import type { ResourceType } from "../../types/ResourceType";

const statusConfig: Record<ResourceStatus, { bg: string; dot: string }> = {
  ACTIVE: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  OUT_OF_SERVICE: { bg: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
  MAINTENANCE: { bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  INACTIVE: { bg: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
};

export default function AdminResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [filters, setFilters] = useState<ResourceFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchResources = useCallback(async () => {
    try { setLoading(true); setError(null); setResources(await resourceService.getAll(filters)); }
    catch { setError("Failed to load resources."); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { resourceTypeService.getAll().then(setResourceTypes); }, []);
  useEffect(() => { fetchResources(); }, [fetchResources]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try { await resourceService.delete(id); fetchResources(); }
    catch { setError(`Failed to delete resource ${name}.`); }
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <section className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resource Management</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage all campus facilities and equipment</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${showFilters ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
            <SlidersHorizontal className="w-4 h-4" /> Filters
            {activeFilterCount > 0 && <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>}
          </button>
          <Link to="/resources/create" className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-blue-500/20 hover:shadow-md">
            <Plus className="w-4 h-4" /> Add Resource
          </Link>
        </div>
      </motion.div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[140px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Status</label>
                <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10 transition" value={filters.status || ""} onChange={(e) => setFilters((f) => ({ ...f, status: (e.target.value as ResourceStatus) || undefined }))}>
                  <option value="">All Statuses</option><option value="ACTIVE">Active</option><option value="OUT_OF_SERVICE">Out of Service</option><option value="MAINTENANCE">Maintenance</option><option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Type</label>
                <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10 transition" value={filters.resourceTypeId || ""} onChange={(e) => setFilters((f) => ({ ...f, resourceTypeId: e.target.value || undefined }))}>
                  <option value="">All Types</option>
                  {resourceTypes.map((rt) => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Building</label>
                <input type="text" placeholder="e.g. Block A" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10 transition" value={filters.building || ""} onChange={(e) => setFilters((f) => ({ ...f, building: e.target.value || undefined }))} />
              </div>
              <button onClick={() => setFilters({})} className="flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition">
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-200 font-medium text-sm flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> {error}</div>}

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left bg-slate-50/80">
                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resource Info</th>
                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</th>
                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Capacity</th>
                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-slate-100" /><div className="space-y-1.5"><div className="h-4 bg-slate-100 rounded w-28" /><div className="h-3 bg-slate-100 rounded w-16" /></div></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-20" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-24" /></td>
                    <td className="px-5 py-4"><div className="h-5 bg-slate-100 rounded-full w-16" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-8" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : resources.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">No resources found matching criteria</td></tr>
              ) : (
                resources.map((r) => (
                  <tr key={r.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {r.images && r.images.length > 0 ? (
                          <img src={r.images[0]} alt="" className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200 group-hover:border-blue-200 transition" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center"><Box className="w-4 h-4 text-slate-300" /></div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{r.name}</p>
                          <p className="text-xs text-slate-400">{r.code || "No Code"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{r.resourceType?.name || "—"}</span></td>
                    <td className="px-5 py-4"><span className="flex items-center gap-1 text-slate-600 text-xs"><MapPin className="w-3 h-3" />{[r.building, r.floor].filter(Boolean).join(" · ") || "—"}</span></td>
                    <td className="px-5 py-4">
                      <span className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border w-fit ${statusConfig[r.status].bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[r.status].dot}`} />{r.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4">{r.capacity ? <span className="flex items-center gap-1 text-xs text-slate-600"><Users className="w-3 h-3" />{r.capacity}</span> : <span className="text-slate-300">—</span>}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <Link to={`/resources/${r.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View"><Eye className="w-4 h-4" /></Link>
                        <Link to={`/resources/${r.id}/edit`} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Edit"><Pencil className="w-4 h-4" /></Link>
                        <button onClick={() => handleDelete(r.id, r.name)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
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
