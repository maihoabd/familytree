import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { checkAdminSession } from "@/lib/auth";

// GET: Lấy toàn bộ danh sách thành viên trong dòng họ
export async function GET() {
  try {
    const members = await prisma.member.findMany({
      include: {
        deathAnniversary: true,
        marriagesAsMember1: {
          include: {
            member2: {
              select: { id: true, fullName: true, gender: true }
            }
          }
        },
        marriagesAsMember2: {
          include: {
            member1: {
              select: { id: true, fullName: true, gender: true }
            }
          }
        }
      },
      orderBy: [
        { generation: "asc" },
        { fullName: "asc" }
      ]
    });

    return NextResponse.json(members);
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách thành viên:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách thành viên", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Tạo thành viên mới
export async function POST(request: Request) {
  try {
    // Kiểm tra quyền Admin
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session")?.value;
    if (!checkAdminSession(sessionToken)) {
      return NextResponse.json(
        { error: "Bạn không có quyền thực hiện chức năng này. Vui lòng đăng nhập Admin." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      fullName,
      gender,
      generation,
      birthDate,
      birthDateLunar,
      deathDate,
      deathDateLunar,
      isDead,
      biography,
      photoUrl,
      placeOfBirth,
      placeOfBurial,
      branch,
      fatherId,
      motherId,
      spouseIds, // Mảng các ID vợ/chồng: string[]
      anniversaryNote,
      reminderDaysBefore
    } = body;

    if (!fullName || !gender || !generation) {
      return NextResponse.json(
        { error: "Họ tên, giới tính và đời thứ là thông tin bắt buộc" },
        { status: 400 }
      );
    }

    // Tạo thành viên trong transaction
    const newMember = await prisma.$transaction(async (tx) => {
      // 1. Tạo Member
      const member = await tx.member.create({
        data: {
          fullName,
          gender,
          generation: parseInt(generation),
          birthDate: birthDate ? new Date(birthDate) : null,
          birthDateLunar: birthDateLunar || null,
          deathDate: deathDate ? new Date(deathDate) : null,
          deathDateLunar: deathDateLunar || null,
          isDead: !!isDead,
          biography: biography || null,
          photoUrl: photoUrl || null,
          placeOfBirth: placeOfBirth || null,
          placeOfBurial: placeOfBurial || null,
          branch: branch || null,
          fatherId: fatherId || null,
          motherId: motherId || null,
        },
      });

      // 2. Tạo quan hệ vợ/chồng (Hôn nhân)
      if (spouseIds && Array.isArray(spouseIds) && spouseIds.length > 0) {
        for (const spouseId of spouseIds) {
          if (!spouseId) continue;
          // Tạo bản ghi hôn nhân (đảm bảo thứ tự member1Id < member2Id để tránh trùng lặp đảo chiều)
          const m1 = member.id < spouseId ? member.id : spouseId;
          const m2 = member.id < spouseId ? spouseId : member.id;
          
          await tx.marriage.create({
            data: {
              member1Id: m1,
              member2Id: m2,
              notes: "Đăng ký kết hôn",
            },
          });
        }
      }

      // 3. Tạo ngày giỗ nếu thành viên đã mất và có thông tin ngày giỗ âm lịch
      if (!!isDead && deathDateLunar) {
        // Định dạng ngày giỗ âm lịch thường là DD/MM hoặc DD/MM/YYYY
        const parts = deathDateLunar.split("/");
        if (parts.length >= 2) {
          const lunarDay = parseInt(parts[0]);
          const lunarMonth = parseInt(parts[1]);
          
          if (!isNaN(lunarDay) && !isNaN(lunarMonth)) {
            await tx.deathAnniversary.create({
              data: {
                memberId: member.id,
                lunarDay,
                lunarMonth,
                isLeapMonth: false, // Mặc định không nhuận, có thể tùy chỉnh sau
                note: anniversaryNote || null,
                reminderDaysBefore: reminderDaysBefore ? parseInt(reminderDaysBefore) : 3,
              },
            });
          }
        }
      }

      return member;
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (error: any) {
    console.error("Lỗi khi tạo thành viên:", error);
    return NextResponse.json(
      { error: "Không thể tạo thành viên", details: error.message },
      { status: 500 }
    );
  }
}
