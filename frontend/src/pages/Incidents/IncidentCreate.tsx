import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { UploadCloud, X, AlertTriangle } from "lucide-react";
import { incidentService } from "../../services/api/incidents";
import { resourceService } from "../../services/api/resourceService";
import type { Resource } from "../../types/resource";
import { IncidentPriority, IncidentAttachment } from "../../types/incident";

export default function IncidentCreate() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // added for Edit mode
  const isEditMode = Boolean(id);
  
  const [searchParams] = useSearchParams();
  const initialResourceId = searchParams.get("resourceId") || "";

  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceId, setResourceId] = useState(initialResourceId);
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("MAINTENANCE");
  const [priority, setPriority] = useState<IncidentPriority>(IncidentPriority.LOW);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [preferredContact, setPreferredContact] = useState("");

  const [attachments, setAttachments] = useState<{ name: string; base64: string }[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<IncidentAttachment[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load resources
    const loadData = async () => {
      try {
        const resData = await resourceService.getAll({});
        setResources(resData);

        if (isEditMode && id) {
          const incData = await incidentService.getIncidentById(id);
          setTitle(incData.title);
          setCategory(incData.category);
          setPriority(incData.priority);
          setLocation(incData.location || "");
          setDescription(incData.description);
          setPreferredContact(incData.preferredContact);
          setResourceId(incData.resourceId || "");
          setExistingAttachments(incData.attachments || []);
        }
      } catch (err: any) {
        setError("Failed to load initial data.");
      }
    };
    
    loadData();
  }, [id, isEditMode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + attachments.length + existingAttachments.length > 3) {
      alert("You can only upload a maximum of 3 attachments.");
      return;
    }

    files.forEach((file) => {
      // Validate type
      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed.");
        return;
      }
      // Validate size (< 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be under 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Str = reader.result as string;
        setAttachments((prev) => {
          if (prev.length >= 3) return prev;
          return [...prev, { name: file.name, base64: base64Str }];
        });
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    e.target.value = "";
  };

  const removeAttachment = (indexToRemove: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const removeExistingAttachment = async (attachmentId: string) => {
    if (!window.confirm("Delete this attachment permanently?")) return;
    try {
      await incidentService.deleteAttachment(attachmentId);
      setExistingAttachments(prev => prev.filter(a => a.id !== attachmentId));
    } catch {
      alert("Failed to delete attachment.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category || !preferredContact) {
      setError("Please fill in all mandatory fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (isEditMode && id) {
        await incidentService.updateIncident(id, {
          title,
          category,
          description,
          priority,
          preferredContact,
          resourceId: resourceId || undefined,
          location: location || undefined
        });
        if (attachments.length > 0) {
          await incidentService.addAttachments(id, { attachmentsBase64: attachments.map(a => a.base64) });
        }
        navigate(`/incidents/${id}`);
      } else {
        await incidentService.createIncident({
          title,
          category,
          description,
          priority,
          preferredContact,
          resourceId: resourceId || undefined,
          location: location || undefined,
          attachmentsBase64: attachments.map(a => a.base64)
        });
        navigate("/incidents");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to submit incident ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <AlertTriangle className="text-red-500" strokeWidth={2.5} />
          {isEditMode ? "Modify Incident Ticket" : "Report an Incident"}
        </h1>
        <p className="text-slate-600 mt-1">
          {isEditMode ? "Update details of your previously reported issue." : "Submit a maintenance ticket or report an issue with a campus resource."}
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 mb-6 font-medium text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Subject / Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none transition"
                  placeholder="E.g., Broken projector in Room 302"
                  required
                />
             </div>
             
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Category *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none transition"
                  required
                >
                  <option value="MAINTENANCE">General Maintenance</option>
                  <option value="IT_SUPPORT">IT / Tech Support</option>
                  <option value="PLUMBING">Plumbing</option>
                  <option value="HVAC">HVAC / Air Conditioning</option>
                  <option value="OTHER">Other</option>
                </select>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Associated Resource</label>
                <select
                  value={resourceId}
                  onChange={e => setResourceId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none transition"
                >
                  <option value="">-- No Specific Resource / General Area --</option>
                  {resources.map(r => (
                    <option key={r.id} value={r.id}>{r.name} - {r.location}</option>
                  ))}
                </select>
             </div>
             
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Location Information</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none transition"
                  placeholder="E.g., North Wing Hallway"
                />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Ticket Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as IncidentPriority)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none transition"
                >
                  <option value={IncidentPriority.LOW}>Low - Routine Issue</option>
                  <option value={IncidentPriority.MEDIUM}>Medium - Affects Workflow</option>
                  <option value={IncidentPriority.HIGH}>High - Blocks Action</option>
                  <option value={IncidentPriority.CRITICAL}>Critical - Emergency</option>
                </select>
             </div>
             
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Contact Method *</label>
                <input
                  type="text"
                  value={preferredContact}
                  onChange={e => setPreferredContact(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none transition"
                  placeholder="Phone number, email, or Slack ID"
                  required
                />
             </div>
          </div>

          <div>
             <label className="block text-sm font-semibold text-slate-700 mb-2">Incident Description *</label>
             <textarea
               value={description}
               onChange={e => setDescription(e.target.value)}
               className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 min-h-[120px] focus:ring-2 focus:ring-primary/20 outline-none transition resize-y"
               placeholder="Provide detailed information about the issue so our technicians can prepare correctly..."
               required
             />
          </div>

          <div className="border border-dashed border-slate-300 rounded-2xl p-6 bg-slate-50">
             <div className="flex items-start justify-between mb-4">
                 <div>
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><UploadCloud size={18} /> Evidence Attachments</h3>
                    <p className="text-xs text-slate-500 mt-1">Upload up to 3 image evidence files (Max 5MB each).</p>
                 </div>
                 {(attachments.length + existingAttachments.length) < 3 && (
                    <label className="cursor-pointer bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                      Browse Files
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        className="hidden" 
                        onChange={handleFileUpload} 
                      />
                    </label>
                 )}
             </div>

             {(attachments.length > 0 || existingAttachments.length > 0) && (
                <div className="flex flex-wrap gap-4 mt-4">
                  {existingAttachments.map((file) => (
                    <div key={file.id} className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm w-32 h-32 bg-white flex items-center justify-center">
                      <img src={file.fileUrl} alt="Evidence" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeExistingAttachment(file.id)}
                        className="absolute top-2 right-2 bg-slate-900/60 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        title="Delete permanently"
                      >
                         <X size={14} />
                      </button>
                    </div>
                  ))}
                  {attachments.map((file, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm w-32 h-32 bg-white flex items-center justify-center">
                      <img src={file.base64} alt="Evidence" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="absolute top-2 right-2 bg-slate-900/60 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        title="Remove before upload"
                      >
                         <X size={14} />
                      </button>
                      <span className="absolute bottom-1 right-1 bg-yellow-100 text-yellow-800 text-[10px] px-1 rounded font-bold">NEW</span>
                    </div>
                  ))}
                </div>
             )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 transition shadow-sm"
              disabled={loading}
            >
              {loading ? "Processing..." : isEditMode ? "Save Changes" : "Submit Incident"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
