import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import "dotenv/config";

const poolConnection = mysql.createPool(process.env.DB_URL!);

export const db = drizzle({ client: poolConnection });
