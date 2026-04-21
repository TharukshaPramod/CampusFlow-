import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  unreadNotificationCount,
} from "../../../services/api/notifications";
import type { Notification } from "../../../types/notification";

const parseDate = (value?: string) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const relative = (value?: string) => {
  const d = parseDate(value);
  if (!d) return "";
  const diffMinutes = Math.max(1, Math.round((Date.now() - d.getTime()) / 60000));
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

export const NotificationBell = () => {
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refreshUnread = async () => {
    try {
      const count = await unreadNotificationCount();
      setUnreadCount(count);
    } catch {
      // noop
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await listNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUnread();
    const id = window.setInterval(refreshUnread, 20000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onToggle = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      await loadNotifications();
    }
  };

  const onOpenNotification = async (item: Notification) => {
    try {
      if (!item.read) {
        await markNotificationRead(item.id);
      }
      setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - (item.read ? 0 : 1)));
    } finally {
      setOpen(false);
      navigate(item.actionUrl || "/notifications");
    }
  };

  const onMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={onToggle}
        className="relative p-2 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-[10px] leading-4 text-white font-bold text-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <p className="text-sm font-semibold text-slate-800">Notifications</p>
            <button onClick={onMarkAllRead} className="text-xs text-primary hover:underline">
              Mark all as read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && <p className="px-4 py-4 text-sm text-slate-500">Loading...</p>}
            {!loading && notifications.length === 0 && (
              <p className="px-4 py-4 text-sm text-slate-500">No notifications yet.</p>
            )}
            {!loading && notifications.map((item) => (
              <button
                key={item.id}
                onClick={() => onOpenNotification(item)}
                className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition ${
                  item.read ? "bg-white" : "bg-blue-50/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  {!item.read && <span className="mt-1 w-2 h-2 rounded-full bg-blue-500" />}
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                <p className="mt-1 text-xs text-slate-400">{relative(item.createdAt)}</p>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setOpen(false);
              navigate("/notifications");
            }}
            className="w-full px-4 py-2.5 text-sm text-primary hover:bg-slate-50 border-t border-slate-200"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};
