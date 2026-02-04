import db from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/medicines?page=1&limit=10&q=
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const q = (searchParams.get("q") || "").trim();

    const offset = (page - 1) * limit;

    // ✅ filter soft delete + optional search
    const where = q
      ? "WHERE is_deleted = 0 AND (code LIKE ? OR name LIKE ?)"
      : "WHERE is_deleted = 0";

    const params = q ? ['%${q}%, %${q}%'] : [];

    const [rows] = await db.query(
      `
      SELECT id, code, name, category, price, stock, expired_date, is_deleted
      FROM medicines
      ${where}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const [countRows] = await db.query(
      `
      SELECT COUNT(*) as total
      FROM medicines
      ${where}
      `,
      params
    );

    const total = countRows[0]?.total || 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
      data: rows,
      pagination: { page, limit, total, totalPages },
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Error GET medicines", error: String(err) },
      { status: 500 }
    );
  }
}

// POST /api/medicines
export async function POST(req) {
  try {
    const body = await req.json();
    const { code, name, category, price, stock, expired_date } = body;

    if (!code || !name) {
      return NextResponse.json(
        { message: "Kode dan Nama wajib diisi" },
        { status: 400 }
      );
    }

    // ✅ pastikan is_deleted ada (default 0)
    const [result] = await db.query(
      `INSERT INTO medicines (code, name, category, price, stock, expired_date, is_deleted)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [
        code,
        name,
        category || "",
        Number(price || 0),
        Number(stock || 0),
        expired_date || null,
      ]
    );

    return NextResponse.json(
      { message: "Obat berhasil ditambahkan ✅", id: result.insertId },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Error POST medicines", error: String(err) },
      { status: 500 }
    );
  }
}