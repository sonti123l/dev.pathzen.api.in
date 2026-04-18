import {
  mysqlTable,
  int,
  varchar,
  timestamp,
  json,
} from "drizzle-orm/mysql-core";
import { domains } from "./course_domain.js";

export const courses = mysqlTable("courses", {
  course_id: int("course_id").primaryKey().notNull().autoincrement(),
  course_name: varchar("course_name", { length: 255 }).notNull(),
  course_meta_data: json("course_meta_data"),
  course_created_at: timestamp("course_created_at").defaultNow().notNull(),
  course_progress: int("course_progress").notNull().default(0),

  field_id: int("field_id").references(() => domains.domain_id)
});
