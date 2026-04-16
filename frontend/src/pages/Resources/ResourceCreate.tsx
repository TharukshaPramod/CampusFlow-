import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resourceService } from "../../services/api/resourceService";
import { resourceTypeService } from "../../services/api/resourceTypeService";
import { useAuth } from "../../hooks/useAuth";
import type { ResourceRequest } from "../../types/resource";
import type { ResourceType } from "../../types/ResourceType";

const DAYS = [
  { label: "MON", value: 1 },
  { label: "TUE", value: 2 },
  { label: "WED", value: 3 },
  { label: "THU", value: 4 },
  { label: "FRI", value: 5 },
  { label: "SAT", value: 6 },
  { label: "SUN", value: 7 },
];

const defaultForm: ResourceRequest = {
  name: "",
  code: "",
  description: "",
  location: "",
  building: "",
  floor: "",
  capacity: 1,
  status: "ACTIVE",
  resourceTypeId: "",
  availableDays: [],
  availableFrom: "",
  availableTo: "",
  requiresApproval: false,
};

export default function ResourceCreate() {
  const { user } = useAuth();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const isAdmin = user?.roles?.includes("ADMIN");

  const [form, setForm] = useState<ResourceRequest>(defaultForm);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [typeForm, setTypeForm] = useState({
    name: "",
    category: "",
    description: "",
    icon: "",
  });
  const [typeSaving, setTypeSaving] = useState(false);
  const [typeError, setTypeError] = useState<string | null>(null);

  useEffect(() => {
    resourceTypeService
      .getAll()
      .then(setResourceTypes)
      .catch(() => setError("Failed to load resource types."));
  }, []);

  useEffect(() => {
    if (!isEditing || !id) return;
    resourceService
      .getById(id)
      .then((r) => {
        setForm({
          name: r.name,
          code: r.code || "",
          description: r.description || "",
          location: r.location || "",
          building: r.building || "",
          floor: r.floor || "",
          capacity: r.capacity || 1,
          status: r.status,
          resourceTypeId: r.resourceType?.id || "",
          availableDays: r.availableDays || [],
          availableFrom: r.availableFrom || "",
          availableTo: r.availableTo || "",
          requiresApproval: r.requiresApproval || false,
        });
      })
      .catch(() => {
        setError("Failed to load resource details.");
      });
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((f) => ({ ...f, [name]: checked }));
    } else if (name === "capacity") {
      setForm((f) => ({ ...f, capacity: Number(value) }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleDayToggle = (day: number) => {
    setForm((f) => ({
      ...f,
      availableDays: f.availableDays?.includes(day)
        ? f.availableDays.filter((d) => d !== day)
        : [...(f.availableDays || []), day],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.resourceTypeId) {
      setError("Please select a resource type.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (isEditing && id) {
        await resourceService.update(id, form);
        navigate(`/resources/${id}`);
      } else {
        await resourceService.create(form);
        navigate('/resources');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to save resource. Please check all fields.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleTypeCreate = async () => {
    if (!typeForm.name.trim() || !typeForm.category.trim()) {
      setTypeError("Type name and category are required.");
      return;
    }

    setTypeSaving(true);
    setTypeError(null);
    try {
      const created = await resourceTypeService.create(typeForm);
      setResourceTypes((prev) => [...prev, created]);
      setForm((prev) => ({ ...prev, resourceTypeId: created.id }));
      setTypeForm({ name: "", category: "", description: "", icon: "" });
      setShowTypeForm(false);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to save resource type.";
      setTypeError(message);
    } finally {
      setTypeSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-red-500 text-sm">Only admins can add or edit resources.</p>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to="/resources"
        className="text-slate-500 hover:text-slate-700 text-sm mb-4 inline-block"
      >
        ← Back to Resources
      </Link>

      <h1 className="text-xl font-semibold text-slate-800 mb-6">
        {isEditing ? "Edit Resource" : "Add New Resource"}
      </h1>

      {error && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-5"
      >
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
              placeholder="e.g. Lab 201"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Code
            </label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
              placeholder="e.g. LAB-201"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">
                Resource Type *
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowTypeForm((prev) => !prev);
                  setTypeError(null);
                }}
                className="text-xs border border-slate-200 text-slate-600 px-2 py-1 rounded-md hover:bg-slate-50 transition"
              >
                + Add Type
              </button>
            </div>
            <select
              name="resourceTypeId"
              value={form.resourceTypeId}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
            >
              <option value="">Select type...</option>
              {resourceTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name}
                </option>
              ))}
            </select>

            {showTypeForm && (
              <div className="mt-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
                {typeError && <p className="text-red-500 text-xs mb-2">{typeError}</p>}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="name"
                    value={typeForm.name}
                    onChange={(e) => setTypeForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Type name"
                    required
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
                  />
                  <select
                    name="category"
                    value={typeForm.category}
                    onChange={(e) => setTypeForm((f) => ({ ...f, category: e.target.value }))}
                    required
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
                  >
                    <option value="">Select category...</option>
                    <option value="ROOM">Room</option>
                    <option value="EQUIPMENT">Equipment</option>
                    <option value="FACILITY">Facility</option>
                  </select>
                  <input
                    name="icon"
                    value={typeForm.icon}
                    onChange={(e) => setTypeForm((f) => ({ ...f, icon: e.target.value }))}
                    placeholder="Icon"
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
                  />
                  <input
                    name="description"
                    value={typeForm.description}
                    onChange={(e) => setTypeForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Description"
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
                  />
                  <div className="col-span-2 flex gap-2">
                    <button
                      type="button"
                      onClick={handleTypeCreate}
                      disabled={typeSaving}
                      className="bg-slate-800 text-white px-3 py-2 rounded-lg text-xs hover:bg-slate-700 disabled:opacity-50 transition"
                    >
                      {typeSaving ? "Saving..." : "Save Type"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTypeForm(false)}
                      className="border border-slate-200 text-slate-600 px-3 py-2 rounded-lg text-xs hover:bg-white transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status *
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
            >
              <option value="ACTIVE">Active</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Capacity
            </label>
            <input
              name="capacity"
              type="number"
              min={1}
              value={form.capacity}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
            />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Building
            </label>
            <input
              name="building"
              value={form.building}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
              placeholder="e.g. Block A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Floor
            </label>
            <input
              name="floor"
              value={form.floor}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
              placeholder="e.g. 2nd Floor"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Location
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
              placeholder="e.g. Room 201"
            />
          </div>
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Available Days
          </label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => handleDayToggle(day.value)}
                className={`px-3 py-1 rounded-full text-xs transition ${
                  form.availableDays?.includes(day.value)
                    ? "bg-slate-800 text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Available From
            </label>
            <input
              name="availableFrom"
              type="time"
              value={form.availableFrom}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Available To
            </label>
            <input
              name="availableTo"
              type="time"
              value={form.availableTo}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
          />
        </div>

        {/* Requires Approval */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="requiresApproval"
            name="requiresApproval"
            checked={form.requiresApproval || false}
            onChange={handleChange}
            className="rounded border-slate-300"
          />
          <label
            htmlFor="requiresApproval"
            className="text-sm text-slate-700"
          >
            Requires approval for booking
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-slate-800 text-white px-5 py-2 rounded-lg text-sm hover:bg-slate-700 disabled:opacity-50 transition"
          >
            {saving ? "Saving..." : isEditing ? "Update Resource" : "Create Resource"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="border border-slate-200 text-slate-600 px-5 py-2 rounded-lg text-sm hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
