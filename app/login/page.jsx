"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  async function handleLogin(e) {
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push(next);
      router.refresh();
    } else {
      alert("Login gagal");
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 flex items-center justify-center p-4">
      {/* soft pink glow */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-pink-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-rose-200/40 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.75),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.55),transparent_50%)]" />

      <div className="relative w-full max-w-sm">
        {/* TITLE */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-pink-600 tracking-wide">
            Apotek Sehat
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Sistem Manajemen Apotek
          </p>
        </div>

        {/* CARD */}
        <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-pink-200/60 shadow-[0_30px_90px_-55px_rgba(236,72,153,0.6)] p-6">
          <h2 className="text-xl font-extrabold text-slate-900">
            Login Admin
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Masuk dulu ya ✨
          </p>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              className="w-full rounded-xl border border-pink-200/70 bg-white/80 p-3 outline-none
              focus:ring-2 focus:ring-pink-300"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="w-full rounded-xl border border-pink-200/70 bg-white/80 p-3 outline-none
              focus:ring-2 focus:ring-pink-300"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              className="relative overflow-hidden w-full rounded-xl py-3 font-extrabold text-white
              bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500
              shadow-[0_18px_60px_-35px_rgba(236,72,153,0.85)]
              hover:brightness-110 transition"
            >
              <span className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.65),transparent_45%)]" />
              Login
            </button>
          </form>

          <p className="mt-4 text-xs text-center text-slate-500">
            © {new Date().getFullYear()} Apotek Sehat
          </p>
        </div>
      </div>
    </div>
  );
}