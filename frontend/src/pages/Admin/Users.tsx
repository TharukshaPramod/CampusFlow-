import { useEffect, useMemo, useState } from "react";
import { deleteUser, inviteAdmin, listUsers, updateUser } from "../../services/api/users";
import toast from "react-hot-toast";

type UserRoleFilter = "ALL" | "ADMIN" | "USER" | "TECHNICIAN";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  roles: string;
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

const getPrimaryRole = (roles: string) => {
  const roleSet = roles
    .split(",")
    .map((r) => r.trim().toUpperCase())
    .filter(Boolean);

  if (roleSet.includes("ADMIN")) return "ADMIN";
  if (roleSet.includes("TECHNICIAN")) return "TECHNICIAN";
  return "USER";
};

const roleBadgeClass = (role: string) => {
  if (role === "ADMIN") return "bg-slate-700/20 text-slate-700";
  if (role === "TECHNICIAN") return "bg-amber-500/20 text-amber-300";
  return "bg-slate-500/20 text-slate-700";
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
    <section className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {roleTabs.map((tab) => {
            const selected = activeRole === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveRole(tab.key)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  selected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-300 bg-slate-100 text-slate-600 hover:border-slate-400 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          + Admin Invitation
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-400">
              <tr className="border-b border-slate-200">
                <th className="px-4 py-4 font-semibold">User</th>
                <th className="px-4 py-4 font-semibold">Email</th>
                <th className="px-4 py-4 font-semibold">Role</th>
                <th className="px-4 py-4 font-semibold">Status</th>
                <th className="px-4 py-4 font-semibold">Last Login</th>
                <th className="px-4 py-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-300">
                    Loading users...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-red-300">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-300">
                    No users found for this filter.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                filteredUsers.map((user) => {
                  const role = getPrimaryRole(user.roles || "USER");
                  return (
                    <tr key={user.id} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-100/70">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
                            {initials(user.name || "User")}
                          </div>
                          <span className="font-semibold text-slate-900">{user.name || "Unknown User"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">{user.email}</td>
                      <td className="px-4 py-3.5">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadgeClass(role)}`}>
                          {role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            user.active ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-600/40 text-slate-300"
                          }`}
                        >
                          {user.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{formatLastLogin(user.lastLogin)}</td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          className="rounded-lg border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-200"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Edit User</h3>
                <p className="mt-1 text-sm text-slate-500">Update user details or remove this account.</p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                x
              </button>
            </div>

            <div className="space-y-4">
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

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving || deleting}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete User"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving || deleting}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || deleting}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Admin Invitation</h3>
                <p className="mt-1 text-sm text-slate-500">Enter admin name and gmail address to send invitation.</p>
              </div>
              <button
                type="button"
                onClick={closeInviteModal}
                className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                x
              </button>
            </div>

            <div className="space-y-4">
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

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeInviteModal}
                disabled={inviteLoading}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendInvite}
                disabled={inviteLoading}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {inviteLoading ? "Sending..." : "Send Invitation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Users;
