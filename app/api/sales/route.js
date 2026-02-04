import db from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/sales  (lihat list penjualan)
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT s.*, u.name AS cashier_name
      FROM sales s
      LEFT JOIN users u ON u.id = s.user_id
      ORDER BY s.id DESC
    `);

    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: String(err) },
      { status: 500 }
    );
  }
}

// POST /api/sales (buat penjualan + stok berkurang)
export async function POST(req) {
  try {
    const { user_id, items } = await req.json();

    if (!user_id || !items || items.length === 0) {
      return NextResponse.json(
        { message: "Data penjualan tidak lengkap" },
        { status: 400 }
      );
    }

    // hitung total
    let total = 0;
    for (const item of items) {
      total += Number(item.price) * Number(item.qty);
    }

    // 1) insert ke sales
    const [result] = await db.query(
      "INSERT INTO sales (user_id, date, total) VALUES (?, NOW(), ?)",
      [user_id, total]
    );

    const saleId = result.insertId;

    // 2) insert sale_details + update stok (KURANGI)
    for (const item of items) {
      const { medicine_id, qty, price } = item;

      // cek stok dulu biar ga minus
      const [med] = await db.query(
        "SELECT stock FROM medicines WHERE id = ?",
        [medicine_id]
      );

      if (!med.length) {
        return NextResponse.json(
          { message: "Obat tidak ditemukan" },
          { status: 404 }
        );
      }

      if (Number(med[0].stock) < Number(qty)) {
        return NextResponse.json(
          { message: "Stok tidak cukup" },
          { status: 400 }
        );
      }

      await db.query(
        `INSERT INTO sale_details (sale_id, medicine_id, qty, price)
         VALUES (?, ?, ?, ?)`,
        [saleId, medicine_id, qty, price]
      );

      // ⬇️ stok obat TURUN
      await db.query(
        "UPDATE medicines SET stock = stock - ? WHERE id = ?",
        [qty, medicine_id]
      );
    }

    return NextResponse.json({ message: "Penjualan berhasil", saleId, total });
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: String(err) },
      { status: 500 }
    );
  }
}
