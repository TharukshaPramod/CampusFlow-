import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound, LogOut, Mail, PencilLine, Save, Shield, UserRound, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api/client";

type StoredProfile = {
  staffId?: string;
};

const roleStyles: Record<string, string> = {
  ADMIN: "border-rose-200 bg-rose-50 text-rose-700",
  TECHNICIAN: "border-amber-200 bg-amber-50 text-amber-700",
  USER: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const getStorageKey = (userId: string) => `profile-hero:${userId}`;

const formatMemberSince = (token: string | null) => {
  if (!token) return "Not available";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.iat) return "Not available";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(new Date(payload.iat * 1000));
  } catch {
    return "Not available";
  }
};

const getPrimaryRole = (roles: string[]) => {
  if (roles.includes("ADMIN")) return "ADMIN";
  if (roles.includes("TECHNICIAN")) return "TECHNICIAN";
  if (roles.includes("USER")) return "USER";
  return roles[0] || "USER";
};

function Profile() {
  const navigate = useNavigate();
  const { user, token, logout, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState(user?.name || "");
  const [staffId, setStaffId] = useState("");

  useEffect(() => {
    if (!user) return;

    setFullName(user.name || "");

    const storedRaw = localStorage.getItem(getStorageKey(user.id));
    if (!storedRaw) return;

    try {
      const stored: StoredProfile = JSON.parse(storedRaw);
      if (stored.staffId) setStaffId(stored.staffId);
    } catch {
      localStorage.removeItem(getStorageKey(user.id));
    }
  }, [user]);

  const primaryRole = getPrimaryRole(user?.roles || []);
  const rolePillClasses = roleStyles[primaryRole] || "border-slate-200 bg-slate-100 text-slate-700";
  const memberSince = useMemo(() => formatMemberSince(token), [token]);

  const displayName = fullName.trim() || user?.name || "CampusFlow User";
  const displayEmail = user?.email || "No email available";
  const picture = user?.picture || "";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CF";

  const saveProfile = async () => {
    if (!user) return;

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      toast.error("Full name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.patch("/users/me", { name: trimmedName });

      updateUser({
        name: res.data?.name || trimmedName,
      });

      localStorage.setItem(
        getStorageKey(user.id),
        JSON.stringify({
          staffId: staffId.trim(),
        } satisfies StoredProfile)
      );

      setIsEditing(false);
      toast.success("Profile details updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    if (!user) return;
    const storedRaw = localStorage.getItem(getStorageKey(user.id));
    if (storedRaw) {
      try {
        const stored: StoredProfile = JSON.parse(storedRaw);
        setFullName(user.name || "");
        setStaffId(stored.staffId || "");
      } catch {
        setFullName(user.name || "");
        setStaffId("");
      }
    } else {
      setFullName(user.name || "");
      setStaffId("");
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <section className="relative min-h-[calc(100vh-4.25rem)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" />
        <div className="relative mx-auto w-full max-w-6xl rounded-3xl border border-slate-200 bg-white/95 p-6 text-slate-700 shadow-2xl">
          Your profile is not available right now.
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[calc(100vh-4.25rem)] px-3 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
      </div>
      <div className="absolute inset-0 bg-slate-900/12 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-2xl"
      >
        <div className="h-24 bg-gradient-to-r from-primary/15 via-accent/15 to-primary-dark/15" />

        <div className="-mt-10 px-5 pb-7 sm:px-8 sm:pb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md">
                {picture ? (
                  <img src={picture} alt="Profile avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-slate-600">
                    {initials}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {isEditing ? (
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xl font-bold text-slate-900 outline-none ring-primary/20 focus:border-primary focus:ring-2 sm:w-80"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-slate-900">{displayName}</h1>
                )}

                <p className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {displayEmail}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${rolePillClasses}`}
                  >
                    <Shield className="mr-1 h-3.5 w-3.5" />
                    {primaryRole}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                    Member since {memberSince}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[220px]">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
                >
                  <PencilLine className="mr-2 h-4 w-4" />
                  Edit profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveProfile}
                    disabled={isSaving}
                    className="inline-flex flex-1 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="inline-flex items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Reset password
              </button>

              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Staff ID
              </label>
              <input
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                disabled={!isEditing}
                placeholder="Enter staff ID"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-primary/20 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 focus:border-primary focus:ring-2"
              />
            </div>

            <div>
              <p className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Account ID</p>
              <p className="inline-flex h-10 w-full items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700">
                <UserRound className="mr-2 h-4 w-4 text-slate-400" />
                {user.id}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default Profile;
