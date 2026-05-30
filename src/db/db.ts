import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import "dotenv/config";
import * as schema from "./schema/notifications.js";

const poolConnection = mysql.createPool(process.env.DB_URL!);

export const db = drizzle(poolConnection, { schema, mode: "default" });