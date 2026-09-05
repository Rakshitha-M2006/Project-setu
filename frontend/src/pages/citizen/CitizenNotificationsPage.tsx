import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import citizenApi, { NotificationItem } from "../../api/citizenApi";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  Bell,
  CheckCheck,
  RefreshCw,
  Inbox,
} from "lucide-react";

export const CitizenNotificationsPage: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await citizenApi.getNotifications();
      if (response.success && response.data) {
        const list = Array.isArray(response.data)
          ? response.data
          : (response.data as any).notifications || [];
        setNotifications(list);
      }
    } catch {
      toast.error(t("errors.serverError") || "Failed to load notifications feed.", "Error");
    } finally {
      setIsLoading(false);
    }
  }, [toast, t]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      await citizenApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success(t("common.success") || "All notifications marked as read.", "Done");
    } catch {
      toast.error(t("errors.serverError") || "Failed to mark all notifications as read.", "Error");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleNotificationClick = async (n: NotificationItem) => {
    if (!n.isRead) {
      try {
        await citizenApi.markNotificationRead(n.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
        );
      } catch {
        // Silently continue
      }
    }

    if (n.linkUrl) {
      navigate(n.linkUrl);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeFilter === "ALL") return true;
      if (activeFilter === "UNREAD") return !n.isRead;
      return n.type === activeFilter;
    });
  }, [notifications, activeFilter]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {t("notifications.title") || "Notification Command Center"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t("notifications.subtitle") || "Real-time status milestones, officer assignments, and statutory SLA alerts"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadNotifications}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            {t("notifications.refresh") || "Refresh Feed"}
          </Button>

          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAllRead}
              isLoading={isMarkingAll}
              leftIcon={<CheckCheck className="w-4 h-4 text-emerald-600" />}
            >
              {t("notifications.markAllRead") || "Mark All as Read"}
            </Button>
          )}
        </div>
      </div>

      {/* 2. Notification Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-2">
          {[
            { id: "ALL", label: t("notifications.all") || "All" },
            { id: "UNREAD", label: t("notifications.unread") || "Unread" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeFilter === tab.id
                  ? "bg-blue-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label} {tab.id === "UNREAD" && unreadCount > 0 && `(${unreadCount})`}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* 3. Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            {t("common.loading") || "Loading notifications..."}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700">{t("notifications.noNotifications") || "No notifications found"}</p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-4 ${
                !n.isRead
                  ? "bg-blue-50/40 border-blue-200 shadow-sm"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CitizenNotificationsPage;
