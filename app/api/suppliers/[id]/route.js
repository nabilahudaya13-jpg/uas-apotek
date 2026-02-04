import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const id = params.id;
    const { name, phone, address } = await req.json();

    if (!name) {
      return NextResponse.json({ message: "Nama wajib" }, { status: 400 });
    }

    await db.query(
      "UPDATE suppliers SET name=?, phone=?, address=? WHERE id=?",
      [name, phone || "", address || "", id]
    );

    return NextResponse.json({ message: "Supplier berhasil diupdate ✅" });
  } catch (err) {
    return NextResponse.json({ message: "Error", error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const id = params.id;
    await db.query("DELETE FROM suppliers WHERE id=?", [id]);
    return NextResponse.json({ message: "Supplier berhasil dihapus ✅" });
  } catch (err) {
    return NextResponse.json(
      { message: "Gagal hapus (mungkin kepake di purchases)", error: String(err) },
      { status: 500 }
    );
  }
}