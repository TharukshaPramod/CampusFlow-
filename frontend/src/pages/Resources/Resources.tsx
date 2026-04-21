import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { resourceService } from "../../services/api/resourceService";
import { resourceTypeService } from "../../services/api/resourceTypeService";
import { useAuth } from "../../hooks/useAuth";
import type { Resource, ResourceFilters, ResourceStatus } from "../../types/resource";
import type { ResourceType } from "../../types/ResourceType";

const statusColors: Record<ResourceStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  OUT_OF_SERVICE: "bg-red-100 text-red-800",
  MAINTENANCE: "bg-yellow-100 text-yellow-800",
  INACTIVE: "bg-slate-100 text-slate-600",
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
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
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  const handleReset = () => {
    setFilters({});
    resourceService.getAll({}).then(setResources);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Resources</h1>
          <p className="text-slate-600 text-sm mt-1">
            Browse and manage campus resources.
          </p>
        </div>
        {isAdmin && (
          <Link
            to="/resources/create"
            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 transition"
          >
            + Add Resource
          </Link>
        )}
      </div>

      {/* Filters */}
      <motion.form
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleSearch}
        className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-slate-200/50 mb-8 flex flex-wrap gap-3 items-center sticky top-[72px] z-10"
      >
        <select
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
          value={filters.status || ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              status: (e.target.value as ResourceStatus) || undefined,
            }))
          }
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="OUT_OF_SERVICE">Out of Service</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <select
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
          value={filters.resourceTypeId || ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              resourceTypeId: e.target.value || undefined,
            }))
          }
        >
          <option value="">All Types</option>
          {resourceTypes.map((rt) => (
            <option key={rt.id} value={rt.id}>
              {rt.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Building..."
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
          value={filters.building || ""}
          onChange={(e) =>
            setFilters((f) => ({ ...f, building: e.target.value || undefined }))
          }
        />

        <input
          type="text"
          placeholder="Location..."
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
          value={filters.location || ""}
          onChange={(e) =>
            setFilters((f) => ({ ...f, location: e.target.value || undefined }))
          }
        />

        <input
          type="number"
          placeholder="Min capacity"
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 w-32"
          value={filters.minCapacity || ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              minCapacity: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
        />

        <button
          type="submit"
          className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 transition"
        >
          Search
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition"
        >
          Reset
        </button>
      </motion.form>

      {/* States */}
      {loading && (
        <p className="text-slate-500 text-sm">Loading resources...</p>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!loading && !error && resources.length === 0 && (
        <p className="text-slate-500 text-sm">No resources found.</p>
      )}

      {/* Resource Cards */}
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
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border border-slate-200 overflow-hidden flex flex-col"
            >
              <div className="p-1">
                 <div className="h-32 bg-slate-100 rounded-t-xl rounded-b-sm overflow-hidden relative">
                    {r.images && r.images.length > 0 ? (
                      <img src={r.images[0]} alt={r.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl opacity-10">🏫</div>
                    )}
                    <span
                      className={`absolute top-3 right-3 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm backdrop-blur-md bg-white/90 ${statusColors[r.status]}`}
                    >
                      {r.status.replace(/_/g, " ")}
                    </span>
                 </div>
              </div>
              <div className="p-5 flex flex-col gap-3 flex-1">
                <div>
                  <h2 className="font-bold text-slate-800 text-lg group-hover:text-primary transition-colors">{r.name}</h2>
                  {r.resourceType && (
                    <p className="text-xs font-semibold text-primary/70 uppercase tracking-wider mt-1">
                      {r.resourceType.name}
                    </p>
                  )}
                </div>

                <div className="flex bg-slate-50 rounded-lg p-3 gap-3 border border-slate-100 mt-2">
                  <div className="flex-1">
                    <p className="text-[10px] uppercase text-slate-400 font-semibold mb-1">Building/Floor</p>
                    <p className="text-xs font-medium text-slate-700 truncate">
                       {[r.building, r.floor].filter(Boolean).join(" · ") || "N/A"}
                    </p>
                  </div>
                  {r.capacity && (
                    <div className="flex-1 border-l border-slate-200 pl-3">
                      <p className="text-[10px] uppercase text-slate-400 font-semibold mb-1">Capacity</p>
                      <p className="text-xs font-medium text-slate-700 flex items-center gap-1">
                        👥 {r.capacity}
                      </p>
                    </div>
                  )}
                </div>

                {r.description && (
                  <p className="text-sm text-slate-500 line-clamp-2 mt-auto pt-2">
                    {r.description}
                  </p>
                )}

                {r.requiresApproval && (
                  <div className="mt-2 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                      Requires Approval
                    </span>
                  </div>
                )}
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}