import Link from "next/link";

import { loginAction, signupAction } from "@/app/auth/actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/account";

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-16">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">Authentication</p>
        <h1 className="mt-4 text-6xl tracking-[-0.05em] text-[#f5efe8]">Sign in for your profile, wishlist, and order history.</h1>
        {next === "/checkout" ? (
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#b9ab9d]">
            Create an account or sign in before checkout so your order history, address, and contact details stay saved for the next purchase.
          </p>
        ) : null}
      </div>

      {params.error ? (
        <div className="mb-6 rounded-[1.5rem] border border-[#4a2f2a] bg-[#241613] p-4 text-sm text-[#e3b2a7]">
          {params.error}
        </div>
      ) : null}

      {params.message ? (
        <div className="mb-6 rounded-[1.5rem] border border-[#2d3228] bg-[#151912] p-4 text-sm text-[#cde1b1]">
          {params.message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <form action={loginAction} className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#9e9082]">Existing customer</p>
          <h2 className="mt-2 text-3xl tracking-[-0.04em] text-[#f5efe8]">Sign in</h2>
          <input type="hidden" name="next" value={next} />
          <div className="mt-5 space-y-4">
            <input
              type="email"
              name="email"
              required
              placeholder="Email"
              className="w-full rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
            />
            <input
              type="password"
              name="password"
              required
              placeholder="Password"
              className="w-full rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
            />
          </div>
          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-[#f1ddc7] px-6 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-[#1a1715]"
          >
            Sign in
          </button>
        </form>

        <form action={signupAction} className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#9e9082]">New customer</p>
          <h2 className="mt-2 text-3xl tracking-[-0.04em] text-[#f5efe8]">Create account</h2>
          <input type="hidden" name="next" value={next} />
          <div className="mt-5 space-y-4">
            <input
              type="text"
              name="fullName"
              required
              placeholder="Full name"
              className="w-full rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
            />
            <input
              type="email"
              name="email"
              required
              placeholder="Email"
              className="w-full rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
            />
            <input
              type="password"
              name="password"
              required
              minLength={8}
              placeholder="Password"
              className="w-full rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
            />
          </div>
          <button
            type="submit"
            className="mt-6 w-full rounded-full border border-[#312a26] px-6 py-4 text-sm font-medium uppercase tracking-[0.2em] text-[#f5efe8]"
          >
            Create account
          </button>
          <p className="mt-4 text-sm leading-7 text-[#9e9082]">
            For production handoff, enable email confirmation and set the client brand domain in Supabase auth settings.
          </p>
        </form>
      </div>

      <div className="mt-8">
        <Link href="/products" className="text-sm text-[#c7b9ab] transition hover:text-[#f5efe8]">
          Continue browsing
        </Link>
      </div>
    </div>
  );
}
