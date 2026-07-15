"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Trash2, AlertTriangle } from "lucide-react";

interface MemberActionsProps {
  memberId: string;
  memberName: string;
}

export default function MemberActions({ memberId, memberName }: MemberActionsProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Không thể xóa thành viên");
      }

      // Xóa thành công, quay lại danh sách
      router.push("/members");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-start gap-2.5">
          <AlertTriangle className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Lỗi khi xóa:</strong>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href={`/members/${memberId}/edit`}
          className="flex-grow bg-[#8c1d1d] hover:bg-[#701515] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 shadow-sm border border-[#ffd700]/20"
        >
          <Edit className="h-4 w-4" />
          <span>Chỉnh Sửa Thông Tin</span>
        </Link>

        <button
          onClick={() => setShowConfirm(true)}
          className="bg-white hover:bg-red-50 border border-red-200 text-red-600 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
        >
          <Trash2 className="h-4 w-4" />
          <span>Xóa</span>
        </button>
      </div>

      {/* Modal/Dialog xác nhận xóa */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Xác Nhận Xóa Thành Viên?
            </h3>
            
            <p className="text-xs text-stone-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa thành viên <strong className="text-stone-950 font-bold">{memberName}</strong> khỏi hệ thống phả hệ không? 
              Hành động này <strong className="text-red-600">không thể hoàn tác</strong> và sẽ xóa bỏ toàn bộ thông tin quan hệ gia phả liên quan.
            </p>

            <div className="flex gap-3 justify-end pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setShowConfirm(false)}
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 py-2 px-4 rounded-lg text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
