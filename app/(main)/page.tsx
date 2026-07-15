import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUpcomingAnniversaries, formatLunarDate } from "@/lib/lunar";
import { 
  Users, 
  Layers, 
  Calendar, 
  UserCheck, 
  Compass, 
  ChevronRight, 
  Award, 
  Flame,
  MessageSquare
} from "lucide-react";

export const revalidate = 0; // Luôn lấy dữ liệu mới nhất

export default async function HomePage() {
  // 1. Lấy thông tin dòng họ
  const family = await prisma.family.findFirst();
  const familyName = family?.name || "Nguyễn Tộc";
  const familyOrigin = family?.origin || "Hành Thiện, Xuân Trường, Nam Định";
  const familyDesc = family?.description || "Lịch sử dòng họ đang được ghi chép và cập nhật.";

  // 2. Lấy toàn bộ thành viên để làm thống kê
  const members = await prisma.member.findMany({
    include: {
      deathAnniversary: true
    }
  });

  // Tính toán số liệu thống kê
  const totalCount = members.length;
  const livingCount = members.filter(m => !m.isDead).length;
  const deadCount = members.filter(m => m.isDead).length;
  const maxGen = members.reduce((max, m) => m.generation > max ? m.generation : max, 0);
  const maleCount = members.filter(m => m.gender === "MALE").length;
  const femaleCount = members.filter(m => m.gender === "FEMALE").length;

  // 3. Tính toán 30 ngày giỗ sắp tới
  const deceasedWithAnniversaries = members
    .filter(m => m.isDead && m.deathAnniversary)
    .map(m => ({
      id: m.id,
      fullName: m.fullName,
      gender: m.gender,
      generation: m.generation,
      photoUrl: m.photoUrl,
      branch: m.branch,
      deathAnniversary: {
        lunarMonth: m.deathAnniversary!.lunarMonth,
        lunarDay: m.deathAnniversary!.lunarDay,
        isLeapMonth: m.deathAnniversary!.isLeapMonth,
        note: m.deathAnniversary!.note,
        reminderDaysBefore: m.deathAnniversary!.reminderDaysBefore,
      }
    }));

  const upcomingAnniversaries = getUpcomingAnniversaries(deceasedWithAnniversaries, new Date(), 30);

  return (
    <div className="space-y-10">
      {/* Banner Chào mừng dòng họ mang phong cách truyền thống cổ kính */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#8c1d1d] to-[#5c1010] rounded-3xl text-white shadow-xl border border-[#ffd700]/30 py-12 px-6 sm:px-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffd700]/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl -ml-40 -mb-40"></div>
        
        <div className="relative max-w-3xl space-y-6">
          <div className="flex items-center space-x-3">
            <Award className="h-10 w-10 text-[#ffd700] animate-pulse" />
            <span className="text-[#ffd700] text-xs font-bold tracking-widest uppercase">
              Bản Sắc Dòng Họ
            </span>
          </div>
          
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-wide leading-tight">
            Chào Mừng Đến Với Website <br className="hidden sm:inline" />
            <span className="text-[#ffd700]">Gia Phả {familyName}</span>
          </h1>
          
          <p className="text-gray-200 text-sm sm:text-base leading-relaxed font-light">
            {familyDesc}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
            <div className="flex items-center space-x-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/10">
              <Compass className="h-4 w-4 text-[#ffd700]" />
              <span>Khởi tổ quê quán: <strong>{familyOrigin}</strong></span>
            </div>
          </div>
          
          <div className="pt-4 flex flex-wrap gap-4">
            <Link 
              href="/tree" 
              className="bg-[#ffd700] text-[#8c1d1d] hover:bg-[#ffe54d] px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-all flex items-center space-x-2"
            >
              <span>Xem Sơ Đồ Cây Phả Hệ</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link 
              href="/members/new" 
              className="bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
            >
              Thêm Thành Viên
            </Link>
          </div>
        </div>
      </section>

      {/* Grid thống kê & Danh sách ngày giỗ sắp tới */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cột Trái & Giữa: Lịch giỗ 30 ngày tới & các mục phụ */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card Lịch Giỗ Sắp Tới */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
              <div className="flex items-center space-x-2.5">
                <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                  <Flame className="h-5 w-5 text-[#8c1d1d]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Kỵ Nhật Sắp Tới (30 ngày tới)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Tưởng nhớ ngày giỗ tổ tiên âm lịch quy đổi dương lịch hàng năm
                  </p>
                </div>
              </div>
              <Link 
                href="/anniversaries" 
                className="text-xs text-[#8c1d1d] hover:text-[#5c1010] font-bold flex items-center"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {upcomingAnniversaries.length === 0 ? (
              <div className="text-center py-10 bg-amber-50/20 rounded-xl border border-dashed border-amber-200/60">
                <Calendar className="h-10 w-10 text-stone-300 mx-auto mb-2" />
                <p className="text-stone-500 text-sm font-medium">Không có ngày giỗ nào trong 30 ngày tới.</p>
                <p className="text-stone-400 text-xs mt-1">Hệ thống sẽ tự động cập nhật lịch âm dương mỗi ngày.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAnniversaries.map((item) => (
                  <div 
                    key={item.memberId} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-stone-100 hover:border-[#ffd700]/30 hover:bg-amber-50/10 transition-all shadow-sm"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Avatar đại diện */}
                      <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 border border-stone-200 overflow-hidden flex-shrink-0">
                        {item.photoUrl ? (
                          <img src={item.photoUrl} alt={item.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-serif font-bold text-stone-500">✝</span>
                        )}
                      </div>
                      
                      {/* Tên & Ngày giỗ âm lịch */}
                      <div>
                        <Link href={`/members/${item.memberId}`} className="font-serif font-bold text-stone-900 hover:text-[#8c1d1d] transition-colors">
                          {item.fullName}
                        </Link>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Đời thứ {item.generation} • {item.branch || "Ngành gốc"}
                        </p>
                        <p className="text-xs font-semibold text-amber-700 mt-1 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded w-max">
                          Âm lịch: {formatLunarDate(item.lunarMonth, item.lunarDay, item.isLeapMonth)}
                        </p>
                      </div>
                    </div>

                    {/* Ngày giỗ dương lịch quy đổi */}
                    <div className="flex sm:flex-col items-start sm:items-end justify-between border-t sm:border-t-0 border-stone-100 pt-2 sm:pt-0">
                      <span className="text-xs text-stone-500 sm:text-right">Dương lịch năm nay:</span>
                      <strong className="text-stone-950 font-mono text-sm mt-0.5">
                        {item.solarDate.toLocaleDateString("vi-VN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </strong>
                      
                      {/* Badge đếm ngược ngày */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${
                        item.daysRemaining === 0 
                          ? "bg-red-100 text-red-700 animate-pulse" 
                          : item.daysRemaining <= 3 
                            ? "bg-amber-100 text-amber-700" 
                            : "bg-stone-100 text-stone-700"
                      }`}>
                        {item.daysRemaining === 0 ? "Hôm nay giỗ!" : `Còn ${item.daysRemaining} ngày`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cột Phải: Thống kê gia đình & Lối tắt nhanh */}
        <div className="space-y-8">
          
          {/* Card Thống kê */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3 mb-5">
              Số Liệu Thống Kê
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 flex items-center space-x-3">
                <div className="bg-amber-100 p-2 rounded-lg text-[#8c1d1d]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase font-semibold">Thành viên</span>
                  <strong className="text-lg text-stone-900">{totalCount}</strong>
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 flex items-center space-x-3">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase font-semibold">Số thế hệ</span>
                  <strong className="text-lg text-stone-900">{maxGen} đời</strong>
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 flex items-center space-x-3">
                <div className="bg-sky-100 p-2 rounded-lg text-sky-700">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase font-semibold">Còn sống</span>
                  <strong className="text-lg text-stone-900">{livingCount}</strong>
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 flex items-center space-x-3">
                <div className="bg-stone-200 p-2 rounded-lg text-stone-700">
                  <span className="text-xs font-bold">✝</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase font-semibold">Đã khuất</span>
                  <strong className="text-lg text-stone-900">{deadCount}</strong>
                </div>
              </div>
            </div>

            {/* Chi tiết phân bố Giới tính */}
            <div className="mt-5 pt-5 border-t border-stone-100 space-y-3">
              <div className="flex justify-between text-xs text-stone-600">
                <span>Phân bố nam / nữ:</span>
                <span className="font-semibold">{maleCount} Nam • {femaleCount} Nữ</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden flex">
                <div 
                  className="bg-sky-600 h-full" 
                  style={{ width: `${totalCount > 0 ? (maleCount / totalCount) * 100 : 50}%` }}
                />
                <div 
                  className="bg-pink-500 h-full" 
                  style={{ width: `${totalCount > 0 ? (femaleCount / totalCount) * 100 : 50}%` }}
                />
              </div>
            </div>
          </div>

          {/* Lối tắt quản trị */}
          <div className="bg-amber-50/40 border border-amber-200/50 rounded-2xl p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-amber-950 flex items-center space-x-2">
              <MessageSquare className="h-4.5 w-4.5 text-[#8c1d1d]" />
              <span>Ghi Nhớ Lời Tổ Tiên</span>
            </h3>
            <p className="text-xs text-amber-900/80 leading-relaxed italic">
              "Mộc hữu bản, thủy hữu nguyên. Nhân sinh hữu tổ hữu tông, như mộc hữu căn, như thủy hữu nguyên". <br />
              (Cây có gốc, nước có nguồn. Người sinh ra có tổ có tông, như cây có rễ, như sông có nguồn).
            </p>
            <div className="pt-2">
              <Link 
                href="/members" 
                className="w-full text-center block bg-[#8c1d1d] hover:bg-[#701515] text-white py-2.5 rounded-xl text-xs font-bold transition-colors"
              >
                Tra Cứu Danh Sách Thành Viên
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
