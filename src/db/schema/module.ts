import { boolean, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { courses } from "./courses.js";

export const modules = mysqlTable("modules", {
  module_id: int("module_id").primaryKey().autoincrement(),
  module_name: varchar("module_name", { length: 255 }).notNull(),
  course_id_for_module: int("course_id_for_module").references(
    () => courses.course_id,
    {
      onDelete: "cascade",
      onUpdate: "cascade",
    },
  ),
  is_module_complete: boolean("is_module_complete").default(false),
});
