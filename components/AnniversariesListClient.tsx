"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Calendar, MapPin, Bell, User, ChevronRight } from "lucide-react";
import { formatLunarDate } from "@/lib/lunar";

interface AnniversaryItem {
  memberId: string;
  fullName: string;
  gender: string;
  generation: number;
  photoUrl: string | null;
  branch: string | null;
  lunarMonth: number;
  lunarDay: number;
  isLeapMonth: boolean;
  note: string | null;
  reminderDaysBefore: number;
  solarDate: string; // ISO string từ server
}

interface AnniversariesListClientProps {
  initialAnniversaries: AnniversaryItem[];
}

export default function AnniversariesListClient({ initialAnniversaries }: AnniversariesListClientProps) {
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const formattedAnniversaries = useMemo(() => {
    return initialAnniversaries.map(ann => ({
      ...ann,
      solarDateObj: new Date(ann.solarDate)
    }));
  }, [initialAnniversaries]);

  // Lọc ngày giỗ theo tên và tháng (Lọc theo tháng âm lịch)
  const filteredAnniversaries = useMemo(() => {
    return formattedAnniversaries.filter(ann => {
      const matchSearch = ann.fullName.toLowerCase().includes(search.toLowerCase().trim());
      const matchMonth = selectedMonth === "all" || ann.lunarMonth === parseInt(selectedMonth);
      return matchSearch && matchMonth;
    });
  }, [formattedAnniversaries, search, selectedMonth]);

  // Nhóm các ngày giỗ theo tháng âm lịch phục vụ thống kê
  const monthStats = useMemo(() => {
    const stats: Record<number, number> = {};
    formattedAnniversaries.forEach(ann => {
      stats[ann.lunarMonth] = (stats[ann.lunarMonth] || 0) + 1;
    });
    return stats;
  }, [formattedAnniversaries]);

  const monthNames = [
    { value: 1, label: "Tháng Giêng" },
    { value: 2, label: "Tháng 2" },
    { value: 3, label: "Tháng 3" },
    { value: 4, label: "Tháng 4" },
    { value: 5, label: "Tháng 5" },
    { value: 6, label: "Tháng 6" },
    { value: 7, label: "Tháng 7" },
    { value: 8, label: "Tháng 8" },
    { value: 9, label: "Tháng 9" },
    { value: 10, label: "Tháng 10" },
    { value: 11, label: "Tháng 11" },
    { value: 12, label: "Tháng Chạp" },
  ];

  return (
    <div className="space-y-6">
      {/* Khối tìm kiếm & Bộ lọc tháng */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm kiếm ngày giỗ theo tên thành viên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]/20 focus:border-[#8c1d1d] bg-stone-50"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-stone-500 whitespace-nowrap">Lọc tháng âm lịch:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]/20 focus:border-[#8c1d1d] bg-white font-medium"
            >
              <option value="all">Tất cả các tháng</option>
              {monthNames.map(m => (
                <option key={m.value} value={m.value}>
                  {m.label} ({monthStats[m.value] || 0})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid Danh sách ngày giỗ */}
      {filteredAnniversaries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
          <Calendar className="h-12 w-12 text-stone-300 mx-auto mb-2" />
          <p className="text-stone-500 font-medium">Không tìm thấy ngày giỗ nào phù hợp.</p>
          <p className="text-stone-400 text-xs mt-1">Vui lòng thử đổi từ khóa tìm kiếm hoặc chọn tháng khác.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnniversaries.map((ann) => {
            const solarDay = ann.solarDateObj.toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            return (
              <div
                key={ann.memberId}
                className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#ffd700]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Thông tin thành viên & Ngày giỗ âm lịch */}
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden shrink-0">
                    {ann.photoUrl ? (
                      <img src={ann.photoUrl} alt={ann.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-6 w-6 text-stone-300" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                      <Link href={`/members/${ann.memberId}`} className="hover:text-[#8c1d1d] transition-colors">
                        {ann.fullName}
                      </Link>
                      <span className="text-[10px] bg-stone-100 border border-stone-300 px-2 py-0.5 rounded-full text-stone-500 font-sans font-normal">
                        Đời {ann.generation}
                      </span>
                    </h3>
                    
                    <p className="text-xs text-stone-500 mt-0.5">
                      {ann.branch || "Chi nhánh gốc"}
                    </p>

                    {/* Ngày âm lịch */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/50 px-2.5 py-0.5 rounded-lg">
                        Âm lịch: {formatLunarDate(ann.lunarMonth, ann.lunarDay, ann.isLeapMonth)}
                      </span>
                      {ann.reminderDaysBefore > 0 && (
                        <span className="text-[10px] text-stone-500 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <Bell className="h-3 w-3 text-stone-400" />
                          Nhắc trước {ann.reminderDaysBefore} ngày
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ngày dương lịch quy đổi năm nay & ghi chú */}
                <div className="flex flex-col md:items-end justify-center pt-4 md:pt-0 border-t md:border-t-0 border-stone-100">
                  <span className="text-xs text-stone-400">Dương lịch tương ứng năm nay:</span>
                  <strong className="text-stone-900 font-semibold mt-0.5">
                    {solarDay}
                  </strong>
                  
                  {ann.note && (
                    <div className="flex items-start gap-1 text-xs text-stone-500 mt-2 bg-stone-50 p-2 rounded-lg max-w-xs md:text-right md:justify-end">
                      <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span>{ann.note}</span>
                    </div>
                  )}

                  <Link
                    href={`/members/${ann.memberId}`}
                    className="mt-3 text-xs font-bold text-[#8c1d1d] hover:underline flex items-center self-start md:self-auto gap-0.5"
                  >
                    <span>Xem thông tin thờ cúng</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
