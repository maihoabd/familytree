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

  console.log("Tạo thế hệ cụ tổ (Đời 0 - Ông bà nội ngoại)...");
  // Ông bà nội Phạm Đăng Hải
  const ongNoiHai = await prisma.member.create({
    data: {
      fullName: "Phạm Đăng Trình",
      gender: "MALE",
      generation: 1,
      birthDate: new Date("1918-01-01"),
      birthDateLunar: "01/01/1918",
      deathDate: new Date("1988-12-31"),
      deathDateLunar: "24/11/1988",
      isDead: true,
      biography: "Ông nội của Phạm Đăng Hải.",
      placeOfBirth: "Thôn Thạch Đê, xã Hùng Việt, tỉnh Phú Thọ",
    },
  });

  const baNoiHai = await prisma.member.create({
    data: {
      fullName: "Đặng Thị Nghĩa",
      gender: "FEMALE",
      generation: 1,
      birthDate: new Date("1924-01-01"),
      birthDateLunar: "01/01/1924",
      deathDate: new Date("2024-12-31"),
      deathDateLunar: "01/12/2024",
      isDead: true,
      biography: "Bà nội của Phạm Đăng Hải.",
      placeOfBirth: "Phú Thọ",
    },
  });

  await prisma.marriage.create({
    data: {
      member1Id: ongNoiHai.id,
      member2Id: baNoiHai.id,
    },
  });

  // Ông bà ngoại Phạm Đăng Hải
  const ongNgoaiHai = await prisma.member.create({
    data: {
      fullName: "Trần Xuân Hiệu",
      gender: "MALE",
      generation: 1,
      isDead: true,
      biography: "Ông ngoại của Phạm Đăng Hải.",
      placeOfBirth: "Phú Thọ",
    },
  });

  const baNgoaiHai = await prisma.member.create({
    data: {
      fullName: "Tô Thị Tân",
      gender: "FEMALE",
      generation: 1,
      isDead: true,
      biography: "Bà ngoại của Phạm Đăng Hải.",
      placeOfBirth: "Phú Thọ",
    },
  });

  await prisma.marriage.create({
    data: {
      member1Id: ongNgoaiHai.id,
      member2Id: baNgoaiHai.id,
    },
  });

  // Ông nội Nguyễn Thị Bích Ngọc
  const ongNoiNgoc = await prisma.member.create({
    data: {
      fullName: "Nguyễn Văn Y",
      gender: "MALE",
      generation: 1,
      birthDate: new Date("1924-01-01"),
      deathDate: new Date("2024-12-31"),
      isDead: true,
      biography: "Ông nội của Nguyễn Thị Bích Ngọc.",
      placeOfBirth: "Hà Nội",
    },
  });

  // Ông ngoại Nguyễn Thị Bích Ngọc
  const ongNgoaiNgoc = await prisma.member.create({
    data: {
      fullName: "Đặng Đức Song",
      gender: "MALE",
      generation: 1,
      birthDate: new Date("1930-01-01"),
      deathDate: new Date("2023-12-31"),
      isDead: true,
      biography: "Ông ngoại của Nguyễn Thị Bích Ngọc.",
      placeOfBirth: "Hà Nội",
    },
  });


  console.log("Tạo thế hệ Đời 1 (Thế hệ phụ mẫu)...");
  // 1. Phụ mẫu Phạm Đăng Hải
  const thanh = await prisma.member.create({
    data: {
      fullName: "Phạm Đăng Thanh",
      gender: "MALE",
      generation: 2,
      birthDate: new Date("1958-10-18"),
      birthDateLunar: "06/09/1958",
      deathDate: new Date("2025-08-29"),
      deathDateLunar: "07/07/2025",
      isDead: true,
      biography: "Thân sinh ông Phạm Đăng Hải.",
      placeOfBirth: "Thôn Thạch Đê, xã Hùng Việt, tỉnh Phú Thọ",
      fatherId: ongNoiHai.id,
      motherId: baNoiHai.id,
      branch: "Ngành trưởng",
    },
  });

  const kimThanh = await prisma.member.create({
    data: {
      fullName: "Trần Thị Kim Thanh",
      gender: "FEMALE",
      generation: 2,
      birthDate: new Date("1962-06-01"),
      birthDateLunar: "29/04/1962",
      isDead: false,
      biography: "Thân mẫu ông Phạm Đăng Hải.",
      placeOfBirth: "Hùng Việt, Phú Thọ",
      fatherId: ongNgoaiHai.id,
      motherId: baNgoaiHai.id,
      branch: "Ngành trưởng",
    },
  });

  await prisma.marriage.create({
    data: {
      member1Id: thanh.id,
      member2Id: kimThanh.id,
      notes: "Hôn phối chính thất",
    },
  });

  // Kỵ nhật thân phụ
  await prisma.deathAnniversary.create({
    data: {
      memberId: thanh.id,
      lunarDay: 7,
      lunarMonth: 7,
      note: "Ngày giỗ thân phụ (bố đẻ) ông Phạm Đăng Hải.",
      reminderDaysBefore: 5,
    },
  });

  // 2. Phụ mẫu Nguyễn Thị Bích Ngọc
  const khue = await prisma.member.create({
    data: {
      fullName: "Nguyễn Văn Khuê",
      gender: "MALE",
      generation: 2,
      isDead: false,
      biography: "Nhạc phụ ông Phạm Đăng Hải (Bố đẻ bà Nguyễn Thị Bích Ngọc).",
      placeOfBirth: "Hà Nội",
      fatherId: ongNoiNgoc.id,
      branch: "Ngành ngoại",
    },
  });

  const ha = await prisma.member.create({
    data: {
      fullName: "Đặng Thị Thu Hà",
      gender: "FEMALE",
      generation: 2,
      isDead: false,
      biography: "Nhạc mẫu ông Phạm Đăng Hải (Mẹ đẻ bà Nguyễn Thị Bích Ngọc).",
      placeOfBirth: "Hà Nội",
      fatherId: ongNgoaiNgoc.id,
      branch: "Ngành ngoại",
    },
  });

  await prisma.marriage.create({
    data: {
      member1Id: khue.id,
      member2Id: ha.id,
    },
  });

  // Đặt Phạm Đăng Thanh làm thành viên gốc sáng lập (Founding Ancestor)
  await prisma.family.update({
    where: { id: family.id },
    data: { foundingAncestorId: thanh.id },
  });

  console.log("Tạo thế hệ Đời 2 (Thế hệ Bố mẹ)...");
  // 1. Phạm Đăng Hải (Bạn)
  const hai = await prisma.member.create({
    data: {
      fullName: "Phạm Đăng Hải",
      gender: "MALE",
      generation: 3,
      birthDate: new Date("1988-10-10"),
      birthDateLunar: "30/08/1988",
      isDead: false,
      biography: "Quản trị viên sáng lập cây gia phả Phạm Đăng Hải Family Tree.",
      placeOfBirth: "Thôn Thạch Đê, xã Hùng Việt, tỉnh Phú Thọ",
      branch: "Ngành trưởng",
      fatherId: thanh.id,
      motherId: kimThanh.id,
    },
  });

  // 2. Nguyễn Thị Bích Ngọc (Vợ)
  const ngoc = await prisma.member.create({
    data: {
      fullName: "Nguyễn Thị Bích Ngọc",
      gender: "FEMALE",
      generation: 3,
      birthDate: new Date("1993-04-15"),
      birthDateLunar: "24/03/1993",
      isDead: false,
      biography: "Hiền thê ông Phạm Đăng Hải.",
      placeOfBirth: "Hà Nội",
      branch: "Ngành trưởng",
      fatherId: khue.id,
      motherId: ha.id,
    },
  });

  await prisma.marriage.create({
    data: {
      member1Id: hai.id,
      member2Id: ngoc.id,
      notes: "Vợ chồng",
    },
  });

  // 3. Nguyễn Minh Đức (Em trai vợ)
  const duc = await prisma.member.create({
    data: {
      fullName: "Nguyễn Minh Đức",
      gender: "MALE",
      generation: 3,
      birthDate: new Date("2004-09-15"),
      birthDateLunar: "02/08/2004",
      isDead: false,
      biography: "Em trai bà Nguyễn Thị Bích Ngọc.",
      placeOfBirth: "Hà Nội",
      branch: "Ngành ngoại",
      fatherId: khue.id,
      motherId: ha.id,
    },
  });

  console.log("Tạo thế hệ Đời 3 (Thế hệ Con cái)...");
  const linh = await prisma.member.create({
    data: {
      fullName: "Phạm Phương Linh",
      gender: "FEMALE",
      generation: 4,
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
      generation: 4,
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

  console.log(`Đã nạp thành công cây gia đình hoàn chỉnh: ${family.name}`);
}

main()
  .catch((e) => {
    console.error("Lỗi khi nạp dữ liệu gia đình:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
