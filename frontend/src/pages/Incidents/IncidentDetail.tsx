import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Send, Camera, UserCircle2, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { incidentService } from "../../services/api/incidents";
import { getTechnicians } from "../../services/api/users";
import { useAuth } from "../../hooks/useAuth";
import { Incident, IncidentStatus, IncidentStatusUpdate } from "../../types/incident";
import { Download } from "lucide-react";

const statusColors: Record<IncidentStatus, string> = {
  [IncidentStatus.OPEN]: "bg-yellow-100 text-yellow-800",
  [IncidentStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800",
  [IncidentStatus.RESOLVED]: "bg-green-100 text-green-800",
  [IncidentStatus.CLOSED]: "bg-slate-100 text-slate-600",
  [IncidentStatus.REJECTED]: "bg-red-100 text-red-800",
};

export default function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const isAdmin = user?.roles?.some(r => r === "ADMIN" || r === "ROLE_ADMIN");
  
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [technicians, setTechnicians] = useState<{id: string, name: string}[]>([]);
  const [selectedTech, setSelectedTech] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [newComment, setNewComment] = useState("");
  const [workingStatus, setWorkingStatus] = useState<IncidentStatus | "">("");
  const [notes, setNotes] = useState("");

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");

  const fetchIncident = async () => {
    if (!id) return;
    try {
      const data = await incidentService.getIncidentById(id);
      setIncident(data);
    } catch {
      setError("Failed to load incident thread.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTechs = async () => {
    if (!isAdmin) return;
    try {
      const techs = await getTechnicians();
      setTechnicians(techs);
    } catch {
      console.error("Failed to load technicians");
    }
  };

  useEffect(() => {
    fetchIncident();
    fetchTechs();
  }, [id, isAdmin]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;
    try {
      await incidentService.addComment(id, { content: newComment });
      setNewComment("");
      fetchIncident();
    } catch {
      alert("Failed to post comment.");
    }
  };

  const handleStatusUpdate = async () => {
    if (!id || !workingStatus) return;
    try {
      const updatePayload: IncidentStatusUpdate = { status: workingStatus as IncidentStatus };
      if (workingStatus === IncidentStatus.REJECTED) {
         updatePayload.rejectionReason = notes;
      } else if (workingStatus === IncidentStatus.RESOLVED || workingStatus === IncidentStatus.CLOSED) {
         updatePayload.resolutionNotes = notes;
      }
      
      await incidentService.updateStatus(id, updatePayload);
      setWorkingStatus("");
      setNotes("");
      fetchIncident();
    } catch {
      alert("Failed to update status.");
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editingCommentContent.trim()) return;
    try {
      await incidentService.editComment(commentId, { content: editingCommentContent });
      setEditingCommentId(null);
      setEditingCommentContent("");
      fetchIncident();
    } catch {
      alert("Failed to update comment.");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await incidentService.deleteComment(commentId);
      fetchIncident();
    } catch {
      alert("Failed to delete comment.");
    }
  };

  const handleDeleteIncident = async () => {
    if (!id || !window.confirm("Permanently delete this incident ticket?")) return;
    try {
      await incidentService.deleteIncident(id);
      window.location.href = "/incidents"; // Navigate back 
    } catch {
      alert("Failed to delete incident.");
    }
  };

  const handleAssignTechnician = async () => {
    if (!id || !selectedTech) return;
    try {
      await incidentService.assignTechnician(id, selectedTech);
      setSelectedTech("");
      fetchIncident();
    } catch {
      alert("Failed to assign technician.");
    }
  };

  const handleDownloadPdf = async () => {
    if (!id) return;
    try {
      setIsDownloading(true);
      await incidentService.downloadPdfReport(id);
    } catch {
      alert("Failed to download PDF report.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading incident data...</div>;
  if (error || !incident) return <div className="p-12 text-center text-red-500">{error || "Not found"}</div>;

  const isTechnicianAssigned = !!incident.technicianId;
  const iAmTechnician = incident.technicianId === user?.id;
  const isCreator = incident.creatorId === user?.id;

  return (
    <section className="max-w-6xl mx-auto pb-12 flex flex-col lg:flex-row gap-6">
       
       {/* Main Thread Content */}
       <div className="flex-1 space-y-6">
          <Link to="/incidents" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition block mb-2">← Back to Dashboard</Link>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             
             {/* Header */}
             <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800">{incident.title}</h1>
                    <p className="text-sm font-mono text-slate-500 mt-1">{incident.ticketNumber} • {new Date(incident.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleDownloadPdf} 
                      disabled={isDownloading}
                      className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition disabled:opacity-50"
                    >
                      <Download size={16} /> {isDownloading ? "Generating..." : "Report"}
                    </button>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[incident.status]}`}>
                      {incident.status}
                    </span>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Priority</p>
                    <p className="font-medium text-slate-800 mt-1">{incident.priority}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Category</p>
                    <p className="font-medium text-slate-800 mt-1">{incident.category}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Creator</p>
                    <p className="font-medium text-slate-800 mt-1 line-clamp-1">{incident.creatorName}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Target Resource</p>
                    <p className="font-medium text-slate-800 mt-1 line-clamp-1">{incident.resourceName || incident.location || "General"}</p>
                  </div>
               </div>
             </div>

             {/* Evidence & Details */}
             <div className="p-6 md:p-8">
               <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Origin Report</h3>
               <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  {incident.description}
               </div>

               {incident.attachments && incident.attachments.length > 0 && (
                 <div className="mt-8">
                   <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2"><Camera size={16} /> Attached Evidence</h3>
                   <div className="flex gap-4 overflow-x-auto pb-4 shrink-0">
                      {incident.attachments.map(att => (
                        <a key={att.id} href={att.fileUrl} target="_blank" rel="noreferrer" className="w-48 h-32 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 block shadow-sm hover:shadow-md transition bg-slate-50">
                           {imageErrors[att.id] ? (
                             <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center text-xs">
                                <Camera size={24} className="mb-2 opacity-30" />
                                <span className="font-medium">Image Not Public</span>
                                <span className="text-[10px] mt-1 opacity-70 px-2 line-clamp-2">Ensure Supabase bucket is set to Public</span>
                             </div>
                           ) : (
                             <img 
                               src={att.fileUrl} 
                               className="w-full h-full object-cover" 
                               alt="Evidence" 
                               onError={() => setImageErrors(prev => ({...prev, [att.id]: true}))} 
                             />
                           )}
                        </a>
                      ))}
                   </div>
                 </div>
               )}

               {incident.resolutionNotes && (
                 <div className="mt-8 bg-green-50 rounded-2xl border border-green-200 p-5">
                    <h3 className="text-sm font-bold text-green-800 uppercase tracking-wider mb-2 flex items-center gap-2"><CheckCircle2 size={16} /> Resolution Information</h3>
                    <p className="text-green-900 text-sm">{incident.resolutionNotes}</p>
                 </div>
               )}

               {incident.rejectionReason && (
                 <div className="mt-8 bg-red-50 rounded-2xl border border-red-200 p-5">
                    <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-2 flex items-center gap-2"><XCircle size={16} /> Rejection Reason</h3>
                    <p className="text-red-900 text-sm">{incident.rejectionReason}</p>
                 </div>
               )}
             </div>
          </div>

          {/* Comment Thread */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-100 bg-slate-50/50">
               <h3 className="font-bold text-slate-800 text-lg">Activity & Updates</h3>
             </div>
             
             <div className="p-6 space-y-6">
                {incident.comments && incident.comments.length === 0 ? (
                  <p className="text-slate-500 text-center text-sm py-4">No comments or updates yet.</p>
                ) : (
                  incident.comments.map(comment => (
                     <div key={comment.id} className={`flex gap-4 ${comment.authorId === user?.id ? 'flex-row-reverse' : ''}`}>
                       <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-600 font-bold">
                         {comment.authorName ? comment.authorName.substring(0, 2).toUpperCase() : '?'}
                       </div>
                       <div className={`flex flex-col max-w-[80%] ${comment.authorId === user?.id ? 'items-end' : 'items-start'}`}>
                         <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                           <span>{comment.authorName}</span>
                           {comment.authorId === incident.creatorId && <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">★ Creator</span>}
                           {comment.authorId !== incident.creatorId && comment.authorId === incident.technicianId && <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">🛠️ Tech</span>}
                           {comment.authorId !== incident.creatorId && comment.authorId !== incident.technicianId && <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">🛡️ Admin</span>}
                           <span>•</span>
                           <span>{new Date(comment.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                           {comment.updatedAt && comment.updatedAt !== comment.createdAt && <span className="italic opacity-80">(edited)</span>}
                         </div>
                         
                         {editingCommentId === comment.id ? (
                            <div className="flex flex-col gap-2 w-full min-w-[250px]">
                              <textarea
                                value={editingCommentContent}
                                onChange={e => setEditingCommentContent(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition resize-y"
                              />
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setEditingCommentId(null)} className="text-xs font-bold text-slate-500 hover:text-slate-700 px-2 py-1">Cancel</button>
                                <button onClick={() => handleEditComment(comment.id)} className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md">Save</button>
                              </div>
                            </div>
                         ) : (
                            <div className={`p-4 rounded-2xl text-sm relative group ${comment.authorId === user?.id ? 'bg-primary text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                              <div className="whitespace-pre-wrap">{comment.content}</div>
                              {comment.authorId === user?.id && (
                                <div className="absolute top-2 -left-16 opacity-0 group-hover:opacity-100 transition flex gap-1 bg-white shadow-sm border border-slate-200 rounded-md p-1">
                                  <button onClick={() => { setEditingCommentId(comment.id); setEditingCommentContent(comment.content); }} className="text-slate-400 hover:text-blue-500 p-1" title="Edit">✏️</button>
                                  <button onClick={() => handleDeleteComment(comment.id)} className="text-slate-400 hover:text-red-500 p-1" title="Delete">🗑️</button>
                                </div>
                              )}
                            </div>
                         )}
                       </div>
                     </div>
                  ))
                )}
             </div>

             <div className="p-6 bg-slate-50 border-t border-slate-100">
                <form onSubmit={handlePostComment} className="flex gap-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Type an update or comment..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
                  />
                  <button type="submit" disabled={!newComment.trim()} className="bg-primary text-white p-3 rounded-xl hover:bg-primary-dark transition disabled:opacity-50">
                    <Send size={20} className="-ml-0.5" />
                  </button>
                </form>
             </div>
          </div>
       </div>

       {/* Sidebar (Admin & Tech Controls) */}
       <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
             <ShieldCheck size={120} className="absolute -right-8 -top-8 text-slate-50 opacity-10 pointer-events-none" />
             <h3 className="font-bold text-slate-800 text-lg mb-4">Support Team</h3>
             
             {isTechnicianAssigned ? (
               <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 p-4 rounded-xl">
                 <UserCircle2 size={32} className="text-blue-500" strokeWidth={1.5} />
                 <div>
                   <p className="text-xs text-blue-500 font-bold uppercase tracking-wider">Assigned Tech</p>
                   <p className="text-sm font-semibold text-blue-900 line-clamp-1">{incident.technicianName}</p>
                 </div>
               </div>
             ) : (
               <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                 <p className="text-sm text-slate-600 mb-3">No technician assigned yet.</p>
                 {isAdmin && (
                   <div className="flex flex-col gap-2">
                     <select 
                       value={selectedTech}
                       onChange={(e) => setSelectedTech(e.target.value)}
                       className="w-full text-sm border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-primary/20"
                     >
                       <option value="">-- Select Technician --</option>
                       {technicians.map(t => (
                         <option key={t.id} value={t.id}>{t.name}</option>
                       ))}
                     </select>
                     <button 
                       onClick={handleAssignTechnician} 
                       disabled={!selectedTech}
                       className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 disabled:text-slate-500 text-white w-full py-2 rounded-lg text-sm font-semibold transition"
                     >
                       Assign Selected
                     </button>
                   </div>
                 )}
               </div>
             )}
          </div>

          {(isAdmin || iAmTechnician) && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 text-lg mb-4">Manage Status</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Update Stage</label>
                  <select
                    value={workingStatus}
                    onChange={(e) => setWorkingStatus(e.target.value as IncidentStatus)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
                  >
                    <option value="">-- No Change --</option>
                    <option value={IncidentStatus.IN_PROGRESS}>In Progress</option>
                    <option value={IncidentStatus.RESOLVED}>Resolved</option>
                    <option value={IncidentStatus.CLOSED}>Closed</option>
                    <option value={IncidentStatus.REJECTED}>Rejected</option>
                  </select>
                </div>

                {(workingStatus === IncidentStatus.REJECTED || workingStatus === IncidentStatus.RESOLVED || workingStatus === IncidentStatus.CLOSED) && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                       {workingStatus === IncidentStatus.REJECTED ? "Rejection Reason *" : "Resolution Notes *"}
                    </label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-primary/20 outline-none transition resize-y"
                      placeholder="Required justification..."
                    />
                  </div>
                )}

                {workingStatus !== "" && (
                  <button 
                    onClick={handleStatusUpdate}
                    disabled={
                      (workingStatus === IncidentStatus.REJECTED && !notes.trim()) ||
                      ((workingStatus === IncidentStatus.RESOLVED || workingStatus === IncidentStatus.CLOSED) && !notes.trim())
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-2.5 rounded-xl transition"
                  >
                    Apply Status
                  </button>
                )}
              </div>
            </div>
          )}

          {(isAdmin || isCreator) && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
               <h3 className="font-bold text-slate-800 text-lg mb-4">Ticket Management</h3>
               <div className="flex gap-2">
                 <Link to={`/incidents/${id}/edit`} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition text-center text-sm">
                   Edit Ticket
                 </Link>
                 <button onClick={handleDeleteIncident} className="flex-1 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 font-bold py-2.5 rounded-xl transition text-sm">
                   Delete Ticket
                 </button>
               </div>
            </div>
          )}
       </div>

    </section>
  );
}
