import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import citizenApi, { NotificationItem } from "../../api/citizenApi";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  Bell,
  CheckCheck,
  RefreshCw,
  Inbox,
  AlertTriangle,
  UserCheck,
  Briefcase,
  ExternalLink,
} from "lucide-react";

export const CitizenNotificationsPage: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await citizenApi.getNotifications();
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    } catch {
      toast.error("Failed to load notifications feed.", "Error");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      await citizenApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read.", "Done");
    } catch {
      toast.error("Failed to mark all notifications as read.", "Error");
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

  const getNotificationIcon = (type: string, isRead: boolean) => {
    switch (type) {
      case "SLA_BREACH_WARNING":
      case "ESCALATION_TRIGGERED":
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case "OFFICER_ASSIGNED":
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      case "SERVICE_APPLICATION_UPDATE":
        return <Briefcase className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className={`w-4 h-4 ${!isRead ? "text-blue-600" : "text-slate-400"}`} />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Notification Command Center
            </h1>
            {unreadCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Real-time status milestones, field officer assignments, and statutory SLA alerts
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
            Refresh Feed
          </Button>

          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAllRead}
              isLoading={isMarkingAll}
              leftIcon={<CheckCheck className="w-4 h-4 text-blue-700" />}
            >
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-medium w-fit">
        {[
          { id: "ALL", label: `All (${notifications.length})` },
          { id: "UNREAD", label: `Unread (${unreadCount})` },
          { id: "GRIEVANCE_STATUS_UPDATE", label: "Grievances" },
          { id: "OFFICER_ASSIGNED", label: "Officer Assignments" },
          { id: "SLA_BREACH_WARNING", label: "SLA Alerts" },
          { id: "SERVICE_APPLICATION_UPDATE", label: "Public Services" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl transition font-bold ${
              activeFilter === tab.id
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Notifications List */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0 divide-y divide-slate-100">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Retrieving notification records...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Inbox className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-700">No notifications in this filter</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Whenever your grievance is triaged, assigned, escalated, or resolved, instant updates will appear here.
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-5 flex items-start justify-between gap-4 transition cursor-pointer hover:bg-slate-50/80 ${
                  !n.isRead ? "bg-blue-50/40" : "bg-white"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      !n.isRead
                        ? "bg-blue-100/70 border border-blue-200 shadow-sm"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {getNotificationIcon(n.type, n.isRead)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono block pt-1">
                      {new Date(n.createdAt).toLocaleDateString()} at{" "}
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {n.linkUrl && (
                    <span className="text-blue-700 text-xs font-bold flex items-center gap-1 hover:underline">
                      <span>View</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CitizenNotificationsPage;
