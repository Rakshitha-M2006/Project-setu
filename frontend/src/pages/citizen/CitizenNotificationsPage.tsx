import React, { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
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

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await citizenApi.getNotifications();
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    } catch (err: any) {
      toast.error("Failed to load notifications.", "Error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      await citizenApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read.", "Done");
    } catch (err: any) {
      toast.error("Failed to mark all notifications as read.", "Error");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await citizenApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // Silently ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Notification Center
            </h1>
            {unreadCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Real-time SMS & system alerts regarding your grievance status and service applications
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
            Refresh
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

      {/* 2. Notifications List */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0 divide-y divide-slate-100">
          {isLoading ? (
            <p className="text-xs text-slate-400 text-center py-16">
              Loading notification feed...
            </p>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Inbox className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-700">No notifications yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Whenever your grievance is assigned, escalated, or resolved, instant notifications will appear here.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkRead(n.id)}
                className={`p-5 flex items-start justify-between gap-4 transition cursor-pointer hover:bg-slate-50/80 ${
                  !n.isRead ? "bg-blue-50/40" : "bg-white"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      !n.isRead
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Bell className="w-4 h-4" />
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

                {!n.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkRead(n.id);
                    }}
                    className="shrink-0 text-[11px] font-semibold text-blue-700 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-100/50 transition"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CitizenNotificationsPage;
