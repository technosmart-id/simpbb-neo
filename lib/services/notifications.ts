import { db } from "@/lib/db";
import { notifications, notificationPreferences } from "@/lib/db/schema";
import { sseEmitter } from "@/lib/sse";
import { eq } from "drizzle-orm";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}

export const createNotification = async (data: CreateNotificationData) => {
  const id = crypto.randomUUID();
  const notification = {
    id,
    userId: data.userId,
    title: data.title,
    message: data.message,
    type: data.type ?? "info",
    link: data.link,
    isRead: false,
    createdAt: new Date(),
  };

  // 1. Save to DB
  await db.insert(notifications).values(notification);

  // 2. Filter & Trigger SSE Update based on Preferences
  try {
    const [prefs] = await db.select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, data.userId));

    // Default to enabled if no prefs exist yet
    const canEmit = !prefs || (
      prefs.inAppEnabled && 
      (notification.type === "success" ? prefs.successEnabled :
       notification.type === "warning" ? prefs.warningEnabled :
       notification.type === "error" ? prefs.errorEnabled :
       prefs.infoEnabled)
    );

    if (canEmit) {
      sseEmitter.emit("notification", {
        userId: data.userId,
        id,
        title: data.title,
        message: data.message,
        type: notification.type,
        link: data.link,
        createdAt: notification.createdAt,
        suppressToast: prefs ? !prefs.toastsEnabled : false,
      });
    }
  } catch (error) {
    console.error("Failed to emit SSE notification:", error);
  }

  return notification;
};
