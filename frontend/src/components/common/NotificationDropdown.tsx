import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import citizenApi, { NotificationItem } from "../../api/citizenApi";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  Bell,
  CheckCheck,
  ExternalLink,
  AlertTriangle,
  UserCheck,
  Briefcase,
  Inbox,
} from "lucide-react";

export const NotificationDropdown: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const toast = useToast();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await citizenApi.getNotifications({ limit: 6 });
      if (res.success && res.data) {
        if (Array.isArray(res.data)) {
          setNotifications(res.data);
          setUnreadCount(res.data.filter((n) => !n.isRead).length);
        } else {
          const payload = res.data as any;
          setNotifications(payload.notifications || []);
          setUnreadCount(
            payload.unreadCount !== undefined
              ? payload.unreadCount
              : (payload.notifications || []).filter((n: any) => !n.isRead).length
          );
        }
      }
    } catch {
      // Quiet background failure
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await citizenApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success(t("notifications.markAllRead"), t("common.done"));
    } catch {
      toast.error(t("errors.serverError"), t("common.error"));
    }
  };

  const handleItemClick = async (n: NotificationItem) => {
    if (!n.isRead) {
      try {
        await citizenApi.markNotificationRead(n.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // Silently continue
      }
    }
    setIsOpen(false);
    if (n.linkUrl) {
      navigate(n.linkUrl);
    }
  };

  const getNotificationIcon = (type: string, isRead: boolean) => {
    switch (type) {
      case "SLA_BREACH_WARNING":
      case "ESCALATION_TRIGGERED":
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
      case "OFFICER_ASSIGNED":
        return <UserCheck className="w-3.5 h-3.5 text-blue-600" />;
      case "SERVICE_APPLICATION_UPDATE":
        return <Briefcase className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Bell className={`w-3.5 h-3.5 ${!isRead ? "text-blue-600" : "text-slate-400"}`} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 transition relative focus:outline-none focus:ring-2 focus:ring-blue-500"
        title={t("common.notifications")}
        aria-label={t("common.notifications")}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white font-black text-[10px] rounded-full flex items-center justify-center ring-2 ring-white shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white shadow-2xl border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-wider">{t("common.notifications")}</span>
              {unreadCount > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} {t("notifications.unread")}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] text-slate-300 hover:text-white font-semibold flex items-center gap-1 transition"
              >
                <CheckCheck className="w-3 h-3 text-emerald-400" />
                <span>{t("notifications.markAllRead")}</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">{t("notifications.noNotifications")}</p>
                <p className="text-[11px] text-slate-400">{t("notifications.noNotificationsDesc")}</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-3.5 flex items-start gap-3 transition cursor-pointer hover:bg-slate-50 ${
                    !n.isRead ? "bg-blue-50/50" : "bg-white"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      !n.isRead ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {getNotificationIcon(n.type, n.isRead)}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-400 block pt-0.5">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <Link
              to="/citizen/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center justify-center gap-1 py-1"
            >
              <span>{t("navigation.notifications")}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
