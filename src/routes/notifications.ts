import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator"; 
import { eq, and } from "drizzle-orm";
import {
  broadcastSchema,
  registerTokenSchema,
  sendNotificationSchema,
} from "../zod/notifications.js";
import { fcmTokens } from "../db/schema/notifications.js";
import { db } from "../db/db.js";
import { adminMessaging } from "../config/firebase.js";

const notifications = new Hono();

notifications.post(
  "/register",
  zValidator("json", registerTokenSchema),
  async (c) => {
    const { userId, token } = c.req.valid("json");

    const existing = await db.query.fcmTokens.findFirst({
      where: eq(fcmTokens.token, token),
    });

    if (existing) {
      await db
        .update(fcmTokens)
        .set({ isActive: true, updatedAt: new Date() })
        .where(eq(fcmTokens.token, token));
    } else {
      await db.insert(fcmTokens).values({ userId, token, isActive: true });
    }

    return c.json({ success: true, message: "Token registered" }, 201);
  },
);

notifications.delete(
  "/unregister",
  zValidator("json", registerTokenSchema),
  async (c) => {
    const { token } = c.req.valid("json");

    await db
      .update(fcmTokens)
      .set({ isActive: false })
      .where(eq(fcmTokens.token, token));

    return c.json({ success: true, message: "Token unregistered" });
  },
);

notifications.post(
  "/send",
  zValidator("json", sendNotificationSchema),
  async (c) => {
    const { token, title, body, icon } = c.req.valid("json");

    const messageId = await adminMessaging.send({
      token,
      notification: { title, body, imageUrl: icon },
    });

    return c.json({ success: true, messageId });
  },
);

notifications.post(
  "/broadcast",
  zValidator("json", broadcastSchema),
  async (c) => {
    const { title, body, userId } = c.req.valid("json");

    const filters = userId
      ? and(eq(fcmTokens.isActive, true), eq(fcmTokens.userId, userId))
      : eq(fcmTokens.isActive, true);

    const rows = await db.query.fcmTokens.findMany({ where: filters });
    const tokens = rows.map((r) => r.token);

    if (!tokens.length) {
      return c.json({ success: false, error: "No active tokens found" }, 404);
    }

    const result = await adminMessaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
    });

    const invalidTokens = result.responses
      .map((r, i) => (!r.success ? tokens[i] : null))
      .filter(Boolean) as string[];

    if (invalidTokens.length) {
      await Promise.all(
        invalidTokens.map((t) =>
          db
            .update(fcmTokens)
            .set({ isActive: false })
            .where(eq(fcmTokens.token, t)),
        ),
      );
    }

    return c.json({
      success: true,
      successCount: result.successCount,
      failureCount: result.failureCount,
    });
  },
);

export default notifications;