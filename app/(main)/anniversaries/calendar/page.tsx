import { prisma } from "@/lib/prisma";
import { lunarToSolar } from "@/lib/lunar";
import AnniversaryCalendarClient from "@/components/AnniversaryCalendarClient";
import { CalendarDays } from "lucide-react";

export const revalidate = 0;

export default async function AnniversaryCalendarPage() {
  const currentYear = new Date().getFullYear();

  // Lấy toàn bộ thành viên đã mất và có thiết lập ngày giỗ
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

  const list: any[] = [];
  const testYears = [currentYear - 1, currentYear, currentYear + 1];

  // Tính toán ngày giỗ dương lịch cho 3 năm để người dùng chuyển đổi năm trên Lịch không bị mất sự kiện
  for (const year of testYears) {
    deceased.forEach((m) => {
      const ann = m.deathAnniversary!;
      try {
        const solarDate = lunarToSolar(year, ann.lunarMonth, ann.lunarDay, ann.isLeapMonth);
        
        list.push({
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
          solarDate: solarDate.toISOString(),
        });
      } catch (err) {
        console.error(`Lỗi quy đổi ngày giỗ cho ${m.fullName} năm ${year}:`, err);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900 flex items-center gap-2.5">
            <CalendarDays className="h-8 w-8 text-[#8c1d1d]" />
            Lịch Kỵ Nhật Trực Quan (Tháng/Năm)
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Tra cứu ngày giỗ chi tiết theo từng ô lịch ngày dương lịch tương ứng của tháng âm lịch truyền thống.
          </p>
        </div>
      </div>

      {/* Bộ hiển thị lịch ô lưới */}
      <AnniversaryCalendarClient initialAnniversaries={list} />
    </div>
  );
}
