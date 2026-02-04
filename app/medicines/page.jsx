"use client";

import { useEffect, useState } from "react";

const emptyForm = {
  id: null,
  code: "",
  name: "",
  category: "",
  price: "",
  stock: "",
  expired_date: "",
};

export default function MedicinesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("add"); // add | edit
  const [form, setForm] = useState(emptyForm);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/medicines?page=1&limit=50&q=", {
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(json.message || "Gagal load medicines");
      setLoading(false);
      return;
    }

    setItems(json.data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openAdd() {
    setMode("add");
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(item) {
    setMode("edit");
    setForm({
      ...item,
      price: String(item.price ?? ""),
      stock: String(item.stock ?? ""),
      expired_date: item.expired_date
        ? String(item.expired_date).slice(0, 10)
        : "",
    });
    setOpen(true);
  }

  async function save(e) {
    e.preventDefault();

    if (!form.code || !form.name) {
      alert("Kode & Nama wajib diisi");
      return;
    }

    const payload = {
      code: form.code,
      name: form.name,
      category: form.category,
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
      expired_date: form.expired_date || null,
    };

    if (mode === "add") {
      const res = await fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) return alert(json.message || "Gagal tambah obat");
    } else {
      const res = await fetch('/api/medicines/${form.id}', {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) return alert(json.message || "Gagal update obat");
    }

    setOpen(false);
    setForm(emptyForm);
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Yakin hapus obat ini?")) return;

    const res = await fetch('/api/medicines/${id}', {
      method: "DELETE",
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) return alert(json.message || "Gagal hapus");

    alert("Berhasil hapus");
    load();
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Data Obat</h1>

          <button
            onClick={openAdd}
            className="rounded bg-emerald-600 px-4 py-2 text-white"
          >
            + Tambah Obat
          </button>
        </div>

        <table className="w-full border bg-white">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 border">Kode</th>
              <th className="p-2 border">Nama</th>
              <th className="p-2 border">Kategori</th>
              <th className="p-2 border">Harga</th>
              <th className="p-2 border">Stok</th>
              <th className="p-2 border">Expired</th>
              <th className="p-2 border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x.id} className="border-t">
                <td className="p-2 border">{x.code}</td>
                <td className="p-2 border">{x.name}</td>
                <td className="p-2 border">{x.category}</td>
                <td className="p-2 border">Rp {x.price}</td>
                <td className="p-2 border">{x.stock}</td>
                <td className="p-2 border">
                  {x.expired_date ? String(x.expired_date).slice(0, 10) : "-"}
                </td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => openEdit(x)}
                    className="rounded bg-sky-600 px-3 py-1 text-white"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(x.id)}
                    className="rounded bg-red-600 px-3 py-1 text-white"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-slate-500">
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {open && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <form
              onSubmit={save}
              className="w-[420px] rounded bg-white p-4 space-y-2"
            >
              <h2 className="font-bold">
                {mode === "add" ? "Tambah" : "Edit"} Obat
              </h2>

              <input
                className="w-full border p-2"
                placeholder="Kode"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
              <input
                className="w-full border p-2"
                placeholder="Nama"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="w-full border p-2"
                placeholder="Kategori"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <input
                className="w-full border p-2"
                placeholder="Harga"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <input
                className="w-full border p-2"
                placeholder="Stok"
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
              <input
                className="w-full border p-2"
                type="date"
                value={form.expired_date}
                onChange={(e) =>
                  setForm({ ...form, expired_date: e.target.value })
                }
              />

              <div className="flex gap-2 pt-2">
                <button className="rounded bg-emerald-600 px-3 py-1 text-white">
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded border px-3 py-1"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}