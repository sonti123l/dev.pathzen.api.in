import {
  mysqlTable,
  varchar,
  int,
  timestamp,
  boolean,
} from "drizzle-orm/mysql-core";

export const fcmTokens = mysqlTable("fcm_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  token: varchar("token", { length: 512 }).notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type FcmToken = typeof fcmTokens.$inferSelect;
export type NewFcmToken = typeof fcmTokens.$inferInsert;
