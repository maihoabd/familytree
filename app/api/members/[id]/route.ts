import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { checkAdminSession } from "@/lib/auth";

// GET: Lấy chi tiết thông tin một thành viên
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        deathAnniversary: true,
        father: { select: { id: true, fullName: true } },
        mother: { select: { id: true, fullName: true } },
        marriagesAsMember1: {
          include: {
            member2: { select: { id: true, fullName: true, gender: true } }
          }
        },
        marriagesAsMember2: {
          include: {
            member1: { select: { id: true, fullName: true, gender: true } }
          }
        }
      }
    });

    if (!member) {
      return NextResponse.json({ error: "Không tìm thấy thành viên" }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error: any) {
    console.error("Lỗi khi lấy chi tiết thành viên:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống", details: error.message },
      { status: 500 }
    );
  }
}

// PUT: Cập nhật thông tin thành viên
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
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
      spouseIds, // Mảng các ID vợ/chồng mới
      anniversaryNote,
      reminderDaysBefore
    } = body;

    if (!fullName || !gender || !generation) {
      return NextResponse.json(
        { error: "Họ tên, giới tính và đời thứ là thông tin bắt buộc" },
        { status: 400 }
      );
    }

    const updatedMember = await prisma.$transaction(async (tx) => {
      // 1. Cập nhật thông tin cơ bản Member
      const member = await tx.member.update({
        where: { id },
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

      // 2. Cập nhật mối quan hệ vợ/chồng (Xóa các mối quan hệ cũ và tạo lại)
      await tx.marriage.deleteMany({
        where: {
          OR: [
            { member1Id: id },
            { member2Id: id }
          ]
        }
      });

      if (spouseIds && Array.isArray(spouseIds) && spouseIds.length > 0) {
        for (const spouseId of spouseIds) {
          if (!spouseId) continue;
          const m1 = id < spouseId ? id : spouseId;
          const m2 = id < spouseId ? spouseId : id;
          
          await tx.marriage.create({
            data: {
              member1Id: m1,
              member2Id: m2,
              notes: "Cập nhật kết hôn",
            },
          });
        }
      }

      // 3. Cập nhật thông tin ngày giỗ
      if (!isDead) {
        // Nếu chuyển trạng thái còn sống, xóa ngày giỗ nếu có
        await tx.deathAnniversary.deleteMany({ where: { memberId: id } });
      } else if (deathDateLunar) {
        const parts = deathDateLunar.split("/");
        if (parts.length >= 2) {
          const lunarDay = parseInt(parts[0]);
          const lunarMonth = parseInt(parts[1]);
          
          if (!isNaN(lunarDay) && !isNaN(lunarMonth)) {
            await tx.deathAnniversary.upsert({
              where: { memberId: id },
              update: {
                lunarDay,
                lunarMonth,
                note: anniversaryNote || null,
                reminderDaysBefore: reminderDaysBefore ? parseInt(reminderDaysBefore) : 3,
              },
              create: {
                memberId: id,
                lunarDay,
                lunarMonth,
                note: anniversaryNote || null,
                reminderDaysBefore: reminderDaysBefore ? parseInt(reminderDaysBefore) : 3,
              },
            });
          }
        }
      } else {
        // Đã chết nhưng không có ngày giỗ âm lịch, xóa bản ghi ngày giỗ
        await tx.deathAnniversary.deleteMany({ where: { memberId: id } });
      }

      return member;
    });

    return NextResponse.json(updatedMember);
  } catch (error: any) {
    console.error("Lỗi khi cập nhật thành viên:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật thành viên", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Xóa thành viên
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    
    // Kiểm tra xem thành viên này có con hay không trước khi xóa
    const childrenCount = await prisma.member.count({
      where: {
        OR: [
          { fatherId: id },
          { motherId: id }
        ]
      }
    });

    if (childrenCount > 0) {
      return NextResponse.json(
        { error: "Không thể xóa thành viên này vì họ đã có liên kết con cái trong phả hệ. Hãy xóa hoặc cập nhật các con trước." },
        { status: 400 }
      );
    }

    await prisma.member.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Đã xóa thành viên thành công" });
  } catch (error: any) {
    console.error("Lỗi khi xóa thành viên:", error);
    return NextResponse.json(
      { error: "Không thể xóa thành viên", details: error.message },
      { status: 500 }
    );
  }
}
