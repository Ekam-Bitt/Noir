import postgres from "postgres";

import { getPostgresConnectionString } from "@/lib/supabase/env";

let sqlInstance: postgres.Sql | null = null;

export function getSql() {
  const connectionString = getPostgresConnectionString();
  if (!connectionString) {
    throw new Error("Postgres is not configured. Set POSTGRES_URL or SUPABASE_DB_URL.");
  }

  if (!sqlInstance) {
    sqlInstance = postgres(connectionString, {
      ssl: "require",
      prepare: false,
    });
  }

  return sqlInstance;
}
