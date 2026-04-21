import { useEffect, useMemo, useState } from "react";
import { deleteUser, inviteAdmin, listUsers, updateUser } from "../../services/api/users";
import { motion, AnimatePresence } from "framer-motion";
import { Users as UsersIcon, Plus, X } from "lucide-react";
import toast from "react-hot-toast";

type UserRoleFilter = "ALL" | "ADMIN" | "USER" | "TECHNICIAN";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  roles: string | any[];
  active: boolean;
  lastLogin?: string | number | null;
};

const roleTabs: Array<{ key: UserRoleFilter; label: string }> = [
  { key: "ALL", label: "All Users" },
  { key: "ADMIN", label: "Admins" },
  { key: "USER", label: "Users" },
  { key: "TECHNICIAN", label: "Technicians" },
];

const toEpochMs = (raw: number) => {
  const abs = Math.abs(raw);
  // seconds -> ms
  if (abs < 1e11) return raw * 1000;
  // ms
  if (abs < 1e14) return raw;
  // microseconds -> ms
  if (abs < 1e17) return raw / 1000;
  // nanoseconds -> ms
  return raw / 1_000_000;
};

const formatLastLogin = (value?: string | number | null) => {
  if (!value) return "Never";

  let date: Date;

  if (typeof value === "number") {
    date = new Date(toEpochMs(value));
  } else if (/^-?\d+(\.\d+)?$/.test(value)) {
    date = new Date(toEpochMs(Number(value)));
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) return "Never";
  if (date.getUTCFullYear() <= 1971) return "Never";

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60_000) return "Just now";

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "min" : "mins"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? "a month ago" : `${months} months ago`;

  const years = Math.floor(days / 365);
  return years === 1 ? "a year ago" : `${years} years ago`;
};

const getPrimaryRole = (roles: string | any[]) => {
  if (!roles) return "USER";

  const roleArray = Array.isArray(roles)
    ? roles.map((r) => (typeof r === "string" ? r : r?.name || ""))
    : typeof roles === "string"
    ? roles.split(",")
    : [];

  const roleSet = roleArray
    .map((r) => r.trim().toUpperCase())
    .filter(Boolean);

  if (roleSet.includes("ADMIN") || roleSet.includes("ROLE_ADMIN")) return "ADMIN";
  if (roleSet.includes("TECHNICIAN") || roleSet.includes("ROLE_TECHNICIAN")) return "TECHNICIAN";
  return "USER";
};

const roleBadgeClass = (role: string) => {
  if (role === "ADMIN") return "bg-slate-800 text-white";
  if (role === "TECHNICIAN") return "bg-amber-100 text-amber-800 border border-amber-200";
  return "bg-blue-50 text-blue-700 border border-blue-200";
};

const avatarGradient = (role: string) => {
  if (role === "ADMIN") return "from-slate-700 to-slate-800";
  if (role === "TECHNICIAN") return "from-amber-500 to-orange-500";
  return "from-blue-500 to-cyan-500";
};

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

function Users() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<UserRoleFilter>("ALL");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listUsers();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (activeRole === "ALL") return users;
    return users.filter((u) => getPrimaryRole(u.roles || "USER") === activeRole);
  }, [activeRole, users]);

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
    });
  };

  const closeEditModal = () => {
    if (saving || deleting) return;
    setEditingUser(null);
    setEditForm({ name: "", email: "", password: "" });
  };

  const handleSave = async () => {
    if (!editingUser) return;

    const name = editForm.name.trim();
    const email = editForm.email.trim().toLowerCase();
    const password = editForm.password.trim();

    if (!name) {
      toast.error("Name is required");
      return;
    }

    if (!email) {
      toast.error("Email is required");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateUser(editingUser.id, {
        name,
        email,
        ...(password ? { password } : {}),
      });

      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updated : u)));
      toast.success("User updated successfully");
      closeEditModal();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingUser) return;
    const confirmed = window.confirm(`Delete user ${editingUser.email}?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteUser(editingUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== editingUser.id));
      toast.success("User deleted successfully");
      closeEditModal();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const closeInviteModal = () => {
    if (inviteLoading) return;
    setInviteOpen(false);
    setInviteForm({ name: "", email: "" });
  };

  const handleSendInvite = async () => {
    const name = inviteForm.name.trim();
    const email = inviteForm.email.trim().toLowerCase();

    if (!name) {
      toast.error("Admin name is required");
      return;
    }

    if (!/^[A-Za-z\s]+$/.test(name)) {
      toast.error("Enter a valid name");
      return;
    }

    if (!/^[^\s@]+@gmail\.com$/i.test(email)) {
      toast.error("Enter a valid gmail address");
      return;
    }

    setInviteLoading(true);
    try {
      await inviteAdmin({ name, email });
      toast.success("Admin invitation sent");
      closeInviteModal();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send invitation");
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white shadow-lg shadow-slate-500/20">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
            <p className="text-slate-500 text-sm mt-0.5">{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found</p>
          </div>
        </div>
        <button type="button" onClick={() => setInviteOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all">
          <Plus className="w-4 h-4" /> Admin Invitation
        </button>
      </motion.div>

      {/* Role Tabs */}
      <div className="flex flex-wrap gap-2">
        {roleTabs.map((tab) => {
          const selected = activeRole === tab.key;
          return (
            <button key={tab.key} type="button" onClick={() => setActiveRole(tab.key)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                selected ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Login</th>
                <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-100" /><div className="h-4 bg-slate-100 rounded w-24" /></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-32" /></td>
                    <td className="px-5 py-4"><div className="h-5 bg-slate-100 rounded-full w-16" /></td>
                    <td className="px-5 py-4"><div className="h-5 bg-slate-100 rounded-full w-14" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-20" /></td>
                    <td className="px-5 py-4"><div className="h-7 bg-slate-100 rounded w-12" /></td>
                  </tr>
                ))
              )}

              {!loading && error && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-red-500">{error}</td></tr>
              )}

              {!loading && !error && filteredUsers.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No users found for this filter</td></tr>
              )}

              {!loading && !error &&
                filteredUsers.map((user) => {
                  const role = getPrimaryRole(user.roles || "USER");
                  return (
                    <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient(role)} text-xs font-bold text-white shadow-sm`}>
                            {initials(user.name || "User")}
                          </div>
                          <span className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{user.name || "Unknown User"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{user.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${roleBadgeClass(role)}`}>{role}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border w-fit ${user.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.active ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {user.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{formatLastLogin(user.lastLogin)}</td>
                      <td className="px-5 py-3.5">
                        <button type="button" onClick={() => openEditModal(user)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition">
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
      {editingUser && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ duration: 0.2 }}
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Edit User</h3>
                <p className="text-sm text-slate-300">Update details or remove account</p>
              </div>
              <button type="button" onClick={closeEditModal} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-primary/20 focus:border-primary focus:ring-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-primary/20 focus:border-primary focus:ring-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Leave blank to keep current password"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-primary/20 focus:border-primary focus:ring-2"
                />
              </div>
            </div>

            <div className="px-6 pb-6 mt-2 flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={handleDelete} disabled={saving || deleting}
                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 transition">
                {deleting ? "Deleting..." : "Delete User"}
              </button>
              <div className="flex items-center gap-2">
                <button type="button" onClick={closeEditModal} disabled={saving || deleting}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 transition">Cancel</button>
                <button type="button" onClick={handleSave} disabled={saving || deleting}
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-2 text-sm font-semibold text-white hover:from-blue-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm transition">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {inviteOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Admin Invitation</h3>
                <p className="text-sm text-slate-300">Send an invitation email</p>
              </div>
              <button type="button" onClick={closeInviteModal} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Admin Name</label>
                <input
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="John Admin"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-primary/20 focus:border-primary focus:ring-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Gmail Address</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="example@gmail.com"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-primary/20 focus:border-primary focus:ring-2"
                />
              </div>
            </div>

            <div className="px-6 pb-6 mt-2 flex items-center justify-end gap-2">
              <button type="button" onClick={closeInviteModal} disabled={inviteLoading}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 transition">Cancel</button>
              <button type="button" onClick={handleSendInvite} disabled={inviteLoading}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-2 text-sm font-semibold text-white hover:from-blue-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm transition">
                {inviteLoading ? "Sending..." : "Send Invitation"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </section>
  );
}

export default Users;
