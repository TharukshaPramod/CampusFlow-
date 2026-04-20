import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
    fetchResources();
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
      <form
        onSubmit={handleSearch}
        className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-3"
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
      </form>

      {/* States */}
      {loading && (
        <p className="text-slate-500 text-sm">Loading resources...</p>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!loading && !error && resources.length === 0 && (
        <p className="text-slate-500 text-sm">No resources found.</p>
      )}

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((r) => (
          <article
            key={r.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-2"
          >
            <div className="flex items-start justify-between">
              <h2 className="font-semibold text-slate-800 text-sm">{r.name}</h2>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[r.status]}`}
              >
                {r.status.replace(/_/g, " ")}
              </span>
            </div>

            {r.resourceType && (
              <p className="text-xs text-slate-500">
                {r.resourceType.name} · {r.resourceType.category}
              </p>
            )}

            <p className="text-xs text-slate-500">
              {[r.building, r.floor, r.location].filter(Boolean).join(" · ")}
            </p>

            {r.capacity && (
              <p className="text-xs text-slate-400">Capacity: {r.capacity}</p>
            )}

            {r.description && (
              <p className="text-xs text-slate-600 line-clamp-2">
                {r.description}
              </p>
            )}

            {r.requiresApproval && (
              <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full w-fit">
                Requires Approval
              </span>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}