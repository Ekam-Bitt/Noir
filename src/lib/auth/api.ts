import { NextResponse } from "next/server";

import { getAuthViewer } from "@/lib/auth/server";

export async function requireAdminApiAccess() {
  const viewer = await getAuthViewer();

  if (!viewer.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!viewer.isAdmin) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  return null;
}
