"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Lỗi sập trang Next.js (Runtime Exception):", error);
  }, [error]);

  // Kiểm tra xem có phải lỗi do cơ sở dữ liệu / Prisma hay không
  const isDatabaseError = 
    error.message?.includes("database") || 
    error.message?.includes("Prisma") || 
    error.stack?.includes("Prisma") ||
    error.message?.includes("connection") ||
    error.message?.includes("parsing connection string") ||
    error.message?.includes("SSL") ||
    error.message?.includes("P1001") ||
    error.message?.includes("P2002");

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 py-12 text-center bg-amber-50/10 border border-dashed border-stone-200 rounded-2xl max-w-2xl mx-auto my-10 space-y-6 shadow-sm">
      <div className="bg-red-50 p-4 rounded-full border border-red-100">
        <AlertTriangle className="h-12 w-12 text-red-600" />
      </div>

      <div className="space-y-2">
        <h2 className="font-serif text-2xl font-bold text-stone-900">
          Không Thể Kết Nối Cơ Sở Dữ Liệu!
        </h2>
        {isDatabaseError ? (
          <p className="text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
            Hệ thống không thể thiết lập kết nối tới cơ sở dữ liệu dòng họ trên Supabase. <br />
            Điều này xảy ra do biến cấu hình <code className="bg-stone-100 text-red-600 px-1.5 py-0.5 rounded font-mono text-xs">DATABASE_URL</code> trên Vercel chưa khớp hoặc bị chặn kết nối IPv4.
          </p>
        ) : (
          <p className="text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
            Đã xảy ra lỗi không mong muốn trong quá trình tải dữ liệu trang. Vui lòng thử lại.
          </p>
        )}
      </div>

      {isDatabaseError && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-left text-xs text-stone-500 space-y-2 w-full max-w-lg">
          <strong className="text-stone-700 font-bold block mb-1">Cách khắc phục sự cố:</strong>
          <p>
            1. Đảm bảo biến <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">DATABASE_URL</code> trong **Vercel Settings** đang dùng cổng Pooler **`6543`** (để Vercel kết nối dạng IPv4).
          </p>
          <p>
            2. Kiểm tra mật khẩu của bạn đã được mã hóa URL (ví dụ: <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">$</code> chuyển thành <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">%24</code> và <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">*</code> chuyển thành <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">%2A</code>).
          </p>
          <p>
            3. Đảm bảo bạn đã chạy thành công lệnh <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">npx prisma migrate deploy</code> để đồng bộ hóa cấu trúc bảng từ local lên Supabase.
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="bg-[#8c1d1d] hover:bg-[#701515] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Thử tải lại trang</span>
        </button>
        <Link
          href="/"
          className="bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <Home className="h-4 w-4" />
          <span>Quay lại Trang chủ</span>
        </Link>
      </div>
    </div>
  );
}
