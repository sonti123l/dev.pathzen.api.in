import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";

import { colleges } from "./colleges.js";
import { users } from "./users.js";
import { courses } from "./courses.js";

export const students = mysqlTable("students", {
  id: int("id").primaryKey().autoincrement(),
  student_name: varchar("student_name", { length: 50 }).notNull(),
  student_email_id: varchar("student_email_id", { length: 255 })
    .notNull()
    .unique(),
  student_password: varchar("student_password", { length: 30 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  branch_name: varchar("branch_name", { length: 255 }).notNull(),
  student_college_id: int("student_college_id").references(
    () => colleges.college_id,
  ),
  is_user: varchar("is_user", { length: 30 })
    .references(() => users.role)
    .default("STUDENT"),
  student_id: int("student_id").references(() => users.user_id),
  student_course_id: int("student_course_id").references(
    () => courses.course_id,
  ),
});
