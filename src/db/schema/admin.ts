import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";
import { users } from "./users.js";

export const admin = mysqlTable("admin", {
  admin_id: int("admin_id").primaryKey(),
  admin_name: varchar("admin_name", { length: 100 }).notNull(),
  admin_mail: varchar("admin_mail", { length: 255 }).notNull().unique(),
  admin_password: varchar("admin_password", { length: 255 }).notNull(),
  is_user: varchar("is_user", {length: 50})
    .references(() => users.role)
    .default("ADMIN"),
  admin_user_id: int("admin_user_id").references(() => users.user_id),
});
