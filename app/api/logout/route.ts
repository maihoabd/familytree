import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ." },
      { status: 500 }
    );
  }
}
