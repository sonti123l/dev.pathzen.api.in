import { int, mysqlTable } from "drizzle-orm/mysql-core";

export const rooms = mysqlTable("rooms", {
    room_id: int("room_id").primaryKey().autoincrement(),
});
