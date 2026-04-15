import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resourceService } from "../../services/api/resourceService";
import { resourceTypeService } from "../../services/api/resourceTypeService";
import type { ResourceRequest, ResourceStatus } from "../../types/resource";
import type { ResourceType } from "../../types/ResourceType";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

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
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState<ResourceRequest>(defaultForm);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    resourceTypeService.getAll().then(setResourceTypes);
  }, []);

  useEffect(() => {
    if (!isEditing || !id) return;
    resourceService.getById(id).then((r) => {
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

  const handleDayToggle = (day: string) => {
    setForm((f) => ({
      ...f,
      availableDays: f.availableDays?.includes(day)
        ? f.availableDays.filter((d) => d !== day)
        : [...(f.availableDays || []), day],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEditing && id) {
        await resourceService.update(id, form);
        navigate(`/resources/${id}`);
      } else {
        const created = await resourceService.create(form);
        navigate(`/resources/${created.id}`);
      }
    } catch {
      setError("Failed to save resource. Please check all fields.");
    } finally {
      setSaving(false);
    }
  };

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
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Resource Type
            </label>
            <select
              name="resourceTypeId"
              value={form.resourceTypeId}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
            >
              <option value="">Select type...</option>
              {resourceTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name}
                </option>
              ))}
            </select>
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
                key={day}
                type="button"
                onClick={() => handleDayToggle(day)}
                className={`px-3 py-1 rounded-full text-xs transition ${
                  form.availableDays?.includes(day)
                    ? "bg-slate-800 text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {day.slice(0, 3)}
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
