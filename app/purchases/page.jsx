"use client";

import { useEffect, useMemo, useState } from "react";

async function safeReadJson(res) {
  // jangan langsung res.json() karena bisa kosong
  var text = "";
  try {
    text = await res.text();
  } catch (e) {
    text = "";
  }

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch (e) {
    return {};
  }
}

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

export default function PurchasesPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [meds, setMeds] = useState([]);

  const [supplierId, setSupplierId] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);

    try {
      var sRes = await fetch("/api/suppliers?page=1&limit=200&q=", {
        cache: "no-store",
      });
      var sJson = await safeReadJson(sRes);
      if (!sRes.ok) {
        alert((sJson && sJson.message) || "Gagal load suppliers");
        setLoading(false);
        return;
      }
      setSuppliers(sJson.data || []);

      var mRes = await fetch("/api/medicines?page=1&limit=200&q=", {
        cache: "no-store",
      });
      var mJson = await safeReadJson(mRes);
      if (!mRes.ok) {
        alert((mJson && mJson.message) || "Gagal load medicines");
        setLoading(false);
        return;
      }
      setMeds(mJson.data || []);
    } catch (e) {
      alert("Gagal load data");
    }

    setLoading(false);
  }

  useEffect(function () {
    loadAll();
  }, []);

  const total = useMemo(function () {
    return cart.reduce(function (sum, it) {
      return sum + Number(it.price) * Number(it.qty);
    }, 0);
  }, [cart]);

  function addItem() {
    var mid = Number(selectedId);
    var q = Number(qty);
    var p = Number(price);

    if (!supplierId) return alert("Pilih supplier dulu");
    if (!mid) return alert("Pilih obat dulu");
    if (q <= 0) return alert("Qty harus > 0");
    if (p <= 0) return alert("Harga beli harus > 0");

    var med = meds.find(function (m) {
      return Number(m.id) === mid;
    });
    if (!med) return alert("Obat tidak ditemukan");

    setCart(
      cart.concat([
        {
          medicine_id: mid,
          name: med.name,
          qty: q,
          price: p,
        },
      ])
    );

    setSelectedId("");
    setQty(1);
    setPrice(0);
  }

  function removeItem(index) {
    setCart(
      cart.filter(function (_, i) {
        return i !== index;
      })
    );
  }

  async function savePurchase() {
    if (!supplierId) return alert("Pilih supplier dulu");
    if (cart.length === 0) return alert("Item pembelian kosong");

    var res = await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplier_id: Number(supplierId),
        items: cart.map(function (c) {
          return {
            medicine_id: Number(c.medicine_id),
            qty: Number(c.qty),
            price: Number(c.price),
          };
        }),
      }),
    });

    var json = await safeReadJson(res);

    if (!res.ok) {
      return alert((json && json.message) || "Gagal simpan pembelian");
    }

    alert(
      "Sukses! Purchase ID: " +
        json.purchase_id +
        " | Total: Rp " +
        json.total
    );
    setCart([]);
    loadAll();
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-pink-200/60 bg-white/60 backdrop-blur-xl p-6 shadow-[0_30px_90px_-55px_rgba(236,72,153,0.6)]">
            <p className="text-slate-700 font-medium">Loading...</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 p-6">
      {/* soft pink glow ornaments */}
      <div className="pointer-events-none absolute -top-44 -right-44 h-[560px] w-[560px] rounded-full bg-pink-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-44 -left-44 h-[560px] w-[560px] rounded-full bg-rose-200/40 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.75),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.55),transparent_50%)]" />

      <div className="mx-auto max-w-4xl space-y-4 relative">
        {/* HEADER */}
        <div>
          <p className="text-xs text-slate-600/70">Apotek • Pembelian</p>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Transaksi Pembelian
          </h1>
          <p className="text-sm text-slate-600/70">
            Pilih supplier, pilih obat, lalu simpan pembelian 💗
          </p>
        </div>

        {/* FORM CARD */}
        <div className="relative overflow-hidden rounded-3xl border border-pink-200/60 bg-white/60 backdrop-blur-xl p-5 shadow-[0_30px_90px_-55px_rgba(236,72,153,0.6)]">
          <RibbonEmote />

          <div className="grid gap-2 sm:grid-cols-3">
            <select
              className="rounded-xl border border-pink-200/70 bg-white/70 p-3 outline-none
              focus:ring-2 focus:ring-pink-300"
              value={supplierId}
              onChange={function (e) {
                setSupplierId(e.target.value);
              }}
            >
              <option value="">-- pilih supplier --</option>
              {suppliers.map(function (s) {
                return (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.phone})
                  </option>
                );
              })}
            </select>

            <select
              className="rounded-xl border border-pink-200/70 bg-white/70 p-3 outline-none
              focus:ring-2 focus:ring-pink-300"
              value={selectedId}
              onChange={function (e) {
                setSelectedId(e.target.value);
              }}
            >
              <option value="">-- pilih obat --</option>
              {meds.map(function (m) {
                return (
                  <option key={m.id} value={m.id}>
                    {m.name} (stok {m.stock})
                  </option>
                );
              })}
            </select>

            <button
              onClick={addItem}
              className="relative overflow-hidden rounded-xl p-3 text-white text-sm font-bold
              bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500
              shadow-[0_18px_60px_-35px_rgba(236,72,153,0.85)]
              hover:brightness-110 transition"
            >
              <span className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.65),transparent_45%)]" />
              + Tambah Item
            </button>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <input
              className="rounded-xl border border-pink-200/70 bg-white/70 p-3 outline-none
              focus:ring-2 focus:ring-pink-300"
              type="number"
              min="1"
              value={qty}
              onChange={function (e) {
                setQty(e.target.value);
              }}
              placeholder="Qty"
            />
            <input
              className="rounded-xl border border-pink-200/70 bg-white/70 p-3 outline-none
              focus:ring-2 focus:ring-pink-300"
              type="number"
              min="1"
              value={price}
              onChange={function (e) {
                setPrice(e.target.value);
              }}
              placeholder="Harga beli per item"
            />
          </div>
        </div>

        {/* DETAIL CARD */}
        <div className="relative overflow-hidden rounded-3xl border border-pink-200/60 bg-white/60 backdrop-blur-xl p-5 shadow-[0_30px_90px_-55px_rgba(236,72,153,0.6)]">
          <RibbonEmote />

          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold text-slate-900">
              Detail Pembelian
            </h2>
            <div className="text-xs text-slate-600/70">
              Total otomatis dihitung ✨
            </div>
          </div>

          <div className="mt-3">
            {cart.length === 0 ? (
              <p className="text-slate-500">Belum ada item</p>
            ) : (
              <div className="space-y-2">
                {cart.map(function (c, i) {
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 rounded-2xl
                      border border-pink-200/60 bg-white/60 p-3
                      shadow-[0_14px_45px_-40px_rgba(236,72,153,0.35)]"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">
                          {c.name}
                        </div>
                        <div className="text-sm text-slate-600/80">
                          {c.qty} x Rp {c.price} = Rp{" "}
                          {Number(c.qty) * Number(c.price)}
                        </div>
                      </div>
                      <button
                        onClick={function () {
                          removeItem(i);
                        }}
                        className="rounded-xl px-3 py-2 text-white text-xs font-bold
                        bg-gradient-to-r from-rose-500 to-pink-600
                        shadow-[0_16px_45px_-35px_rgba(244,63,94,0.95)]
                        hover:brightness-110 transition"
                      >
                        Hapus
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-lg font-extrabold text-slate-900">
              Total: <span className="text-pink-600">Rp {total}</span>
            </div>

            <button
              onClick={savePurchase}
              className="relative overflow-hidden rounded-xl px-4 py-3 text-white text-sm font-extrabold
              bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900
              shadow-[0_18px_60px_-35px_rgba(15,23,42,0.65)]
              hover:brightness-110 transition"
            >
              <span className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.55),transparent_45%)]" />
              Simpan Pembelian
            </button>
          </div>

          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-pink-200/70 to-transparent" />
          <div className="mt-3 text-xs text-slate-500">
            Note: Pastikan supplier dipilih sebelum menambah item ya 🎀
          </div>
        </div>
      </div>
    </div>
  );
}
