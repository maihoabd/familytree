import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkAdminSession } from "@/lib/auth";

export const revalidate = 0; // Đảm bảo không bị cache kết quả session

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session")?.value;
    const isAdmin = checkAdminSession(sessionToken);
    return NextResponse.json({ loggedIn: isAdmin });
  } catch (error) {
    return NextResponse.json({ loggedIn: false }, { status: 500 });
  }
}
