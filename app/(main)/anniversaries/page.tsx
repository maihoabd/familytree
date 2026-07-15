import { prisma } from "@/lib/prisma";
import { lunarToSolar } from "@/lib/lunar";
import AnniversariesListClient from "@/components/AnniversariesListClient";
import { Calendar } from "lucide-react";

export const revalidate = 0;

export default async function AnniversariesPage() {
  const currentYear = new Date().getFullYear();

  // Lấy toàn bộ thành viên đã mất và có thông tin ngày giỗ
  const deceased = await prisma.member.findMany({
    where: {
      isDead: true,
      deathAnniversary: {
        isNot: null,
      },
    },
    include: {
      deathAnniversary: true,
    },
  });

  // Quy đổi ngày âm lịch sang dương lịch tương ứng trong năm hiện tại
  const list = deceased.map((m) => {
    const ann = m.deathAnniversary!;
    let solarDate = new Date();
    try {
      solarDate = lunarToSolar(currentYear, ann.lunarMonth, ann.lunarDay, ann.isLeapMonth);
    } catch (err) {
      console.error(`Lỗi quy đổi ngày giỗ cho ${m.fullName}:`, err);
    }

    return {
      memberId: m.id,
      fullName: m.fullName,
      gender: m.gender,
      generation: m.generation,
      photoUrl: m.photoUrl,
      branch: m.branch,
      lunarMonth: ann.lunarMonth,
      lunarDay: ann.lunarDay,
      isLeapMonth: ann.isLeapMonth,
      note: ann.note,
      reminderDaysBefore: ann.reminderDaysBefore,
      solarDate: solarDate.toISOString(), // Chuyển đổi thành ISO String để serialize an toàn sang Client Component
    };
  });

  // Sắp xếp ngày giỗ tăng dần theo thời gian dương lịch
  list.sort((a, b) => new Date(a.solarDate).getTime() - new Date(b.solarDate).getTime());

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900 flex items-center gap-2.5">
            <Calendar className="h-8 w-8 text-[#8c1d1d]" />
            Lịch Kỵ Nhật (Ngày Giỗ Dòng Họ)
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Danh sách ngày giỗ tưởng nhớ cha ông trong năm dương lịch hiện tại ({currentYear}), tự động quy đổi từ ngày âm lịch truyền thống.
          </p>
        </div>
      </div>

      {/* Component Danh sách lọc ngày giỗ */}
      <AnniversariesListClient initialAnniversaries={list} />
    </div>
  );
}
