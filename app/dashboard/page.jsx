"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function RibbonEmote() {
  return (
    <div className="pointer-events-none absolute right-3 top-3">
      <div
        className="h-9 w-9 rounded-full flex items-center justify-center
        bg-white/70 backdrop-blur border border-pink-200
        shadow-[0_18px_55px_-40px_rgba(236,72,153,0.55)]"
        title="🎀"
        aria-hidden="true"
      >
        <span className="text-lg">🎀</span>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub }) {
  return (
    <div
      className="group relative overflow-hidden rounded-3xl
      bg-white/60 backdrop-blur-xl
      border border-pink-200/60
      p-5
      shadow-[0_25px_80px_-55px_rgba(236,72,153,0.55)]
      hover:shadow-[0_30px_95px_-55px_rgba(236,72,153,0.75)]
      transition"
    >
      <RibbonEmote />

      {/* glossy highlight */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-gradient-to-br from-white/70 to-transparent blur-2xl" />
      {/* shimmer line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
      {/* soft hover glaze */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-pink-400/10 via-rose-400/10 to-fuchsia-400/10" />

      <p className="text-sm font-semibold tracking-wide text-slate-700/70">
        {title}
      </p>
      <p className="mt-1 text-3xl font-black text-slate-900 drop-shadow-sm">
        {value}
      </p>
      {sub ? (
        <p className="mt-1 text-xs font-medium text-slate-600/70">{sub}</p>
      ) : null}
    </div>
  );
}

function MenuButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl
      bg-white/60 backdrop-blur-xl
      border border-pink-200/60
      px-4 py-3 text-left
      shadow-[0_20px_60px_-40px_rgba(236,72,153,0.5)]
      hover:shadow-[0_25px_80px_-38px_rgba(236,72,153,0.7)]
      transition"
    >
      <RibbonEmote />

      {/* shimmer sweep */}
      <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <span className="absolute -left-1/3 top-0 h-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/65 to-transparent blur-sm" />
      </span>

      <p className="font-black text-slate-900 tracking-wide">{label}</p>
      <p className="text-xs font-medium text-slate-600/70">
        Buka halaman {label}
      </p>
    </button>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState({
    totalObat: 0,
    lowStock: 0,
    nearExpired: 0,
    salesToday: 0,
    purchasesToday: 0,
  });

  const [totalPurchase, setTotalPurchase] = useState(0);

  // ambil statistik dashboard
  async function loadStats() {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) return;
      const json = await res.json();
      setStats(json);
    } catch (e) {
      console.error(e);
    }
  }

  // ambil total pembelian (REAL dari tabel purchases)
  async function loadPurchases() {
    try {
      const res = await fetch("/api/purchases");
      const data = await res.json();
      setTotalPurchase(data.length);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  useEffect(() => {
    loadStats();
    loadPurchases();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      {/* soft pink glow ornaments */}
      <div className="pointer-events-none absolute -top-44 -right-44 h-[560px] w-[560px] rounded-full bg-pink-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-44 -left-44 h-[560px] w-[560px] rounded-full bg-rose-200/40 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.75),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.55),transparent_50%)]" />

      {/* TOP BAR */}
      <div className="sticky top-0 z-10 border-b border-pink-200/60 bg-white/55 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-600/70">Apotek • Dashboard</p>
            <h1 className="text-xl font-extrabold text-slate-900">
              Selamat datang di apotek sehat
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className="relative overflow-hidden rounded-xl px-4 py-2 text-sm font-bold text-white
            bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500
            shadow-[0_18px_60px_-35px_rgba(236,72,153,0.85)]
            hover:brightness-110 transition"
          >
            <span className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.65),transparent_45%)]" />
            Logout
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6 relative">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white p-7 shadow-[0_30px_90px_-55px_rgba(236,72,153,0.9)]">
          <div className="pointer-events-none absolute -top-24 -left-20 h-64 w-64 rounded-full bg-white/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -right-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(255,255,255,0.35),transparent_55%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

          <h2 className="text-2xl font-extrabold">Apotek Digital</h2>
          <p className="mt-1 text-white/90 text-sm"></p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MenuButton onClick={() => router.push("/medicines")} label="Obat" />
            <MenuButton onClick={() => router.push("/suppliers")} label="Supplier" />
            <MenuButton onClick={() => router.push("/purchases")} label="Pembelian" />
            <MenuButton onClick={() => router.push("/sales")} label="Penjualan" />
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <StatCard title="Total Obat" value={stats.totalObat} sub="data medicines" />
          <StatCard title="Stok Hampir Habis" value={stats.lowStock} sub="stok ≤ 5" />
          <StatCard title="Mendekati Expired" value={stats.nearExpired} sub="≤ 30 hari" />
          <StatCard title="Penjualan Hari Ini" value={stats.salesToday} sub="sales hari ini" />
          <StatCard title="Pembelian Hari Ini" value={stats.purchasesToday} sub="purchases hari ini" />
          <StatCard title="Total Pembelian" value={totalPurchase} sub="seluruh data purchases" />
        </div>

        <div className="text-center text-xs text-slate-500 py-6"></div>
      </div>
    </div>
  );
}
