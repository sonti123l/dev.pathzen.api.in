import { boolean, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { modules } from "./module.js";

export const subModules = mysqlTable("subModules", {
    sub_module_id: int("sub_module_id").primaryKey().autoincrement(),
    sub_module_title: varchar("sub_module_title",{length: 255}).notNull(),
    is_sub_module_completed: boolean("is_sub_module_completed").default(false),
    sub_module_in_module_id: int("sub_module_in_module_id").references(() => modules.module_id,{
        onDelete: 'cascade',
        onUpdate: 'cascade'
    })
})