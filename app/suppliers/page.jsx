"use client";

import { useEffect, useState } from "react";

export default function SuppliersPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);

  async function fetchSuppliers(page = 1, limit = pagination.limit, query = q) {
    setLoading(true);
    try {
      const res = await fetch(`/api/suppliers?page=${page}&limit=${limit}&q=${encodeURIComponent(query)}`);
      const json = await res.json();
      setData(json.data || []);
      setPagination(json.pagination || { page: 1, limit, total: 0, totalPages: 1 });
    } catch (e) {
      setData([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchSuppliers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setForm({ name: "", phone: "", address: "" });
    setEditingId(null);
    setMode("create");
  }

  function openCreate() {
    resetForm();
    setOpen(true);
  }

  function openEdit(item) {
    setMode("edit");
    setEditingId(item.id);
    setForm({ name: item.name || "", phone: item.phone || "", address: item.address || "" });
    setOpen(true);
  }

  async function submitForm(e) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Nama supplier wajib diisi");
      return;
    }

    try {
      if (mode === "create") {
        const res = await fetch("/api/suppliers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          alert(j.message || "Gagal tambah");
          return;
        }
        alert("Supplier berhasil ditambah");
      } else {
        const res = await fetch(`/api/suppliers/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          alert(j.message || "Gagal update");
          return;
        }
        alert("Supplier berhasil diupdate");
      }

      setOpen(false);
      resetForm();
      fetchSuppliers(pagination.page);
    } catch (err) {
      alert("Error: " + String(err));
    }
  }

  async function handleDelete(id) {
    if (!confirm("Yakin mau hapus supplier ini?")) return;
    

    try {
      const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(j.message || "Gagal hapus");
        return;
      }
      alert("berhasil dihapus");
      fetchSuppliers(pagination.page);
    } catch (err) {
      alert("Error: " + String(err));
    }
  }

  function handleSearch() {
    fetchSuppliers(1, pagination.limit, q);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Supplier</h1>
          <p className="text-sm text-slate-500">CRUD + search + pagination</p>
        </div>

        <button
          onClick={openCreate}
          className="rounded-xl bg-pink-600 text-white px-4 py-2 text-sm font-bold hover:bg-pink-700"
        >
          + Tambah Supplier
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <input
          className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-pink-200"
          placeholder="Cari nama / telp / alamat..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="rounded-xl border px-4 py-2 font-semibold hover:bg-pink-50"
        >
          Cari
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        <div className="p-3 border-b text-sm text-slate-600">
          {loading ? "Loading..." : `Total: ${pagination.total} data`}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-pink-50">
              <tr>
                <th className="p-3 text-left">Nama</th>
                <th className="p-3 text-left">Telepon</th>
                <th className="p-3 text-left">Alamat</th>
                <th className="p-3 text-left">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td className="p-3 text-slate-500" colSpan={4}>
                    Belum ada data supplier
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-3 font-semibold">{item.name}</td>
                    <td className="p-3">{item.phone}</td>
                    <td className="p-3">{item.address}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="rounded-lg border px-3 py-1 hover:bg-pink-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteSupplier(item.id)}
                        className="rounded-lg bg-rose-600 text-white px-3 py-1 hover:bg-rose-700"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-3 border-t">
          <p className="text-xs text-slate-500">
            Page {pagination.page} / {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchSuppliers(pagination.page - 1, pagination.limit, q)}
              className="rounded-lg border px-3 py-1 disabled:opacity-50 hover:bg-pink-50"
            >
              Prev
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchSuppliers(pagination.page + 1, pagination.limit, q)}
              className="rounded-lg border px-3 py-1 disabled:opacity-50 hover:bg-pink-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 border shadow">
            <h2 className="text-lg font-extrabold text-slate-900">
              {mode === "create" ? "Tambah Supplier" : "Edit Supplier"}
            </h2>

            <form onSubmit={submitForm} className="mt-4 space-y-3">
              <input
                className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-pink-200"
                placeholder="Nama supplier"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-pink-200"
                placeholder="Telepon"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <textarea
                className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-pink-200"
                placeholder="Alamat"
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setOpen(false); resetForm(); }}
                  className="rounded-xl border px-4 py-2 font-semibold hover:bg-pink-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-pink-600 text-white px-4 py-2 font-bold hover:bg-pink-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
