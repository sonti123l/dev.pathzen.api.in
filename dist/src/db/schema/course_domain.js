import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";
export const domains = mysqlTable("domains", {
    domain_id: int("domain_id").primaryKey().autoincrement(),
    domain_name: varchar("domain_name", { length: 255 }).notNull(),
});
