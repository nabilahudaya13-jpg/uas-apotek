import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const id = params.id;
    const body = await req.json();
    const { code, name, category, price, stock, expired_date } = body;

    if (!code || !name) {
      return NextResponse.json(
        { message: "Kode dan Nama wajib diisi" },
        { status: 400 }
      );
    }

    await db.query(
      `UPDATE medicines
       SET code=?, name=?, category=?, price=?, stock=?, expired_date=?
       WHERE id=?`,
      [
        code || "",
        name,
        category || "",
        Number(price || 0),
        Number(stock || 0),
        expired_date || null,
        id,
      ]
    );

    return NextResponse.json({ message: "Obat berhasil diupdate ✅" });
  } catch (err) {
    return NextResponse.json(
      { message: "Error PUT medicines", error: String(err) },
      { status: 500 }
    );
  }
}

// ✅ SOFT DELETE (biar ga bentrok transaksi)
export async function DELETE(req, { params }) {
  try {
    const id = params.id;

    const [result] = await db.query(
      "UPDATE medicines SET is_deleted = 1 WHERE id = ?",
      [id]
    );

    if (!result || result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Data tidak ditemukan / tidak terhapus" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Obat berhasil dihapus ✅" });
  } catch (err) {
    return NextResponse.json(
      { message: "Error DELETE medicines", error: String(err) },
      { status: 500 }
    );
  }
}