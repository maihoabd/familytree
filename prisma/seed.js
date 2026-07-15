const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Bắt đầu dọn dẹp database cũ...");
  await prisma.deathAnniversary.deleteMany();
  await prisma.marriage.deleteMany();
  await prisma.member.deleteMany();
  await prisma.family.deleteMany();

  console.log("Tạo dòng họ mới: Phạm Đăng Hải Family Tree...");
  const family = await prisma.family.create({
    data: {
      name: "Phạm Đăng Hải Family Tree",
      origin: "Thôn Thạch Đê, xã Hùng Việt, tỉnh Phú Thọ",
      description: "Cây gia đình của Phạm Đăng Hải",
    },
  });

  console.log("Tạo thành viên Đời 1...");
  // Cột mốc thế hệ thứ nhất (Bạn và Vợ)
  const hai = await prisma.member.create({
    data: {
      fullName: "Phạm Đăng Hải",
      gender: "MALE",
      generation: 1,
      birthDate: new Date("1988-10-10"),
      birthDateLunar: "30/08/1988",
      isDead: false,
      biography: "Quản trị viên sáng lập cây gia phả Phạm Đăng Hải Family Tree.",
      placeOfBirth: "Thôn Thạch Đê, xã Hùng Việt, tỉnh Phú Thọ",
      branch: "Ngành trưởng",
    },
  });

  const ngoc = await prisma.member.create({
    data: {
      fullName: "Nguyễn Thị Bích Ngọc",
      gender: "FEMALE",
      generation: 1,
      birthDate: new Date("1993-04-15"),
      birthDateLunar: "24/03/1993",
      isDead: false,
      biography: "Hiền thê ông Phạm Đăng Hải.",
      placeOfBirth: "Hà Nội",
      branch: "Ngành trưởng",
    },
  });

  // Hôn nhân
  await prisma.marriage.create({
    data: {
      member1Id: hai.id,
      member2Id: ngoc.id,
      notes: "Vợ chồng chính thất",
    },
  });

  // Đặt Phạm Đăng Hải làm thành viên gốc sáng lập (Founding Ancestor)
  await prisma.family.update({
    where: { id: family.id },
    data: { foundingAncestorId: hai.id },
  });

  console.log("Tạo thành viên Đời 2 (Con cái)...");
  // Đời 2 - Con của Hải và Ngọc
  const linh = await prisma.member.create({
    data: {
      fullName: "Phạm Phương Linh",
      gender: "FEMALE",
      generation: 2,
      birthDate: new Date("2017-12-13"),
      birthDateLunar: "26/10/2017",
      isDead: false,
      biography: "Con gái lớn của ông Phạm Đăng Hải và bà Nguyễn Thị Bích Ngọc.",
      placeOfBirth: "Hà Nội",
      branch: "Ngành trưởng",
      fatherId: hai.id,
      motherId: ngoc.id,
    },
  });

  const bao = await prisma.member.create({
    data: {
      fullName: "Phạm Đăng Bảo",
      gender: "MALE",
      generation: 2,
      birthDate: new Date("2020-08-29"),
      birthDateLunar: "11/07/2020",
      isDead: false,
      biography: "Con trai thứ (út) của ông Phạm Đăng Hải và bà Nguyễn Thị Bích Ngọc.",
      placeOfBirth: "Hà Nội",
      branch: "Ngành trưởng",
      fatherId: hai.id,
      motherId: ngoc.id,
    },
  });

  console.log(`Đã nạp thành công cây gia đình: ${family.name}`);
}

main()
  .catch((e) => {
    console.error("Lỗi khi nạp dữ liệu gia đình:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
