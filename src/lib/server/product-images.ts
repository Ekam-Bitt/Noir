import { PRODUCT_IMAGE_BUCKET, getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ProductImage } from "@/lib/types";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

function sanitizeSegment(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extensionForType(contentType: string, originalName: string) {
  const fromName = originalName.split(".").pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;

  switch (contentType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    default:
      return "jpg";
  }
}

export async function uploadProductImage(params: {
  productSlug: string;
  file: File;
  label?: string;
}) {
  const { productSlug, file, label } = params;

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Unsupported image type. Use JPG, PNG, WebP, or AVIF.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Image is too large. Keep files under 8 MB.");
  }

  const supabase = getSupabaseAdminClient();
  const extension = extensionForType(file.type, file.name);
  const imageId = crypto.randomUUID();
  const safeSlug = sanitizeSegment(productSlug) || "product";
  const safeName = sanitizeSegment(file.name.replace(/\.[^.]+$/, "")) || "image";
  const path = `${safeSlug}/${Date.now()}-${safeName}.${extension}`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message || "Unable to upload image.");
  }

  const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);

  const image: ProductImage = {
    id: imageId,
    label: label?.trim() || "Campaign",
    alt: `${productSlug} ${label?.trim() || "product image"}`,
    palette: ["#161313", "#6b5649", "#d8c3b3"],
    path,
    url: data.publicUrl,
  };

  return image;
}
