import { prisma } from "@/lib/prisma";
import MembersListClient from "@/components/MembersListClient";
import { Users } from "lucide-react";
import { cookies } from "next/headers";
import { checkAdminSession } from "@/lib/auth";

export const revalidate = 0; // Đảm bảo luôn lấy danh sách mới nhất

export default async function MembersPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;
  const isAdmin = checkAdminSession(sessionToken);

  // Lấy toàn bộ danh sách thành viên sắp xếp theo đời và họ tên
  const members = await prisma.member.findMany({
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
            <Users className="h-8 w-8 text-[#8c1d1d]" />
            Danh Sách Thành Viên Dòng Họ
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Tra cứu thông tin, tìm kiếm, lọc theo chi nhánh và thế hệ đời dòng họ Phạm Hữu.
          </p>
        </div>
      </div>

      {/* Component danh sách có bộ lọc tìm kiếm */}
      <MembersListClient initialMembers={members} isAdmin={isAdmin} />
    </div>
  );
}
