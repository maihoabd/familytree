"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Đăng nhập không thành công.");
      }

      setSuccess(true);
      // Đợi hiệu ứng thành công một chút rồi chuyển trang
      setTimeout(() => {
        router.push(callbackUrl);
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white border border-stone-200 rounded-2xl p-8 shadow-md space-y-6">
      <div className="text-center space-y-2">
        <div className="bg-stone-50 p-3.5 rounded-full inline-block border border-stone-200">
          <Lock className="h-6 w-6 text-[#8c1d1d]" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          Đăng Nhập Quản Trị Viên
        </h1>
        <p className="text-xs text-stone-500">
          Chỉ Quản trị viên của dòng họ mới có quyền sửa đổi gia phả.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-start gap-2.5">
          <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-xs flex items-start gap-2.5">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
          <p>Đăng nhập thành công! Đang chuyển hướng...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-600 uppercase tracking-wide flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-stone-400" />
            <span>Địa chỉ Email</span>
          </label>
          <input
            type="email"
            required
            disabled={loading}
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]/20 focus:border-[#8c1d1d]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-600 uppercase tracking-wide flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-stone-400" />
            <span>Mật khẩu</span>
          </label>
          <input
            type="password"
            required
            disabled={loading}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]/20 focus:border-[#8c1d1d]"
          />
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full bg-[#8c1d1d] hover:bg-[#701515] text-white py-3 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2 mt-6 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang xác thực...</span>
            </>
          ) : (
            <span>Đăng Nhập</span>
          )}
        </button>
      </form>

      <div className="border-t border-stone-100 pt-4 text-center">
        <p className="text-[10px] text-stone-400">
          Hãy liên hệ với Trưởng họ nếu bạn quên thông tin tài khoản được cấp.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] py-8">
      <Suspense fallback={
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#8c1d1d]" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
