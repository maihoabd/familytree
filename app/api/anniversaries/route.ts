import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUpcomingAnniversaries, lunarToSolar } from "@/lib/lunar";

// GET: Lấy danh sách ngày giỗ (nhắc nhở sắp tới hoặc toàn bộ lịch năm)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get("days");
    const all = searchParams.get("all") === "true";
    const targetYear = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    // Lấy toàn bộ thành viên đã mất và có thiết lập ngày giỗ
    const deceasedMembers = await prisma.member.findMany({
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

    if (all) {
      // Tính toán ngày giỗ dương lịch của toàn bộ thành viên trong năm targetYear được chỉ định (để hiển thị Calendar)
      const list = deceasedMembers.map((member) => {
        const ann = member.deathAnniversary!;
        let solarDate = new Date();
        try {
          solarDate = lunarToSolar(targetYear, ann.lunarMonth, ann.lunarDay, ann.isLeapMonth);
        } catch (err) {
          console.error(`Lỗi đổi ngày giỗ cho ${member.fullName}:`, err);
        }

        return {
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
        };
      });

      // Sắp xếp theo ngày dương lịch tăng dần
      list.sort((a, b) => a.solarDate.getTime() - b.solarDate.getTime());
      return NextResponse.json(list);
    } else {
      // Mặc định: Trả về danh sách ngày giỗ sắp tới trong N ngày (mặc định 30 ngày)
      const limitDays = parseInt(days || "30");
      const upcoming = getUpcomingAnniversaries(deceasedMembers, new Date(), limitDays);
      return NextResponse.json(upcoming);
    }
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách ngày giỗ:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách ngày giỗ", details: error.message },
      { status: 500 }
    );
  }
}
