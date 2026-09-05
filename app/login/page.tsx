"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 p-8">
        <h1 className="mb-6 text-2xl font-bold text-neutral-900">Login</h1>

        <button
          onClick={() => signIn("google", { callbackUrl: "/inbox" })}
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          <GoogleIcon />
          Login with Google
        </button>

        <div className="mb-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-neutral-200" />
          <span className="text-xs text-neutral-400">or sign up through email</span>
          <span className="h-px flex-1 bg-neutral-200" />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Email/password login — wire up Credentials provider when backend is ready
          }}
          className="flex flex-col gap-3"
        >
          <input
            type="email"
            placeholder="Email ID"
            className="rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm outline-none placeholder:text-neutral-400 focus:border-emerald-400"
          />
          <input
            type="password"
            placeholder="Password"
            className="rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm outline-none placeholder:text-neutral-400 focus:border-emerald-400"
          />
          <button
            type="submit"
            className="mt-2 rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.74z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.1A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.28a12 12 0 0 0 0 10.78l3.99-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.28 6.61l3.99 3.1C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}
