import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { resourceService } from "../../services/api/resourceService";
import { resourceTypeService } from "../../services/api/resourceTypeService";
import type { Resource, ResourceFilters, ResourceStatus } from "../../types/resource";
import type { ResourceType } from "../../types/ResourceType";

const statusColors: Record<ResourceStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  OUT_OF_SERVICE: "bg-red-100 text-red-800",
  MAINTENANCE: "bg-yellow-100 text-yellow-800",
  INACTIVE: "bg-slate-100 text-slate-600",
};

export default function AdminResources() {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await resourceService.delete(id);
      fetchResources();
    } catch {
      setError(`Failed to delete resource ${name}.`);
    }
  };

  return (
    <section className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Resource Management</h1>
          <p className="text-slate-600 text-sm mt-1">
            Administrate and manage all campus facilities and equipment.
          </p>
        </div>
        <Link
          to="/resources/create"
          className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 transition"
        >
          + Add Resource
        </Link>
      </div>

      {/* Admin Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-wrap gap-3 items-center">
        <select
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 w-40"
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
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 w-48"
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
          placeholder="Search building..."
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
          value={filters.building || ""}
          onChange={(e) =>
            setFilters((f) => ({ ...f, building: e.target.value || undefined }))
          }
        />

        <button
          onClick={() => setFilters({})}
          className="border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition ml-auto"
        >
          Reset Filters
        </button>
      </div>

      {/* States */}
      {loading && <p className="text-slate-500 text-sm mb-4">Loading resources...</p>}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {!loading && !error && resources.length === 0 && (
        <p className="text-slate-500 text-sm mb-4">No resources found matching the criteria.</p>
      )}

      {/* Data Table */}
      {!loading && resources.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500 bg-slate-50">
                  <th className="px-5 py-3 font-medium">Resource Info</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Capacity</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resources.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {r.images && r.images.length > 0 ? (
                          <img src={r.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                            🏫
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-800">{r.name}</p>
                          <p className="text-xs text-slate-500">{r.code || "No Code"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {r.resourceType?.name || "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {[r.building, r.floor].filter(Boolean).join(" · ")}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-semibold uppercase tracking-wider ${statusColors[r.status]}`}>
                        {r.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {r.capacity ? `${r.capacity} 👥` : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/resources/${r.id}`}
                          className="text-slate-500 hover:text-slate-800 text-xs border border-transparent px-2 py-1 rounded hover:bg-slate-100 transition"
                        >
                          View
                        </Link>
                        <Link
                          to={`/resources/${r.id}/edit`}
                          className="text-primary hover:text-primary/80 text-xs border border-transparent px-2 py-1 rounded hover:bg-primary/10 transition"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(r.id, r.name)}
                          className="text-red-500 hover:text-red-700 text-xs border border-transparent px-2 py-1 rounded hover:bg-red-50 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
