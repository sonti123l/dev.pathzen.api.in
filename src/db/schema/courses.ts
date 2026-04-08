import {
  mysqlTable,
  int,
  varchar,
  timestamp,
  json,
} from "drizzle-orm/mysql-core";

export const courses = mysqlTable("courses", {
  course_id: int("course_id").primaryKey().notNull().autoincrement(),
  course_name: varchar("course_name", { length: 255 }).notNull(),
  course_meta_data: json("course_meta_data"),
  course_created_at: timestamp("course_created_at"),
});
