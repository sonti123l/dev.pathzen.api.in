import { mysqlTable, int, varchar, json } from "drizzle-orm/mysql-core";
import { courses } from "./courses.js";
import { users } from "./users.js";

export const teachers = mysqlTable("teachers", {
  teacher_id: int("teacher_id").primaryKey().autoincrement(),
  teacher_name: varchar("teacher_name", { length: 100 }).notNull(),
  teacher_email_id: varchar("teacher_email_id", { length: 255 })
    .notNull()
    .unique(),
  teacher_password: varchar("teacher_password", { length: 255 }).notNull(),
  teacher_course_id: int("teacher_course_id").references(
    () => courses.course_id,
  ),
  teacher_experience: varchar("teacher_experience", { length: 30 }).notNull(),
  teacher_technicalities: json("teacher_technicalities").notNull(),
  teacher_user_id: int("teacher_user_id").references(() => users.user_id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
});
