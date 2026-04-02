"use client";

import { useMemo, useState } from "react";

import { INDIA_STATE_CITIES, INDIA_STATES } from "@/lib/data/india";
import type { Address } from "@/lib/types";

type AddressBookProps = {
  initialAddresses: Address[];
};

const emptyForm = {
  name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  phone: "",
  isDefault: false,
};

export function AddressBook({ initialAddresses }: AddressBookProps) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [busyAddressId, setBusyAddressId] = useState<string | null>(null);

  const cities = useMemo(() => {
    if (!form.state) return [];
    return INDIA_STATE_CITIES[form.state] ?? [];
  }, [form.state]);

  function startCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, isDefault: addresses.length === 0 });
    setMessage(null);
  }

  function startEdit(address: Address) {
    setEditingId(address.id ?? null);
    setForm({
      name: address.name,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone.replace(/\D/g, "").slice(-10),
      isDefault: Boolean(address.isDefault),
    });
    setMessage(null);
  }

  async function submit() {
    setSubmitting(true);
    setMessage(null);

    const payload = {
      ...form,
      phone: form.phone.replace(/\D/g, "").slice(-10),
      country: "India" as const,
    };

    const response = await fetch(
      editingId ? `/api/account/addresses/${editingId}` : "/api/account/addresses",
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const data = (await response.json()) as { error?: string; addresses?: Address[] };
    if (!response.ok || !data.addresses) {
      setMessage(data.error ?? "Unable to save address.");
      setSubmitting(false);
      return;
    }

    setAddresses(data.addresses);
    startCreate();
    setMessage("Address saved.");
    setSubmitting(false);
  }

  async function remove(addressId: string) {
    setMessage(null);
    setBusyAddressId(addressId);
    const response = await fetch(`/api/account/addresses/${addressId}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string; addresses?: Address[] };
    if (!response.ok || !data.addresses) {
      setMessage(data.error ?? "Unable to delete address.");
      setBusyAddressId(null);
      return;
    }
    setAddresses(data.addresses);
    if (editingId === addressId) startCreate();
    setMessage("Address deleted.");
    setBusyAddressId(null);
  }

  async function setDefault(addressId: string) {
    setMessage(null);
    setBusyAddressId(addressId);
    const response = await fetch(`/api/account/addresses/${addressId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    const data = (await response.json()) as { error?: string; addresses?: Address[] };
    if (!response.ok || !data.addresses) {
      setMessage(data.error ?? "Unable to set default address.");
      setBusyAddressId(null);
      return;
    }
    setAddresses(data.addresses);
    setMessage("Default address updated.");
    setBusyAddressId(null);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-4">
        {addresses.length ? (
          addresses.map((address) => (
            <article key={address.id} className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="text-sm leading-7 text-[#c7b9ab]">
                  <p className="text-lg text-[#f5efe8]">{address.name}</p>
                  <p>{address.line1}</p>
                  {address.line2 ? <p>{address.line2}</p> : null}
                  <p>{address.city}, {address.state} {address.postalCode}</p>
                  <p>{address.country}</p>
                  <p>{address.phone}</p>
                </div>
                {address.isDefault ? (
                  <span className="rounded-full border border-[#3a342f] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#f1ddc7]">
                    Default
                  </span>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => startEdit(address)}
                  className="rounded-full border border-[#312b27] px-4 py-2 text-sm text-[#f5efe8] transition hover:border-[#4a3f39]"
                >
                  Edit
                </button>
                {!address.isDefault && address.id ? (
                  <button
                    type="button"
                    onClick={() => setDefault(address.id!)}
                    disabled={busyAddressId === address.id}
                    className="rounded-full border border-[#312b27] px-4 py-2 text-sm text-[#c7b9ab] transition hover:border-[#4a3f39] disabled:opacity-60"
                  >
                    {busyAddressId === address.id ? "Updating..." : "Set default"}
                  </button>
                ) : null}
                {address.id ? (
                  <button
                    type="button"
                    onClick={() => remove(address.id!)}
                    disabled={busyAddressId === address.id}
                    className="rounded-full border border-[#5a312e] px-4 py-2 text-sm text-[#e4b3a8] transition hover:border-[#7a413c] disabled:opacity-60"
                  >
                    {busyAddressId === address.id ? "Deleting..." : "Delete"}
                  </button>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[2rem] border border-dashed border-[#2f2926] px-6 py-16 text-center">
            <p className="text-3xl tracking-[-0.04em] text-[#f5efe8]">No saved addresses.</p>
            <p className="mt-3 text-[#a7988b]">Add one here and your next checkout will be faster.</p>
          </div>
        )}
      </section>

      <section className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-[#9e9082]">
          {editingId ? "Edit address" : "Add address"}
        </p>
        <h2 className="mt-2 text-3xl tracking-[-0.04em] text-[#f5efe8]">Address book</h2>

        <div className="mt-5 grid gap-4">
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Full name" className="w-full rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none" />
          <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="Phone number" className="w-full rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none" />
          <input value={form.line1} onChange={(event) => setForm((current) => ({ ...current, line1: event.target.value }))} placeholder="Address line 1" className="w-full rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none" />
          <input value={form.line2} onChange={(event) => setForm((current) => ({ ...current, line2: event.target.value }))} placeholder="Address line 2" className="w-full rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none" />
          <input value={form.postalCode} onChange={(event) => setForm((current) => ({ ...current, postalCode: event.target.value.replace(/\D/g, "").slice(0, 6) }))} placeholder="PIN code" className="w-full rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none" />
          <select value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value, city: "" }))} className="w-full rounded-full border border-[#312a26] bg-[#120f0d] px-4 py-3 text-sm outline-none">
            <option value="">Select state</option>
            {INDIA_STATES.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <select value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} className="w-full rounded-full border border-[#312a26] bg-[#120f0d] px-4 py-3 text-sm outline-none">
            <option value="">{form.state ? "Select city" : "Select state first"}</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <label className="flex items-center gap-3 rounded-[1.3rem] border border-[#2b2623] px-4 py-3 text-sm text-[#c7b9ab]">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(event) => setForm((current) => ({ ...current, isDefault: event.target.checked }))}
            />
            Set as default address
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void submit()}
            disabled={isSubmitting}
            className="rounded-full bg-[#f1ddc7] px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#1a1715] disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : editingId ? "Save address" : "Add address"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={startCreate}
              className="rounded-full border border-[#312b27] px-6 py-3 text-sm text-[#c7b9ab]"
            >
              Cancel
            </button>
          ) : null}
        </div>

        {message ? <p className="mt-4 text-sm text-[#c7b9ab]">{message}</p> : null}
      </section>
    </div>
  );
}
