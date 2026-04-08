import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";

import { colleges } from "./colleges.js";
import { users } from "./users.js";
import { courses } from "./courses.js";
import { roles } from "./roles.js";

export const students = mysqlTable("students", {
  id: int("id").primaryKey().autoincrement(),
  student_name: varchar("student_name", { length: 50 }).notNull(),
  student_email_id: varchar("student_email_id", { length: 255 })
    .notNull()
    .unique(),
  student_password: varchar("student_password", { length: 30 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  branch_name: varchar("branch_name", { length: 255 }).notNull(),
  student_refresh_token: varchar("student_refresh_token", { length: 400 })
    .references(() => users.refresh_token,{
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }).unique()
    .notNull(),
  student_college_id: int("student_college_id").references(
    () => colleges.college_id,
    {
      onDelete: "cascade",
      onUpdate: "cascade",
    },
  ),
  is_user: int("is_user").references(() => roles.role_id,{
    onDelete: 'cascade',
    onUpdate: 'cascade'
  }),
  student_id: int("student_id").references(() => users.user_id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  student_course_id: int("student_course_id").references(
    () => courses.course_id,
    {
      onDelete: "cascade",
      onUpdate: "cascade",
    },
  ),
});


