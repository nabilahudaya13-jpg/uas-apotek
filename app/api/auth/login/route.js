import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const [rows] = await db.query(
      "SELECT id, name, email FROM users WHERE email=? AND password=? LIMIT 1",
      [email, password]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "Login gagal" }, { status: 401 });
    }

    const user = rows[0];
    const res = NextResponse.json({ message: "Login berhasil", user });

    // cookie sederhana (buat UAS aman & gampang)
    res.cookies.set("token", "loggedin", { httpOnly: true, path: "/" });
    res.cookies.set("user", JSON.stringify(user), { httpOnly: true, path: "/" });

    return res;
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: String(err) },
      { status: 500 }
    );
  }
}

