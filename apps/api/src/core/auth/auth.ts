import * as dotenv from "dotenv";
import { createDrizzleConnection } from "../database";
import { createAuthConfig } from "./auth.config";

dotenv.config();
const databaseUrl = process.env.DATABASE_URL || "";
const db = createDrizzleConnection(databaseUrl);
const env = { get: (key: string) => process.env[key] };

export const auth = createAuthConfig(db, env as any);
