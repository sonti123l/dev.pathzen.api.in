import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";
import { users } from "./users.js";
export const admin = mysqlTable("admin", {
    admin_id: int("admin_id").primaryKey().autoincrement(),
    admin_name: varchar("admin_name", { length: 100 }).notNull(),
    admin_mail: varchar("admin_mail", { length: 255 }).notNull().unique(),
    admin_password: varchar("admin_password", { length: 255 }).notNull(),
    admin_user_id: int("admin_user_id").references(() => users.user_id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
});
