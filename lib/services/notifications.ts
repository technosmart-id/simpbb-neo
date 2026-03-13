import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { sseEmitter } from "@/lib/sse";

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

  // 2. Trigger SSE Update
  try {
    sseEmitter.emit("notification", {
      userId: data.userId,
      id,
      title: data.title,
      message: data.message,
      type: notification.type,
      link: data.link,
      createdAt: notification.createdAt,
    });
  } catch (error) {
    console.error("Failed to emit SSE notification:", error);
  }

  return notification;
};
