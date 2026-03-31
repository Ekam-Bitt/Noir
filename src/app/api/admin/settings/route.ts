import { NextResponse } from "next/server";
import { z } from "zod";

import { getStoreSettings, updateStoreSettings } from "@/lib/services/content";

const paymentMethodSchema = z.object({
  id: z.enum(["razorpay-test", "cod", "bank-transfer"]),
  label: z.string().min(2),
  description: z.string().min(2),
  enabled: z.boolean(),
});

const settingsSchema = z.object({
  brandName: z.string().min(2).optional(),
  logoText: z.string().min(1).optional(),
  brandTagline: z.string().min(2).optional(),
  announcement: z.string().min(2).optional(),
  heroTitle: z.string().min(2).optional(),
  heroCopy: z.string().min(2).optional(),
  heroCta: z.string().min(2).optional(),
  heroSecondaryCta: z.string().min(2).optional(),
  marquee: z.array(z.string().min(1)).optional(),
  newsletterHeading: z.string().min(2).optional(),
  newsletterPlaceholder: z.string().min(2).optional(),
  aboutHeadline: z.string().min(2).optional(),
  aboutBody: z.string().min(2).optional(),
  laboratoryTitle: z.string().min(2).optional(),
  laboratoryBody: z.string().min(2).optional(),
  faqTitle: z.string().min(2).optional(),
  shippingTitle: z.string().min(2).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(6).optional(),
  contactHours: z.string().min(2).optional(),
  brandCanvas: z.string().min(4).optional(),
  brandInk: z.string().min(4).optional(),
  brandAccent: z.string().min(4).optional(),
  paymentMethods: z.array(paymentMethodSchema).optional(),
  freeShippingThreshold: z.number().int().nonnegative().optional(),
  standardShippingFee: z.number().int().nonnegative().optional(),
  expressShippingFee: z.number().int().nonnegative().optional(),
});

export async function GET() {
  const settings = await getStoreSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  try {
    const payload = settingsSchema.parse(await request.json());
    const settings = await updateStoreSettings(payload);
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update settings." },
      { status: 400 },
    );
  }
}
