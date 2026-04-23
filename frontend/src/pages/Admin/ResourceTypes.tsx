import { useState, useEffect } from "react";
import { resourceTypeService } from "../../services/api/resourceTypeService";
import type { ResourceType, ResourceTypeRequest } from "../../types/ResourceType";

const defaultForm: ResourceTypeRequest = {
  name: "",
  category: "",
  description: "",
  icon: "",
};

export default function ResourceTypes() {
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ResourceTypeRequest>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchResourceTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await resourceTypeService.getAll();
      console.log("Fetched resource types:", data);
      setResourceTypes(data);
    } catch (err) {
      console.error("Error fetching resource types:", err);
      setError("Failed to load resource types. Check browser console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResourceTypes();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleEdit = (rt: ResourceType) => {
    setEditingId(rt.id);
    setForm({
      name: rt.name,
      category: rt.category,
      description: rt.description || "",
      icon: rt.icon || "",
    });
    setShowForm(true);
    setFormError(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(defaultForm);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editingId) {
        await resourceTypeService.update(editingId, form);
      } else {
        await resourceTypeService.create(form);
      }
      await fetchResourceTypes();
      handleCancel();
    } catch (err: any) {
      setFormError(err?.message || "Failed to save resource type. Please check all fields.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this resource type?")) return;
    try {
      await resourceTypeService.delete(id);
      await fetchResourceTypes();
    } catch (err: any) {
      setError(err?.message || "Failed to delete resource type.");
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            Resource Types
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Manage categories of bookable campus resources.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 transition"
          >
            + Add Resource Type
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-base font-medium text-slate-800 mb-4">
            {editingId ? "Edit Resource Type" : "New Resource Type"}
          </h2>

          {formError && (
            <p className="text-red-500 text-sm mb-4">{formError}</p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Lecture Hall"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
                >
                  <option value="">Select category...</option>
                  <option value="ROOM">Room</option>
                  <option value="EQUIPMENT">Equipment</option>
                  <option value="FACILITY">Facility</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Icon
                </label>
                <input
                  name="icon"
                  value={form.icon}
                  onChange={handleChange}
                  placeholder="e.g. building"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="e.g. Large rooms for lectures"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-800 text-white px-5 py-2 rounded-lg text-sm hover:bg-slate-700 disabled:opacity-50 transition"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Resource Type"
                  : "Create Resource Type"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="border border-slate-200 text-slate-600 px-5 py-2 rounded-lg text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* States */}
      {loading && (
        <p className="text-slate-500 text-sm">Loading resource types...</p>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!loading && !error && resourceTypes.length === 0 && (
        <p className="text-slate-500 text-sm">
          No resource types yet. Add one to get started.
        </p>
      )}

      {/* Table */}
      {!loading && resourceTypes.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium">Icon</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resourceTypes.map((rt) => (
                <tr
                  key={rt.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition"
                >
                  <td className="px-5 py-3 font-medium text-slate-800">
                    {rt.name}
                  </td>
                  <td className="px-5 py-3">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs">
                      {rt.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {rt.description || "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {rt.icon || "—"}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(rt)}
                        className="text-slate-600 hover:text-slate-800 text-xs border border-slate-200 px-3 py-1 rounded-lg hover:bg-slate-50 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rt.id)}
                        className="text-red-500 hover:text-red-700 text-xs border border-red-100 px-3 py-1 rounded-lg hover:bg-red-50 transition"
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
      )}
    </section>
  );
}