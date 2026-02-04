"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
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

export default function SalesPage() {
  const router = useRouter();

  const [medicines, setMedicines] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // ambil data obat
  async function loadMedicines() {
    const res = await fetch("/api/medicines?page=1&limit=999&q=");
    const json = await res.json();
    setMedicines(json.data || []);
  }

  useEffect(() => {
    loadMedicines();
  }, []);

  const selectedMedicine = useMemo(
    () => medicines.find((m) => String(m.id) === String(selectedId)),
    [medicines, selectedId]
  );

  const total = useMemo(
    () => cart.reduce((sum, c) => sum + Number(c.price) * Number(c.qty), 0),
    [cart]
  );

  function addToCart() {
    if (!selectedMedicine) return alert("Pilih obat dulu");
    if (qty <= 0) return alert("Qty harus > 0");

    const exist = cart.find((c) => c.medicine_id === selectedMedicine.id);
    if (exist) {
      setCart((prev) =>
        prev.map((c) =>
          c.medicine_id === selectedMedicine.id
            ? { ...c, qty: c.qty + qty }
            : c
        )
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          medicine_id: selectedMedicine.id,
          name: selectedMedicine.name,
          price: selectedMedicine.price,
          qty,
        },
      ]);
    }

    setQty(1);
  }

  function removeItem(id) {
    setCart((prev) => prev.filter((c) => c.medicine_id !== id));
  }

  async function submitSales() {
    if (cart.length === 0) return alert("Keranjang kosong");

    setLoading(true);
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: 1, // admin
        items: cart.map((c) => ({
          medicine_id: c.medicine_id,
          qty: c.qty,
          price: c.price,
        })),
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      alert(json.message || "Gagal penjualan");
      setLoading(false);
      return;
    }

    // ===== CETAK STRUK =====
    const strukHtml = `
      <html>
        <head>
          <title>Struk Penjualan</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h2 { margin-bottom: 10px; }
            .row { display: flex; justify-content: space-between; margin: 6px 0; }
            hr { margin: 10px 0; }
            .total { font-weight: bold; font-size: 18px; }
            button { margin-top: 12px; padding: 10px 14px; }
          </style>
        </head>
        <body>
          <h2>APOTEK DIGITAL</h2>
          <p>Struk Penjualan</p>
          <hr/>
          ${
            cart
              .map(
                (c) => `
                  <div class="row">
                    <span>${c.name} x${c.qty}</span>
                    <span>Rp ${(c.price * c.qty).toLocaleString("id-ID")}</span>
                  </div>
                `
              )
              .join("")
          }
          <hr/>
          <div class="row total">
            <span>TOTAL</span>
            <span>Rp ${json.total.toLocaleString("id-ID")}</span>
          </div>

          <button onclick="window.print()">Print Lagi</button>

          <script>
            setTimeout(() => window.print(), 300);
          </script>
        </body>
      </html>
    `;

    const w = window.open("", "_blank");
    if (w) {
      w.document.write(strukHtml);
      w.document.close();
    } else {
      alert("Pop-up diblokir. Izinkan pop-up untuk cetak.");
    }

    setCart([]);
    await loadMedicines();
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 p-6">
      {/* soft pink glow ornaments */}
      <div className="pointer-events-none absolute -top-44 -right-44 h-[560px] w-[560px] rounded-full bg-pink-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-44 -left-44 h-[560px] w-[560px] rounded-full bg-rose-200/40 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.75),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.55),transparent_50%)]" />

      <div className="mx-auto max-w-4xl space-y-6 relative">
        <div className="flex justify-between items-center gap-3">
          <div>
            <p className="text-xs text-slate-600/70">Apotek • Penjualan</p>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Kasir • Penjualan
            </h1>
            <p className="text-sm text-slate-600/70">
              Tambah item, cek total, lalu simpan & cetak 🎀
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-pink-200/70 bg-white/60 backdrop-blur px-4 py-2 font-bold text-slate-800
            shadow-[0_18px_55px_-45px_rgba(236,72,153,0.35)]
            hover:bg-pink-50 transition"
          >
            ⬅ Dashboard
          </button>
        </div>

        {/* INPUT */}
        <div className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl p-5 border border-pink-200/60 shadow-[0_30px_90px_-55px_rgba(236,72,153,0.6)] space-y-3">
          <RibbonEmote />

          <select
            className="w-full rounded-xl border border-pink-200/70 bg-white/70 p-3 outline-none
            focus:ring-2 focus:ring-pink-300"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">-- pilih obat --</option>
            {medicines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} (stok {m.stock})
              </option>
            ))}
          </select>

          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-full rounded-xl border border-pink-200/70 bg-white/70 p-3 outline-none
            focus:ring-2 focus:ring-pink-300"
          />

          <button
            onClick={addToCart}
            className="relative overflow-hidden w-full py-3 rounded-xl font-extrabold text-white
            bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500
            shadow-[0_18px_60px_-35px_rgba(236,72,153,0.85)]
            hover:brightness-110 transition"
          >
            <span className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.65),transparent_45%)]" />
            Tambah ke Keranjang
          </button>
        </div>

        {/* KERANJANG */}
        <div className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl p-5 border border-pink-200/60 shadow-[0_30px_90px_-55px_rgba(236,72,153,0.6)] space-y-3">
          <RibbonEmote />

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">Keranjang</h2>
            <div className="text-xs text-slate-600/70">Total otomatis</div>
          </div>

          {cart.length === 0 ? (
            <p className="text-sm text-slate-500">Kosong</p>
          ) : (
            <div className="space-y-2">
              {cart.map((c) => (
                <div
                  key={c.medicine_id}
                  className="flex justify-between items-center gap-3 rounded-2xl
                  border border-pink-200/60 bg-white/60 p-3
                  shadow-[0_14px_45px_-40px_rgba(236,72,153,0.35)]"
                >
                  <div>
                    <b className="text-slate-900">{c.name}</b>
                    <div className="text-xs text-slate-600/80">
                      {c.qty} x Rp {c.price.toLocaleString("id-ID")}
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(c.medicine_id)}
                    className="rounded-xl px-3 py-2 text-white text-xs font-bold
                    bg-gradient-to-r from-rose-500 to-pink-600
                    shadow-[0_16px_45px_-35px_rgba(244,63,94,0.95)]
                    hover:brightness-110 transition"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between font-extrabold text-lg pt-2 text-slate-900">
            <span>Total</span>
            <span className="text-pink-600">
              Rp {total.toLocaleString("id-ID")}
            </span>
          </div>

          <button
            disabled={loading}
            onClick={submitSales}
            className="relative overflow-hidden w-full py-3 rounded-xl font-extrabold text-white
            bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600
            shadow-[0_18px_60px_-35px_rgba(236,72,153,0.85)]
            hover:brightness-110 transition
            disabled:opacity-60"
          >
            <span className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.65),transparent_45%)]" />
            {loading ? "Menyimpan..." : "Simpan & Cetak"}
          </button>
        </div>
      </div>
    </div>
  );
}
