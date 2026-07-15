import { prisma } from "@/lib/prisma";
import MemberForm from "@/components/MemberForm";
import { UserPlus } from "lucide-react";

export const revalidate = 0;

export default async function NewMemberPage() {
  // Lấy toàn bộ thành viên phục vụ liên kết cha mẹ, vợ chồng
  const allMembers = await prisma.member.findMany({
    select: {
      id: true,
      fullName: true,
      gender: true,
      generation: true,
      branch: true,
      birthDate: true,
      birthDateLunar: true,
      deathDate: true,
      deathDateLunar: true,
      isDead: true,
      biography: true,
      photoUrl: true,
      placeOfBirth: true,
      placeOfBurial: true,
      fatherId: true,
      motherId: true,
    },
    orderBy: [
      { generation: "asc" },
      { fullName: "asc" }
    ]
  });

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="border-b border-stone-200 pb-5">
        <h1 className="font-serif text-3xl font-bold text-stone-900 flex items-center gap-2.5">
          <UserPlus className="h-8 w-8 text-[#8c1d1d]" />
          Thêm Thành Viên Vào Gia Phả
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Khai báo thông tin chi tiết của thành viên mới bao gồm liên kết cha mẹ, vợ/chồng và tiểu sử kỵ nhật.
        </p>
      </div>

      {/* Form thành viên */}
      <MemberForm allMembers={allMembers} />
    </div>
  );
}
