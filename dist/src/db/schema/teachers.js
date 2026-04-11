import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";
import { courses } from "./courses.js";
import { users } from "./users.js";
export const teachers = mysqlTable("teachers", {
    teacher_id: int("teacher_id").primaryKey().notNull(),
    teacher_name: varchar("teacher_name", { length: 100 }).notNull(),
    teacher_email_id: varchar("teacher_email_id", { length: 255 })
        .notNull()
        .unique(),
    teacher_password: varchar("teacher_password", { length: 255 }).notNull(),
    teacher_course_id: int("teacher_course_id").references(() => courses.course_id),
    teacher_experience: varchar("teacher_experience", { length: 30 }).notNull(),
    teacher_technicalities: varchar("teacher_technicalities", {
        length: 255,
    }).notNull(),
    is_user: varchar("is_user", { length: 30 }).default("TEACHER"),
    teacher_user_id: int("teacher_user_id").references(() => users.user_id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
});
