import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MemberForm from "@/components/MemberForm";
import { Edit } from "lucide-react";

export const revalidate = 0;

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Lấy thông tin thành viên muốn sửa kèm ngày giỗ
  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      deathAnniversary: true,
    }
  });

  if (!member) {
    notFound();
  }

  // 2. Lấy danh sách ID vợ/chồng cũ từ bảng Marriage
  const marriages = await prisma.marriage.findMany({
    where: {
      OR: [
        { member1Id: id },
        { member2Id: id }
      ]
    }
  });
  
  const spouseIds = marriages.map(m => m.member1Id === id ? m.member2Id : m.member1Id);

  // 3. Lấy danh sách toàn bộ thành viên dòng họ phục vụ liên kết phả hệ
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

  // Định dạng dữ liệu tương thích với MemberFormProps
  const formattedInitialData = {
    ...member,
    birthDate: member.birthDate ? member.birthDate.toISOString() : null,
    deathDate: member.deathDate ? member.deathDate.toISOString() : null,
    spouses: spouseIds,
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="border-b border-stone-200 pb-5">
        <h1 className="font-serif text-3xl font-bold text-stone-900 flex items-center gap-2.5">
          <Edit className="h-8 w-8 text-[#8c1d1d]" />
          Chỉnh Sửa Thành Viên Gia Phả
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Cập nhật thông tin chi tiết cho thành viên <strong className="text-stone-900">{member.fullName}</strong>.
        </p>
      </div>

      {/* Form chỉnh sửa thành viên */}
      <MemberForm 
        initialData={formattedInitialData} 
        allMembers={allMembers} 
      />
    </div>
  );
}
