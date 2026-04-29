import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";
export const colleges = mysqlTable("colleges", {
    college_id: int("id").primaryKey().notNull().autoincrement(),
    college_name: varchar("college_name", { length: 255 }).notNull(),
    college_address: varchar("college_address", { length: 255 }).notNull(),
});
