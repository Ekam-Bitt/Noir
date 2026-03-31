"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function resolveNext(next: FormDataEntryValue | null) {
  return typeof next === "string" && next.startsWith("/") ? next : "/account";
}

export async function loginAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/auth/login?error=Supabase%20is%20not%20configured");
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = resolveNext(formData.get("next"));

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}

export async function signupAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/auth/login?error=Supabase%20is%20not%20configured");
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const next = resolveNext(formData.get("next"));

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  }

  redirect(`/auth/login?message=${encodeURIComponent("Check your email to confirm your account.")}&next=${encodeURIComponent(next)}`);
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}
