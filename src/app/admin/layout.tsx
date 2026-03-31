import type { ReactNode } from "react";

import { requireAdminViewer } from "@/lib/auth/server";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminViewer("/admin");
  return children;
}
