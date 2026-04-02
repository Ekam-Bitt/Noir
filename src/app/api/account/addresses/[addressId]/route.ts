import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  deleteCustomerAddressForUser,
  getCustomerProfileForUser,
  setDefaultCustomerAddressForUser,
  updateCustomerAddressForUser,
} from "@/lib/services/customer-account";

const addressSchema = z.object({
  name: z.string().min(2),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().regex(/^[1-9][0-9]{5}$/),
  country: z.literal("India"),
  phone: z.string().regex(/^(?:\+91|91)?[6-9]\d{9}$/),
  isDefault: z.boolean().optional(),
});

const defaultSchema = z.object({
  isDefault: z.literal(true),
});

async function getUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  return user;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ addressId: string }> },
) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const { addressId } = await params;
    const body = await request.json();

    if ("isDefault" in body && Object.keys(body).length === 1) {
      defaultSchema.parse(body);
      await setDefaultCustomerAddressForUser(user.id, addressId);
    } else {
      const payload = addressSchema.parse(body);
      await updateCustomerAddressForUser(user.id, addressId, payload);
    }

    const customer = await getCustomerProfileForUser(user);
    return NextResponse.json({ addresses: customer.addresses });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update address." },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ addressId: string }> },
) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const { addressId } = await params;
    await deleteCustomerAddressForUser(user.id, addressId);
    const customer = await getCustomerProfileForUser(user);
    return NextResponse.json({ addresses: customer.addresses });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete address." },
      { status: 400 },
    );
  }
}
