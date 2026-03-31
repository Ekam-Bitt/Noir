import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AuthViewer = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isConfigured: boolean;
};

type AuthenticatedViewer = Omit<AuthViewer, "user" | "isAuthenticated"> & {
  user: User;
  isAuthenticated: true;
};

function isAdminUser(user: User | null) {
  if (!user) return false;

  return (
    user.app_metadata?.role === "admin" ||
    user.user_metadata?.role === "admin" ||
    user.app_metadata?.roles?.includes?.("admin") === true
  );
}

export async function getAuthViewer(): Promise<AuthViewer> {
  if (!isSupabaseConfigured()) {
    return {
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isConfigured: false,
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isConfigured: false,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    user,
    isAuthenticated: Boolean(user),
    isAdmin: isAdminUser(user),
    isConfigured: true,
  };
}

export async function requireAuthenticatedViewer(nextPath = "/account"): Promise<AuthenticatedViewer> {
  const viewer = await getAuthViewer();
  if (!viewer.isAuthenticated || !viewer.user) {
    redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  }
  return {
    ...viewer,
    user: viewer.user,
    isAuthenticated: true,
  };
}

export async function requireAdminViewer(nextPath = "/admin") {
  const viewer = await requireAuthenticatedViewer(nextPath);
  if (!viewer.isAdmin) {
    redirect("/");
  }
  return viewer;
}
