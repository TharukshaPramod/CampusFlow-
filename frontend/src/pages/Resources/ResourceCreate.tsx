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

type FormErrors = Partial<Record<keyof ResourceRequest | "availableTime" | "images", string>>;

export default function ResourceCreate() {
  const { user } = useAuth();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const isAdmin = user?.roles?.includes("ADMIN");

  const [form, setForm] = useState<ResourceRequest>(defaultForm);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedImageName, setSelectedImageName] = useState<string>("");
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [typeForm, setTypeForm] = useState({
    name: "",
    category: "",
    description: "",
    icon: "",
  });
  const [typeSaving, setTypeSaving] = useState(false);
  const [typeError, setTypeError] = useState<string | null>(null);
  const [codeCheckState, setCodeCheckState] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [normalizedCode, setNormalizedCode] = useState("");

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
          images: r.images || [],
        });
        if (r.images && r.images.length > 0) {
          setImagePreview(r.images[0]);
        }
      })
      .catch(() => {
        setError("Failed to load resource details.");
      });
  }, [id, isEditing]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((f) => ({ ...f, [name]: checked }));
    } else if (name === "capacity") {
      setForm((f) => ({ ...f, capacity: Number(value) }));
    } else if (name === "code") {
      const normalized = value.toUpperCase().replace(/\s+/g, "").replace(/[^A-Z0-9-]/g, "");
      setForm((f) => ({ ...f, code: normalized }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }

    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
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

    const validationErrors = validateForm(form);
    if (codeCheckState === "taken") {
      validationErrors.code = "This code is already used by another resource.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setError("Please correct the highlighted fields.");
      return;
    }

    try {
      const existingResources = await resourceService.getAll();
      const targetName = normalizeNameForCompare(form.name);
      const duplicateByName = existingResources.find((resource) => {
        const isSameResource = Boolean(isEditing && id && resource.id === id);
        return !isSameResource && normalizeNameForCompare(resource.name) === targetName;
      });

      if (duplicateByName) {
        setFormErrors((prev) => ({
          ...prev,
          name: "A resource with this name already exists.",
        }));
        setError("Please correct the highlighted fields.");
        return;
      }
    } catch {
      setError("Failed to validate resource name uniqueness. Please try again.");
      return;
    }

    const payload = normalizePayload(form);
    setSaving(true);
    setError(null);
    try {
      if (isEditing && id) {
        await resourceService.update(id, payload);
        navigate(`/resources/${id}`);
      } else {
        await resourceService.create(payload);
        navigate('/resources');
      }
    } catch (err: any) {
      const backendErrors = err?.response?.data?.errors;
      if (backendErrors && typeof backendErrors === "object") {
        setFormErrors((prev) => ({ ...prev, ...backendErrors }));
      }
      const message = err?.response?.data?.message || err?.message || "Failed to save resource. Please check all fields.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }

    const maxFileSize = 5 * 1024 * 1024;
    if (file.size > maxFileSize) {
      setError("Image size must be 5MB or less.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const previewDataUrl = String(reader.result || "");
      setImagePreview(previewDataUrl);
      setSelectedImageName(file.name);
      setForm((prev) => ({
        ...prev,
        images: [previewDataUrl],
      }));
      setFormErrors((prev) => ({ ...prev, images: undefined }));
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleTypeCreate = async () => {
    if (!typeForm.name.trim() || !typeForm.category.trim()) {
      setTypeError("Type name and category are required.");
      return;
    }

    const duplicateType = resourceTypes.some(
      (rt) => rt.name.trim().toLowerCase() === typeForm.name.trim().toLowerCase()
    );
    if (duplicateType) {
      setTypeError("A resource type with this name already exists.");
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
      const message = err?.response?.data?.message || err?.message || "Failed to save resource type.";
      setTypeError(message);
    } finally {
      setTypeSaving(false);
    }
  };

  useEffect(() => {
    const code = (form.code || "").trim();
    setNormalizedCode(code);

    if (!code) {
      setCodeCheckState("idle");
      return;
    }

    if (!/^[A-Z0-9-]{3,30}$/.test(code)) {
      setCodeCheckState("idle");
      return;
    }

    setCodeCheckState("checking");
    const timer = setTimeout(async () => {
      try {
        const found = await resourceService.getByCode(code);
        const isSameResource = Boolean(isEditing && id && found.id === id);
        setCodeCheckState(isSameResource ? "available" : "taken");
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setCodeCheckState("available");
          return;
        }
        setCodeCheckState("idle");
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [form.code, isEditing, id]);

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
            {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
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
            {codeCheckState === "checking" && (
              <p className="text-xs text-slate-500 mt-1">Checking code availability...</p>
            )}
            {codeCheckState === "available" && normalizedCode && (
              <p className="text-xs text-emerald-600 mt-1">Code is available.</p>
            )}
            {(formErrors.code || codeCheckState === "taken") && (
              <p className="text-xs text-red-500 mt-1">
                {formErrors.code || "This code is already used by another resource."}
              </p>
            )}
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
            {formErrors.resourceTypeId && <p className="text-xs text-red-500 mt-1">{formErrors.resourceTypeId}</p>}

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
            {formErrors.status && <p className="text-xs text-red-500 mt-1">{formErrors.status}</p>}
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
            {formErrors.capacity && <p className="text-xs text-red-500 mt-1">{formErrors.capacity}</p>}
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
            {formErrors.building && <p className="text-xs text-red-500 mt-1">{formErrors.building}</p>}
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
            {formErrors.floor && <p className="text-xs text-red-500 mt-1">{formErrors.floor}</p>}
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
            {formErrors.location && <p className="text-xs text-red-500 mt-1">{formErrors.location}</p>}
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
          {formErrors.availableDays && <p className="text-xs text-red-500 mt-1">{formErrors.availableDays}</p>}
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
          {formErrors.availableTime && <p className="text-xs text-red-500 mt-1">{formErrors.availableTime}</p>}
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
          {formErrors.description && <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Resource Image
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg hover:bg-slate-50 transition relative">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <div className="mb-4">
                  <img src={imagePreview} alt="Preview" className="mx-auto h-48 w-auto rounded object-cover shadow-sm" />
                </div>
              ) : (
                <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <div className="flex text-sm text-slate-600 justify-center">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                  <span>Upload a file</span>
                  <input type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-slate-500">
                {selectedImageName ? selectedImageName : "PNG, JPG, GIF up to 5MB"}
              </p>
            </div>
          </div>
        </div>
        {formErrors.images && <p className="text-xs text-red-500 mt-1">{formErrors.images}</p>}

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

function normalizePayload(form: ResourceRequest): ResourceRequest {
  const normalizeText = (value?: string) => {
    const trimmed = value?.trim() || "";
    return trimmed.length > 0 ? trimmed : undefined;
  };

  return {
    ...form,
    name: form.name.trim(),
    code: normalizeText(form.code)?.toUpperCase(),
    description: normalizeText(form.description),
    location: normalizeText(form.location),
    building: normalizeText(form.building),
    floor: normalizeText(form.floor),
    availableFrom: normalizeText(form.availableFrom),
    availableTo: normalizeText(form.availableTo),
    availableDays: [...new Set(form.availableDays || [])],
    capacity: Number(form.capacity || 0),
  };
}

function normalizeNameForCompare(name?: string): string {
  return (name || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function validateForm(form: ResourceRequest): FormErrors {
  const errors: FormErrors = {};

  const name = form.name?.trim() || "";
  if (!name) {
    errors.name = "Resource name is required.";
  } else if (name.length < 3) {
    errors.name = "Name must be at least 3 characters.";
  } else if (name.length > 100) {
    errors.name = "Name must be 100 characters or less.";
  }

  const code = form.code?.trim() || "";
  if (!code) {
    errors.code = "Resource code is required.";
  } else if (!/^[A-Z0-9-]{3,30}$/.test(code)) {
    errors.code = "Code must be 3-30 chars using A-Z, 0-9, and '-' only.";
  }

  if (!form.resourceTypeId?.trim()) {
    errors.resourceTypeId = "Please select a resource type.";
  }

  if (!form.status?.trim()) {
    errors.status = "Please select a status.";
  }

  if (!form.building?.trim()) {
    errors.building = "Building is required.";
  }

  if (!form.floor?.trim()) {
    errors.floor = "Floor is required.";
  }

  if (!form.location?.trim()) {
    errors.location = "Location is required.";
  }

  const capacity = Number(form.capacity);
  if (!Number.isFinite(capacity) || !Number.isInteger(capacity) || capacity < 1 || capacity > 10000) {
    errors.capacity = "Capacity must be an integer between 1 and 10000.";
  }

  const description = form.description?.trim() || "";
  if (description.length > 1000) {
    errors.description = "Description must be 1000 characters or less.";
  }

  const hasFrom = Boolean(form.availableFrom?.trim());
  const hasTo = Boolean(form.availableTo?.trim());
  if (!hasFrom || !hasTo) {
    errors.availableTime = "Available From and Available To are required.";
  }
  if (hasFrom && hasTo && form.availableFrom! >= form.availableTo!) {
    errors.availableTime = "Available From must be earlier than Available To.";
  }

  const invalidDays = (form.availableDays || []).filter((day) => !Number.isInteger(day) || day < 1 || day > 7);
  if ((form.availableDays || []).length === 0) {
    errors.availableDays = "Please select at least one available day.";
  } else if (invalidDays.length > 0) {
    errors.availableDays = "Available days must be valid weekday values.";
  }

  const image = form.images?.[0]?.trim();
  const isExistingImageReference = Boolean(image && (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("/") || image.startsWith("blob:")));
  if (image && !image.startsWith("data:image/") && !isExistingImageReference) {
    errors.images = "Image must be a valid image file.";
  }

  return errors;
}
