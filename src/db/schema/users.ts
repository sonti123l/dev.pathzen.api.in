import {
  mysqlTable,
  int,
  timestamp,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  user_id: int("user_id").autoincrement().primaryKey(),
  role: mysqlEnum("role", ["ADMIN", "TEACHER", "STUDENT"]).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});