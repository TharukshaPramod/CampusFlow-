import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listNotifications, markNotificationRead } from "../../services/api/notifications";
import type { Notification } from "../../types/notification";

const relative = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const minutes = Math.max(1, Math.round((Date.now() - d.getTime()) / 60000));
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

function Notifications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Notification[]>([]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await listNotifications();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openNotification = async (item: Notification) => {
    if (!item.read) {
      await markNotificationRead(item.id);
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
    }
    navigate(item.actionUrl || "/");
  };

  return (
    <section className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Notifications</h1>
        <p className="text-slate-600">Updates about bookings and support tickets.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading && <p className="p-4 text-sm text-slate-500">Loading notifications...</p>}
        {!loading && items.length === 0 && (
          <p className="p-4 text-sm text-slate-500">No notifications available.</p>
        )}

        {!loading && items.map((item) => (
          <button
            key={item.id}
            onClick={() => openNotification(item)}
            className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 ${item.read ? "bg-white" : "bg-blue-50/40"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">{item.title}</p>
              {!item.read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1" />}
            </div>
            <p className="mt-1 text-sm text-slate-600">{item.message}</p>
            <p className="mt-1 text-xs text-slate-400">{relative(item.createdAt)}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

export default Notifications;
