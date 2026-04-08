import {
  mysqlTable,
  int,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  user_id: int("user_id").autoincrement().primaryKey(),
  refresh_token: varchar("refresh_token", {length: 400}).notNull().unique(),
  created_at: timestamp("created_at").defaultNow(),
});