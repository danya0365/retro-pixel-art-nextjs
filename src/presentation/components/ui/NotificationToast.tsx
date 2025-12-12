"use client";

import { useNotificationStore } from "@/src/presentation/stores/notificationStore";
import { useState } from "react";

const NOTIFICATION_ICONS = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
};

const NOTIFICATION_COLORS = {
  success: "bg-green-100 border-green-500 text-green-800",
  error: "bg-red-100 border-red-500 text-red-800",
  warning: "bg-yellow-100 border-yellow-500 text-yellow-800",
  info: "bg-blue-100 border-blue-500 text-blue-800",
};

export function NotificationToast() {
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore(
    (state) => state.removeNotification
  );

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          type={notification.type}
          message={notification.message}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

function NotificationItem({
  type,
  message,
  onClose,
}: {
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose: () => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 200);
  };

  return (
    <div
      className={`
        flex items-start gap-2 p-3 rounded-lg border-2 shadow-lg
        transition-all duration-200
        ${isExiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}
        ${NOTIFICATION_COLORS[type]}
      `}
    >
      <span className="text-lg flex-shrink-0">{NOTIFICATION_ICONS[type]}</span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={handleClose}
        className="text-gray-500 hover:text-gray-700 flex-shrink-0"
      >
        ✕
      </button>
    </div>
  );
}
