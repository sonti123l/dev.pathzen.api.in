import {
  mysqlTable,
  int,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { users } from "./users.js";

export const otps = mysqlTable("otps", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  otp: varchar("otp", { length: 6 }).notNull(),
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  user_id: int('user_id').references(() => users.user_id, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
  }).notNull()
});
