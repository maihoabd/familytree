"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar, User, Info, MapPin } from "lucide-react";
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
  solarDate: string; // ISO string từ server
}

interface AnniversaryCalendarClientProps {
  initialAnniversaries: AnniversaryItem[];
}

export default function AnniversaryCalendarClient({ initialAnniversaries }: AnniversaryCalendarClientProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed (0 = tháng 1)

  // Danh sách tháng tiếng Việt
  const monthNames = [
    "Tháng 1 (January)", "Tháng 2 (February)", "Tháng 3 (March)", 
    "Tháng 4 (April)", "Tháng 5 (May)", "Tháng 6 (June)", 
    "Tháng 7 (July)", "Tháng 8 (August)", "Tháng 9 (September)", 
    "Tháng 10 (October)", "Tháng 11 (November)", "Tháng 12 (December)"
  ];

  const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  // Phân tích ngày giỗ dương lịch thành Date objects
  const anniversariesWithDates = useMemo(() => {
    return initialAnniversaries.map(ann => {
      const date = new Date(ann.solarDate);
      return {
        ...ann,
        solarYear: date.getFullYear(),
        solarMonth: date.getMonth(), // 0-11
        solarDay: date.getDate(), // 1-31
      };
    });
  }, [initialAnniversaries]);

  // Lấy danh sách ngày trong tháng hiện tại
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Ngày trong tuần của ngày 1 đầu tháng (0 = Chủ Nhật, 1 = Thứ Hai,...)
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    
    // Chuyển đổi để Thứ Hai là cột đầu tiên (index = 0)
    // CN (0) -> 6, T2 (1) -> 0, T3 (2) -> 1, ..., T7 (6) -> 5
    const prefixEmptyDays = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const days: Array<{ dayNum: number | null; isCurrentMonth: boolean }> = [];

    // Thêm các ô trống đầu tháng
    for (let i = 0; i < prefixEmptyDays; i++) {
      days.push({ dayNum: null, isCurrentMonth: false });
    }

    // Thêm các ngày thực tế của tháng
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ dayNum: i, isCurrentMonth: true });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Lấy ngày giỗ thuộc về 1 ngày cụ thể trong tháng đang xem
  const getAnniversariesForDay = (day: number) => {
    return anniversariesWithDates.filter(
      ann => ann.solarMonth === currentMonth && ann.solarDay === day
    );
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  return (
    <div className="space-y-6">
      {/* Khối Header điều khiển tháng */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Calendar className="h-6 w-6 text-[#8c1d1d]" />
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              {monthNames[currentMonth]} - Năm {currentYear}
            </h2>
            <p className="text-xs text-stone-500">
              Bấm mũi tên để chuyển tháng dương lịch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGoToToday}
            className="border border-stone-200 hover:bg-stone-50 text-stone-700 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            Hôm nay
          </button>
          
          <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-white text-stone-600 hover:text-stone-900 transition-all"
              title="Tháng trước"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-white text-stone-600 hover:text-stone-900 transition-all"
              title="Tháng sau"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Lưới Lịch Tháng */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Hàng thứ trong tuần */}
        <div className="grid grid-cols-7 bg-stone-50 border-b border-stone-200 text-center py-3">
          {daysOfWeek.map((day, idx) => (
            <span 
              key={day} 
              className={`text-xs font-bold uppercase tracking-wider ${
                idx === 6 ? "text-red-500" : idx === 5 ? "text-blue-500" : "text-stone-400"
              }`}
            >
              {day}
            </span>
          ))}
        </div>

        {/* Lưới các ô ngày */}
        <div className="grid grid-cols-7 grid-rows-5 border-collapse divide-x divide-y divide-stone-100 bg-stone-50/20">
          {calendarDays.map((cell, idx) => {
            const isToday = 
              cell.dayNum === today.getDate() && 
              currentMonth === today.getMonth() && 
              currentYear === today.getFullYear();
            
            const dayAnns = cell.dayNum ? getAnniversariesForDay(cell.dayNum) : [];
            const hasAnniversary = dayAnns.length > 0;

            return (
              <div
                key={idx}
                className={`min-h-[100px] sm:min-h-[120px] p-2 flex flex-col justify-between transition-all bg-white relative ${
                  !cell.isCurrentMonth ? "bg-stone-50/40 text-stone-300" : "text-stone-700"
                } ${
                  isToday ? "ring-2 ring-[#8c1d1d] z-10" : ""
                } ${
                  hasAnniversary ? "bg-amber-50/15" : ""
                }`}
              >
                {/* Số ngày */}
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                    isToday 
                      ? "bg-[#8c1d1d] text-white" 
                      : hasAnniversary 
                        ? "text-[#8c1d1d] font-black" 
                        : "text-stone-600"
                  }`}>
                    {cell.dayNum}
                  </span>
                  
                  {isToday && (
                    <span className="text-[8px] bg-red-100 text-red-700 font-bold px-1 rounded uppercase tracking-wider scale-90 sm:scale-100">
                      Hôm nay
                    </span>
                  )}
                </div>

                {/* Danh sách ngày giỗ diễn ra trong ngày này */}
                <div className="flex-grow flex flex-col justify-end gap-1">
                  {cell.dayNum && hasAnniversary && (
                    <div className="space-y-1">
                      {dayAnns.map(ann => (
                        <Link
                          key={ann.memberId}
                          href={`/members/${ann.memberId}`}
                          className={`block p-1 text-[10px] leading-tight rounded border border-red-200/50 hover:bg-[#8c1d1d] hover:text-white transition-all text-left ${
                            ann.gender === "MALE" 
                              ? "bg-sky-50/80 text-sky-800" 
                              : "bg-pink-50/80 text-pink-800"
                          }`}
                          title={`Giỗ cụ: ${ann.fullName} (${formatLunarDate(ann.lunarMonth, ann.lunarDay, ann.isLeapMonth)})`}
                        >
                          <p className="font-bold truncate">{ann.fullName}</p>
                          <p className="text-[8px] opacity-75 font-mono">
                            Âm: {ann.lunarDay}/{ann.lunarMonth}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gợi ý ý nghĩa */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 flex items-start gap-3">
        <Info className="h-5 w-5 text-stone-500 shrink-0 mt-0.5" />
        <div className="text-xs text-stone-600 space-y-1">
          <strong className="text-stone-800 font-bold block">Ghi chú xem lịch kỵ nhật:</strong>
          <p>
            Các ngày có ô màu đỏ/xanh nổi bật kèm theo tên là ngày kỵ nhật (giỗ chạp) tương ứng của năm đang xem. 
            Bấm trực tiếp vào tên thành viên trên lịch để mở xem hồ sơ chi tiết và chỉ dẫn chuẩn bị cúng giỗ của gia đình.
          </p>
        </div>
      </div>
    </div>
  );
}
