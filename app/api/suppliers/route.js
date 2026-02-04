import db from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/suppliers?page=1&limit=10&q=
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const q = (searchParams.get("q") || "").trim();

    const offset = (page - 1) * limit;

    const where = q ? "WHERE name LIKE ? OR phone LIKE ? OR address LIKE ?" : "";
    const params = q ? [`%${q}%`, `%${q}%`, `%${q}%`] : [];

    // total
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM suppliers ${where}`,
      params
    );
    const total = countRows[0]?.total || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // data
    const [rows] = await db.query(
      `SELECT * FROM suppliers ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      data: rows,
      pagination: { page, limit, total, totalPages },
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: String(err) },
      { status: 500 }
    );
  }
}

// POST /api/suppliers
export async function POST(req) {
  try {
    const { name, phone, address } = await req.json();

    if (!name) {
      return NextResponse.json(
        { message: "Nama supplier wajib diisi" },
        { status: 400 }
      );
    }

    await db.query(
      "INSERT INTO suppliers (name, phone, address) VALUES (?, ?, ?)",
      [name, phone || "", address || ""]
    );

    return NextResponse.json({ message: "Supplier berhasil ditambah" });
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: String(err) },
      { status: 500 }
    );
  }
}
