import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [[{ totalObat }]] = await db.query("SELECT COUNT(*) totalObat FROM medicines");

    const [[{ lowStock }]] = await db.query(
      "SELECT COUNT(*) lowStock FROM medicines WHERE stock <= 5"
    );

    const [[{ nearExpired }]] = await db.query(
      "SELECT COUNT(*) nearExpired FROM medicines WHERE expired_date >= CURDATE() AND expired_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)"
    );

    const [[{ salesToday }]] = await db.query(
      "SELECT COUNT(*) salesToday FROM sales WHERE DATE(date) = CURDATE()"
    );

    const [[{ purchasesToday }]] = await db.query(
      "SELECT COUNT(*) purchasesToday FROM purchases WHERE DATE(date) = CURDATE()"
    );

    return NextResponse.json({ totalObat, lowStock, nearExpired, salesToday, purchasesToday });
  } catch (err) {
    return NextResponse.json({ message: "Error", error: String(err) }, { status: 500 });
  }
}
