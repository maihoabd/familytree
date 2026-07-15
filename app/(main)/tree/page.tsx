import { prisma } from "@/lib/prisma";
import TreeViewer from "@/components/family-tree/TreeViewer";
import { GitBranch } from "lucide-react";

export const revalidate = 0; // Đảm bảo lấy dữ liệu mới nhất khi cập nhật gia phả

export default async function TreePage() {
  // Lấy toàn bộ danh sách thành viên cùng các quan hệ phục vụ vẽ cây
  const members = await prisma.member.findMany({
    include: {
      deathAnniversary: {
        select: {
          lunarDay: true,
          lunarMonth: true,
          note: true
        }
      },
      marriagesAsMember1: {
        include: {
          member2: {
            select: { id: true, fullName: true, gender: true }
          }
        }
      },
      marriagesAsMember2: {
        include: {
          member1: {
            select: { id: true, fullName: true, gender: true }
          }
        }
      }
    },
    orderBy: [
      { generation: "asc" },
      { fullName: "asc" }
    ]
  });

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900 flex items-center gap-2.5">
            <GitBranch className="h-8 w-8 text-[#8c1d1d]" />
            Sơ Đồ Phả Hệ Trực Quan
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Hệ thống cây gia tộc Phạm Hữu. Giữ chuột trái để kéo (Pan), cuộn chuột để thu phóng (Zoom), click vào thành viên để xem tiểu sử chi tiết.
          </p>
        </div>
      </div>

      {/* Bộ hiển thị cây SVG */}
      <TreeViewer initialMembers={members} />
    </div>
  );
}
