import db from "@/lib/db";
import { NextResponse } from "next/server";

// POST /api/purchases
// body:
// { supplier_id: 1, items: [{ medicine_id: 1, qty: 2, price: 5000 }] }
export async function POST(req) {
  const conn = await db.getConnection();
  try {
    const { supplier_id, items } = await req.json();

    if (!supplier_id) {
      return NextResponse.json({ message: "Pilih supplier dulu" }, { status: 400 });
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Item pembelian kosong" }, { status: 400 });
    }

    // hitung total
    let total = 0;
    for (const it of items) {
      if (!it.medicine_id || Number(it.qty) <= 0 || Number(it.price) <= 0) {
        return NextResponse.json({ message: "Item tidak valid" }, { status: 400 });
      }
      total += Number(it.qty) * Number(it.price);
    }

    await conn.beginTransaction();

    // insert purchases (PAKAI date, bukan purchase_date)
    const [pRes] = await conn.query(
      "INSERT INTO purchases (supplier_id, date, total) VALUES (?, NOW(), ?)",
      [supplier_id, total]
    );
    const purchase_id = pRes.insertId;

    // insert details + update stok naik
    for (const it of items) {
      await conn.query(
        "INSERT INTO purchase_details (purchase_id, medicine_id, qty, price) VALUES (?, ?, ?, ?)",
        [purchase_id, it.medicine_id, it.qty, it.price]
      );

      await conn.query(
        "UPDATE medicines SET stock = stock + ? WHERE id = ?",
        [it.qty, it.medicine_id]
      );
    }

    await conn.commit();
    return NextResponse.json({ message: "Pembelian berhasil ✅", purchase_id, total });
  } catch (err) {
    try { await conn.rollback(); } catch {}
    return NextResponse.json({ message: "Error", error: String(err) }, { status: 500 });
  } finally {
    conn.release();
  }
}