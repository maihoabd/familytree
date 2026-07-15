import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Kiểm tra thông tin đăng nhập Admin
    if (email === "pdanghai@gmail.com" && password === "10101988Hn@") {
      const token = signToken({
        email: "pdanghai@gmail.com",
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // Hạn dùng 7 ngày
      });

      const cookieStore = await cookies();
      cookieStore.set("admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 ngày
        path: "/",
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Email hoặc mật khẩu không chính xác." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ." },
      { status: 500 }
    );
  }
}
