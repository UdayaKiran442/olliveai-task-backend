/** biome-ignore-all assist/source/organizeImports:> */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.NEON_DB_URL ?? "");
const db = drizzle(sql);

export default db;