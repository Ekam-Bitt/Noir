export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function isSupabaseStorageUrl(value?: string | null) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.hostname.endsWith(".supabase.co") && url.pathname.includes("/storage/v1/object/public/");
  } catch {
    return false;
  }
}
