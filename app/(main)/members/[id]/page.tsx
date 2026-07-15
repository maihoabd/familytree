import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatLunarDate } from "@/lib/lunar";
import MemberActions from "@/components/MemberActions";
import { cookies } from "next/headers";
import { checkAdminSession } from "@/lib/auth";
import { 
  User, 
  Calendar, 
  MapPin, 
  BookOpen, 
  ArrowLeft, 
  ChevronRight, 
  Heart, 
  Users, 
  HeartHandshake
} from "lucide-react";

export const revalidate = 0;

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;
  const isAdmin = checkAdminSession(sessionToken);

  // 1. Lấy thông tin thành viên cùng bố mẹ và ngày giỗ
  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      deathAnniversary: true,
      father: true,
      mother: true,
    }
  });

  if (!member) {
    notFound();
  }

  // 2. Lấy danh sách vợ/chồng (từ bảng Marriage)
  const marriages = await prisma.marriage.findMany({
    where: {
      OR: [
        { member1Id: id },
        { member2Id: id }
      ]
    },
    include: {
      member1: true,
      member2: true,
    }
  });
  
  const spouses = marriages.map(m => m.member1Id === id ? m.member2 : m.member1);

  // 3. Lấy danh sách con cái
  const children = await prisma.member.findMany({
    where: {
      OR: [
        { fatherId: id },
        { motherId: id }
      ]
    },
    orderBy: [
      { birthDate: "asc" },
      { fullName: "asc" }
    ]
  });

  return (
    <div className="space-y-6">
      {/* Nút quay lại */}
      <div>
        <Link 
          href="/members" 
          className="inline-flex items-center text-xs font-semibold text-stone-500 hover:text-[#8c1d1d] transition-colors gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Quay lại danh sách thành viên</span>
        </Link>
      </div>

      {/* Grid thông tin chính */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cột trái: Ảnh thẻ, thông tin tóm tắt & các thao tác */}
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
            {/* Ảnh chân dung */}
            <div className={`w-36 h-36 rounded-full border-4 bg-stone-50 overflow-hidden flex items-center justify-center mb-4 ${
              member.gender === "MALE" ? "border-sky-500/30" : "border-pink-500/30"
            }`}>
              {member.photoUrl ? (
                <img 
                  src={member.photoUrl} 
                  alt={member.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-16 w-16 text-stone-300" />
              )}
            </div>

            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
              member.gender === "MALE" ? "bg-sky-50 text-sky-700 border border-sky-200" : "bg-pink-50 text-pink-700 border border-pink-200"
            }`}>
              Thế hệ Đời thứ {member.generation}
            </span>

            <h2 className="font-serif text-2xl font-bold text-stone-900 mt-2">
              {member.fullName}
            </h2>

            {member.branch && (
              <p className="text-xs text-[#8c1d1d] font-bold mt-1 uppercase tracking-wide">
                {member.branch}
              </p>
            )}

            <div className="mt-4 border-t border-stone-100 pt-4 w-full text-xs text-stone-500 space-y-2 text-left">
              {member.isDead ? (
                <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5 flex items-center justify-center gap-1.5 text-stone-700 font-medium">
                  <span>✝ Đã tạ thế</span>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 flex items-center justify-center gap-1.5 text-emerald-700 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Hiện đang còn sống</span>
                </div>
              )}
            </div>

            {/* Bộ điều khiển hành động chỉnh sửa/xóa */}
            {isAdmin && (
              <div className="border-t border-stone-100 pt-5 mt-5 w-full">
                <MemberActions memberId={member.id} memberName={member.fullName} />
              </div>
            )}
          </div>
        </div>

        {/* Cột giữa & phải: Liên kết gia đình & thông tin chi tiết */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Thông tin sự sống (Sinh lão bệnh tử) */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3 mb-5">
              Thông Tin Cá Nhân
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Ngày sinh */}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-stone-400 font-bold block uppercase tracking-wide">Ngày sinh</span>
                  <p className="text-sm font-medium text-stone-800">
                    {member.birthDate 
                      ? new Date(member.birthDate).toLocaleDateString("vi-VN") 
                      : "Chưa cập nhật dương lịch"}
                  </p>
                  {member.birthDateLunar && (
                    <p className="text-xs text-emerald-700 font-medium mt-0.5">
                      Âm lịch: {member.birthDateLunar}
                    </p>
                  )}
                </div>
              </div>

              {/* Nơi sinh */}
              {member.placeOfBirth && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-stone-400 font-bold block uppercase tracking-wide">Quê quán / Nơi sinh</span>
                    <p className="text-sm font-medium text-stone-800">{member.placeOfBirth}</p>
                  </div>
                </div>
              )}

              {/* Ngày mất */}
              {member.isDead && (
                <>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-stone-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs text-stone-400 font-bold block uppercase tracking-wide">Ngày tạ thế</span>
                      <p className="text-sm font-medium text-stone-800">
                        {member.deathDate 
                          ? new Date(member.deathDate).toLocaleDateString("vi-VN") 
                          : "Chưa cập nhật dương lịch"}
                      </p>
                      {member.deathDateLunar && (
                        <p className="text-xs text-stone-600 font-medium mt-0.5">
                          Âm lịch: {member.deathDateLunar}
                        </p>
                      )}
                    </div>
                  </div>

                  {member.placeOfBurial && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs text-stone-400 font-bold block uppercase tracking-wide">Nơi an táng</span>
                        <p className="text-sm font-medium text-stone-800">{member.placeOfBurial}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Chi tiết cúng giỗ */}
            {member.isDead && member.deathAnniversary && (
              <div className="mt-6 p-4 bg-[#8c1d1d]/5 border border-[#8c1d1d]/20 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-[#8c1d1d] uppercase tracking-wider block">Ngày Kỵ Nhật</span>
                <p className="text-sm font-medium text-stone-800">
                  Hàng năm vào ngày: <strong className="text-[#8c1d1d]">{formatLunarDate(member.deathAnniversary.lunarMonth, member.deathAnniversary.lunarDay, member.deathAnniversary.isLeapMonth)} (Âm lịch)</strong>
                </p>
                {member.deathAnniversary.note && (
                  <p className="text-xs text-stone-500 italic pt-1 border-t border-stone-100">
                    Ghi chú giỗ chạp: {member.deathAnniversary.note}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Mối quan hệ gia hệ (Phả hệ ngang dọc) */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
              Mối Quan Hệ Gia Hệ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Cha & Mẹ */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>Cha & Mẹ</span>
                </h4>
                
                <div className="space-y-2">
                  {/* Bố */}
                  <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-xs text-stone-500">Cha (Bố):</span>
                    {member.father ? (
                      <Link href={`/members/${member.fatherId}`} className="text-xs font-bold text-[#8c1d1d] hover:underline flex items-center">
                        <span>{member.father.fullName}</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    ) : (
                      <span className="text-xs text-stone-400 italic">Không rõ hoặc Thủy tổ</span>
                    )}
                  </div>
                  {/* Mẹ */}
                  <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-xs text-stone-500">Mẹ (U):</span>
                    {member.mother ? (
                      <Link href={`/members/${member.motherId}`} className="text-xs font-bold text-[#8c1d1d] hover:underline flex items-center">
                        <span>{member.mother.fullName}</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    ) : (
                      <span className="text-xs text-stone-400 italic">Không rõ hoặc Thủy tổ</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Bạn đời (Vợ / Chồng) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HeartHandshake className="h-4 w-4" />
                  <span>Vợ / Chồng (Hôn phối)</span>
                </h4>

                {spouses.length === 0 ? (
                  <p className="text-xs text-stone-400 italic p-3 bg-stone-50 rounded-xl border border-stone-100 text-center">
                    Chưa kết hôn hoặc chưa cập nhật.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {spouses.map(spouse => (
                      <div key={spouse.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                        <span className="text-xs text-stone-500">Bạn đời:</span>
                        <Link href={`/members/${spouse.id}`} className="text-xs font-bold text-[#ffd700] bg-[#8c1d1d] px-2.5 py-1 rounded-md hover:opacity-90 flex items-center gap-0.5">
                          <span>{spouse.fullName}</span>
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Con cái */}
            <div className="space-y-3 border-t border-stone-100 pt-6">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="h-4 w-4" />
                <span>Con cái ({children.length})</span>
              </h4>

              {children.length === 0 ? (
                <p className="text-xs text-stone-400 italic p-3 bg-stone-50 rounded-xl border border-stone-100 text-center">
                  Không có con hoặc chưa cập nhật.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {children.map(child => (
                    <div key={child.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-stone-900">{child.fullName}</span>
                        <span className="text-[10px] text-stone-400">Đời {child.generation} • {child.gender === "MALE" ? "Nam" : "Nữ"}</span>
                      </div>
                      <Link href={`/members/${child.id}`} className="text-[10px] font-bold text-[#8c1d1d] hover:underline flex items-center">
                        <span>Chi tiết</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tiểu sử cuộc đời */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3 mb-4 flex items-center gap-1.5">
              <BookOpen className="h-5 w-5 text-stone-500" />
              Tiểu Sử & Sự Nghiệp
            </h3>
            
            <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap font-serif">
              {member.biography || "Thông tin lược sử cuộc đời thành viên này chưa được ghi chép lại đầy đủ."}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
