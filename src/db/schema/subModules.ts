import {
  boolean,
  date,
  int,
  mysqlTable,
  varchar,
} from "drizzle-orm/mysql-core";
import { modules } from "./module.js";

export const subModules = mysqlTable("subModules", {
  sub_module_id: int("sub_module_id").primaryKey().autoincrement(),
  sub_module_title: varchar("sub_module_title", { length: 255 }).notNull(),
  is_sub_module_completed: boolean("is_sub_module_completed").default(false),
  live_time: varchar("live_time", { length: 30 }),
  live_created_date: date("live_date"),
  is_active: boolean("is_active").default(false),
  sub_module_in_module_id: int("sub_module_in_module_id").references(
    () => modules.module_id,
    {
      onDelete: "cascade",
      onUpdate: "cascade",
    },
  ),
});
