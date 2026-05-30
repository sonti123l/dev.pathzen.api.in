import { z } from "zod";

export const registerTokenSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  token:  z.string().min(1, "token is required"),
});

export const sendNotificationSchema = z.object({
  token: z.string().min(1, "token is required"),
  title: z.string().min(1, "title is required"),
  body:  z.string().min(1, "body is required"),
  icon:  z.string().optional(),
});

export const broadcastSchema = z.object({
  title:  z.string().min(1, "title is required"),
  body:   z.string().min(1, "body is required"),
  userId: z.string().optional(), 
});

export type RegisterTokenInput    = z.infer<typeof registerTokenSchema>;
export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
export type BroadcastInput        = z.infer<typeof broadcastSchema>;