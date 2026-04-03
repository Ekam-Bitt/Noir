import postgres from "postgres";

import { getPostgresConnectionString } from "@/lib/supabase/env";

let sqlInstance: postgres.Sql | null = null;

function createSqlClient() {
  const connectionString = getPostgresConnectionString();
  if (!connectionString) {
    throw new Error("Postgres is not configured. Set POSTGRES_URL or SUPABASE_DB_URL.");
  }

  return postgres(connectionString, {
    ssl: "require",
    prepare: false,
  });
}

export function getSql() {
  if (!sqlInstance) {
    sqlInstance = createSqlClient();
  }

  return sqlInstance;
}

export async function resetSql() {
  if (!sqlInstance) return;

  const current = sqlInstance;
  sqlInstance = null;

  try {
    await current.end();
  } catch {
    // Ignore teardown errors and allow a fresh client to be created.
  }
}

function getErrorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : "";
  }

  return "";
}

export function isTransientSqlError(error: unknown) {
  const code = getErrorCode(error);
  if (code === "ECONNRESET" || code === "CONNECT_TIMEOUT") return true;

  const message = error instanceof Error ? error.message : "";
  return /ECONNRESET|CONNECT_TIMEOUT|connection closed|socket hang up/i.test(message);
}

export async function withSqlRetry<T>(run: () => Promise<T>) {
  try {
    return await run();
  } catch (error) {
    if (!isTransientSqlError(error)) {
      throw error;
    }

    await resetSql();
    return run();
  }
}
