import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { resourceService } from "../../services/api/resourceService";
import type { Resource } from "../../types/resource";
import type { ResourceFeature } from "../../types/ResourceFeature";
import type { ResourceMaintenance } from "../../types/ResourceMaintenance";

const statusColors = {
  ACTIVE: "bg-green-100 text-green-800",
  OUT_OF_SERVICE: "bg-red-100 text-red-800",
  MAINTENANCE: "bg-yellow-100 text-yellow-800",
  INACTIVE: "bg-slate-100 text-slate-600",
};

export default function ResourceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resource, setResource] = useState<Resource | null>(null);
  const [features, setFeatures] = useState<ResourceFeature[]>([]);
  const [maintenance, setMaintenance] = useState<ResourceMaintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "features" | "maintenance">("details");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      resourceService.getById(id),
      resourceService.getFeatures(id),
      resourceService.getMaintenanceSchedules(id),
    ])
      .then(([res, feat, maint]) => {
        setResource(res);
        setFeatures(feat);
        setMaintenance(maint);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!resource || !window.confirm("Delete this resource?")) return;
    await resourceService.delete(resource.id);
    navigate("/resources");
  };

  if (loading)
    return <p className="p-8 text-slate-500 text-sm">Loading...</p>;
  if (!resource)
    return <p className="p-8 text-red-500 text-sm">Resource not found.</p>;

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        to="/resources"
        className="text-slate-500 hover:text-slate-700 text-sm mb-4 inline-block"
      >
        ← Back to Resources
      </Link>

      {/* Header */}
      {resource.images && resource.images.length > 0 && (
        <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-6 shadow-md relative">
          <img src={resource.images[0]} alt={resource.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-3xl font-bold">{resource.name}</h1>
            <p className="opacity-90 flex items-center gap-2 mt-1">
               <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.538l.061.024zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
               {[resource.building, resource.floor, resource.location].filter(Boolean).join(", ")}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            {!(resource.images && resource.images.length > 0) && (
               <h1 className="text-xl font-semibold text-slate-800">
                 {resource.name}
               </h1>
            )}
            {resource.code && (
              <p className="text-xs text-slate-400 mt-1">Code: {resource.code}</p>
            )}
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium ${
              statusColors[resource.status]
            }`}
          >
            {resource.status.replace(/_/g, " ")}
          </span>
        </div>

        {/* Admin Actions */}
        <div className="flex gap-3">
          <Link
            to={`/resources/${resource.id}/edit`}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 transition"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(["details", "features", "maintenance"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition ${
              activeTab === tab
                ? "bg-slate-800 text-white"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

        {/* Details Tab */}
        {activeTab === "details" && (
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-slate-500">Type</dt>
              <dd className="font-medium text-slate-800 mt-1">
                {resource.resourceType?.name || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Category</dt>
              <dd className="font-medium text-slate-800 mt-1">
                {resource.resourceType?.category || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Building</dt>
              <dd className="font-medium text-slate-800 mt-1">
                {resource.building || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Floor</dt>
              <dd className="font-medium text-slate-800 mt-1">
                {resource.floor || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Location</dt>
              <dd className="font-medium text-slate-800 mt-1">
                {resource.location || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Capacity</dt>
              <dd className="font-medium text-slate-800 mt-1">
                {resource.capacity || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Available From</dt>
              <dd className="font-medium text-slate-800 mt-1">
                {resource.availableFrom || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Available To</dt>
              <dd className="font-medium text-slate-800 mt-1">
                {resource.availableTo || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Available Days</dt>
              <dd className="font-medium text-slate-800 mt-1">
                {resource.availableDays?.join(", ") || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Requires Approval</dt>
              <dd className="font-medium text-slate-800 mt-1">
                {resource.requiresApproval ? "Yes" : "No"}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-slate-500">Description</dt>
              <dd className="text-slate-700 mt-1">
                {resource.description || "—"}
              </dd>
            </div>
          </dl>
        )}

        {/* Features Tab */}
        {activeTab === "features" && (
          <div>
            {features.length === 0 ? (
              <p className="text-slate-500 text-sm">No features listed.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="pb-2">Feature</th>
                    <th className="pb-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((f) => (
                    <tr key={f.id} className="border-b border-slate-100">
                      <td className="py-2 text-slate-700">{f.featureName}</td>
                      <td className="py-2 text-slate-600">{f.featureValue || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === "maintenance" && (
          <div>
            {maintenance.length === 0 ? (
              <p className="text-slate-500 text-sm">No maintenance scheduled.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {maintenance.map((m) => (
                  <div
                    key={m.id}
                    className="border border-slate-200 rounded-lg p-4 text-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-800">
                        {m.startDate} {m.endDate ? `→ ${m.endDate}` : ""}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                        {m.status}
                      </span>
                    </div>
                    {m.description && (
                      <p className="text-slate-600">{m.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
