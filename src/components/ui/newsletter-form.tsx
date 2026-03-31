"use client";

import { useState } from "react";

export function NewsletterForm({ placeholder }: { placeholder: string }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <input
        type="email"
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-full border border-[#2b2623] bg-[#12100f] px-5 py-3 text-sm text-[#f4ede4] outline-none transition focus:border-[#c9a98b]"
      />
      <button
        type="submit"
        className="rounded-full bg-[#f1ddc7] px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#1d1816] transition hover:bg-white"
      >
        Subscribe
      </button>
      {submitted ? <p className="text-sm text-[#c5b7a7]">You&apos;re on the list.</p> : null}
    </form>
  );
}
