import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";


export const roles = mysqlTable("roles", {
  role_id: int("role_id").primaryKey().autoincrement(),
  role_name: varchar("role_name",{length: 20}).notNull()
})