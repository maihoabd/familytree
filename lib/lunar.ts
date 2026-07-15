import { Solar, Lunar } from "lunar-typescript";

/**
 * Định dạng ngày âm lịch sang tiếng Việt truyền thống
 * @param month Tháng âm lịch (số dương)
 * @param day Ngày âm lịch (1-30)
 * @param isLeap Có phải tháng nhuận hay không
 */
export function formatLunarDate(month: number, day: number, isLeap: boolean = false): string {
  let dayStr = "";
  if (day <= 10) {
    dayStr = `Mùng ${day === 10 ? "Mười" : day}`;
  } else if (day === 20) {
    dayStr = "Ngày Hai Mươi";
  } else if (day === 30) {
    dayStr = "Ngày Ba Mươi";
  } else if (day > 10 && day < 20) {
    dayStr = `Mười ${day % 10 === 5 ? "Lăm" : day % 10}`;
  } else {
    const unit = day % 10;
    let unitStr = "";
    if (unit === 1) unitStr = "Mốt";
    else if (unit === 5) unitStr = "Lăm";
    else if (unit === 0) unitStr = "";
    else unitStr = String(unit);
    
    dayStr = `Hai mươi ${unitStr}`.trim();
  }

  // Đầu tiên viết hoa chữ cái đầu tiên
  dayStr = dayStr.charAt(0).toUpperCase() + dayStr.slice(1);

  let monthStr = "";
  if (month === 1) {
    monthStr = "Tháng Giêng";
  } else if (month === 11) {
    monthStr = "Tháng Một";
  } else if (month === 12) {
    monthStr = "Tháng Chạp";
  } else {
    monthStr = `Tháng ${month}`;
  }

  if (isLeap) {
    monthStr += " (nhuận)";
  }

  return `${dayStr} ${monthStr.toLowerCase()}`;
}

/**
 * Quy đổi ngày âm lịch sang dương lịch
 * @param lunarYear Năm âm lịch
 * @param lunarMonth Tháng âm lịch (dương)
 * @param lunarDay Ngày âm lịch
 * @param isLeap Có phải tháng nhuận không
 */
export function lunarToSolar(lunarYear: number, lunarMonth: number, lunarDay: number, isLeap: boolean = false): Date {
  const monthParam = isLeap ? -lunarMonth : lunarMonth;
  const lunar = Lunar.fromYmd(lunarYear, monthParam, lunarDay);
  const solar = lunar.getSolar();
  return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
}

/**
 * Quy đổi ngày dương lịch sang âm lịch
 */
export function solarToLunar(date: Date) {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  return {
    year: lunar.getYear(),
    month: Math.abs(lunar.getMonth()),
    day: lunar.getDay(),
    isLeap: lunar.getMonth() < 0,
    label: formatLunarDate(Math.abs(lunar.getMonth()), lunar.getDay(), lunar.getMonth() < 0),
    chineseString: lunar.toString(),
  };
}

export interface AnniversaryItem {
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
  solarDate: Date; // Ngày dương lịch tính toán được
  daysRemaining: number; // Số ngày còn lại tính từ ngày hiện tại
}

/**
 * Tính toán danh sách ngày giỗ sắp tới
 * @param members Danh sách các thành viên đã mất có thông tin ngày giỗ
 * @param baseDate Ngày làm mốc tính toán (mặc định là hôm nay)
 * @param daysLimit Số ngày giới hạn nhắc nhở (mặc định là 30 ngày)
 */
export function getUpcomingAnniversaries(
  members: Array<{
    id: string;
    fullName: string;
    gender: string;
    generation: number;
    photoUrl: string | null;
    branch: string | null;
    deathAnniversary: {
      lunarMonth: number;
      lunarDay: number;
      isLeapMonth: boolean;
      note: string | null;
      reminderDaysBefore: number;
    } | null;
  }>,
  baseDate: Date = new Date(),
  daysLimit: number = 30
): AnniversaryItem[] {
  // Chuẩn hóa baseDate về 0h00 để tính khoảng cách ngày chính xác
  const today = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const futureLimit = new Date(today.getTime() + daysLimit * 24 * 60 * 60 * 1000);
  const currentSolarYear = today.getFullYear();

  const results: AnniversaryItem[] = [];

  for (const member of members) {
    if (!member.deathAnniversary) continue;

    const ann = member.deathAnniversary;
    
    // Tính toán ngày giỗ dương lịch tương ứng ở 3 năm (năm ngoái, năm nay, năm sau) để bao phủ tất cả trường hợp lệch múi giờ âm/dương lịch
    const testYears = [currentSolarYear - 1, currentSolarYear, currentSolarYear + 1];

    for (const year of testYears) {
      try {
        const solarDate = lunarToSolar(year, ann.lunarMonth, ann.lunarDay, ann.isLeapMonth);
        
        // Chuẩn hóa ngày giỗ dương lịch
        const solarTime = new Date(solarDate.getFullYear(), solarDate.getMonth(), solarDate.getDate());
        
        // Tính số ngày còn lại
        const diffTime = solarTime.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Nếu ngày giỗ nằm trong khoảng [0, daysLimit]
        if (diffDays >= 0 && diffDays <= daysLimit) {
          results.push({
            memberId: member.id,
            fullName: member.fullName,
            gender: member.gender,
            generation: member.generation,
            photoUrl: member.photoUrl,
            branch: member.branch,
            lunarMonth: ann.lunarMonth,
            lunarDay: ann.lunarDay,
            isLeapMonth: ann.isLeapMonth,
            note: ann.note,
            reminderDaysBefore: ann.reminderDaysBefore,
            solarDate: solarDate,
            daysRemaining: diffDays,
          });
          // Mỗi thành viên chỉ lấy 1 ngày giỗ gần nhất khớp trong khoảng thời gian này
          break;
        }
      } catch (error) {
        console.error(`Lỗi tính ngày giỗ cho thành viên ${member.fullName} vào năm âm lịch ${year}:`, error);
      }
    }
  }

  // Sắp xếp ngày giỗ theo số ngày còn lại tăng dần (ngày gần nhất lên đầu)
  return results.sort((a, b) => a.daysRemaining - b.daysRemaining);
}
