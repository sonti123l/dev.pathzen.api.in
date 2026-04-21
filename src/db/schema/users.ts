import {
  mysqlTable,
  int,
  timestamp,
  varchar,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const users = mysqlTable("users", {
  user_id: int("user_id").autoincrement().primaryKey(),
  refresh_token: varchar("refresh_token", { length: 400 }).unique(),
  user_email: varchar("user_email", { length: 255 }).unique().notNull(),
  user_password: varchar("user_password", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["STUDENT", "TEACHER", "ADMIN"]).default(sql`null`),
  created_at: timestamp("created_at").defaultNow(),
});
