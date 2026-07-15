const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Bắt đầu dọn dẹp database cũ...");
  await prisma.deathAnniversary.deleteMany();
  await prisma.marriage.deleteMany();
  await prisma.member.deleteMany();
  await prisma.family.deleteMany();

  console.log("Tạo dòng họ mới...");
  const family = await prisma.family.create({
    data: {
      name: "Phạm Đăng Hải Family Tree",
      origin: "Thôn Thạch Đê, xã Hùng Việt, tỉnh Phú Thọ",
      description: "Hệ thống quản lý phả hệ dòng họ Phạm Đăng Hải khởi nguồn từ cụ tổ Phạm Văn An định cư tại thôn Thạch Đê, xã Hùng Việt, tỉnh Phú Thọ.",
    },
  });

  console.log("Tạo thành viên Đời 1 (Thủy tổ)...");
  // Đời 1
  const an = await prisma.member.create({
    data: {
      fullName: "Phạm Văn An",
      gender: "MALE",
      generation: 1,
      birthDate: new Date("1910-05-15"),
      birthDateLunar: "10/04/1910",
      deathDate: new Date("1990-02-09"),
      deathDateLunar: "15/01/1990",
      isDead: true,
      biography: "Cụ tổ khai sinh dòng họ Phạm Hữu tại thôn Thạch Đê, xã Hùng Việt. Cụ từng làm thầy đồ dạy chữ Nho cho con em trong vùng.",
      placeOfBirth: "Hùng Việt, Phú Thọ",
      placeOfBurial: "Nghĩa trang dòng họ Phạm, thôn Thạch Đê, xã Hùng Việt, Phú Thọ",
      branch: "Ngành trưởng",
    },
  });

  const binh = await prisma.member.create({
    data: {
      fullName: "Trần Thị Bình",
      gender: "FEMALE",
      generation: 1,
      birthDate: new Date("1915-11-20"),
      birthDateLunar: "14/10/1915",
      deathDate: new Date("1995-12-11"),
      deathDateLunar: "20/10/1995",
      isDead: true,
      biography: "Hiền thê cụ Phạm Văn An, tào khang chi thê đảm đang, nhân hậu, một đời chăm lo gia đình.",
      placeOfBirth: "Hùng Việt, Phú Thọ",
      placeOfBurial: "Nghĩa trang dòng họ Phạm, thôn Thạch Đê, xã Hùng Việt, Phú Thọ",
      branch: "Ngành trưởng",
    },
  });

  // Hôn nhân cụ An và cụ Bình
  await prisma.marriage.create({
    data: {
      member1Id: an.id,
      member2Id: binh.id,
      notes: "Vợ chồng Thủy tổ (Ông bà nội tổ)",
    },
  });

  // Ngày giỗ đời 1
  await prisma.deathAnniversary.create({
    data: {
      memberId: an.id,
      lunarDay: 15,
      lunarMonth: 1,
      note: "Nhà thờ tổ dòng họ Phạm, thôn Thạch Đê, xã Hùng Việt. Trưởng họ chịu trách nhiệm cúng chính.",
      reminderDaysBefore: 5,
    },
  });

  await prisma.deathAnniversary.create({
    data: {
      memberId: binh.id,
      lunarDay: 20,
      lunarMonth: 10,
      note: "Nhà thờ tổ dòng họ Phạm. Các con cháu dâng hương làm giỗ.",
      reminderDaysBefore: 5,
    },
  });

  // Cập nhật thủy tổ cho gia tộc
  await prisma.family.update({
    where: { id: family.id },
    data: { foundingAncestorId: an.id },
  });

  console.log("Tạo thành viên Đời 2...");
  // Đời 2 - Con của An và Bình
  // 1. Phạm Hữu Cảnh (Con trưởng)
  const canh = await prisma.member.create({
    data: {
      fullName: "Phạm Hữu Cảnh",
      gender: "MALE",
      generation: 2,
      birthDate: new Date("1938-06-12"),
      birthDateLunar: "15/05/1938",
      deathDate: new Date("2012-06-23"),
      deathDateLunar: "05/05/2012",
      isDead: true,
      biography: "Trưởng nam đời thứ hai. Tham gia kháng chiến chống Mỹ cứu nước, là thương binh hạng 2/4. Sau về quê làm nông nghiệp và giữ nhà thờ tổ.",
      placeOfBirth: "Hùng Việt, Phú Thọ",
      placeOfBurial: "Nghĩa trang dòng họ Phạm, thôn Thạch Đê, xã Hùng Việt, Phú Thọ",
      branch: "Ngành trưởng - Chi 1",
      fatherId: an.id,
      motherId: binh.id,
    },
  });

  const duyen = await prisma.member.create({
    data: {
      fullName: "Lê Thị Duyên",
      gender: "FEMALE",
      generation: 2,
      birthDate: new Date("1942-03-10"),
      birthDateLunar: "24/01/1942",
      isDead: false,
      biography: "Vợ cụ Phạm Hữu Cảnh. Cụ bà hiền hậu, hiện sống vui vầy cùng con cháu tại quê nhà.",
      placeOfBirth: "Lâm Thao, Phú Thọ",
      branch: "Ngành trưởng - Chi 1",
    },
  });

  await prisma.marriage.create({
    data: {
      member1Id: canh.id,
      member2Id: duyen.id,
      notes: "Vợ chồng cả",
    },
  });

  await prisma.deathAnniversary.create({
    data: {
      memberId: canh.id,
      lunarDay: 5,
      lunarMonth: 5,
      note: "Giỗ tại nhà trưởng nam Phạm Hữu Khang (Thôn Thạch Đê).",
      reminderDaysBefore: 3,
    },
  });

  // 2. Phạm Hữu Đức (Con thứ)
  const duc = await prisma.member.create({
    data: {
      fullName: "Phạm Hữu Đức",
      gender: "MALE",
      generation: 2,
      birthDate: new Date("1942-09-25"),
      birthDateLunar: "16/08/1942",
      deathDate: new Date("2018-10-02"),
      deathDateLunar: "24/08/2018",
      isDead: true,
      biography: "Thứ nam đời thứ hai. Nguyên giáo viên dạy Toán trường THPT Hùng Vương, Phú Thọ.",
      placeOfBirth: "Hùng Việt, Phú Thọ",
      placeOfBurial: "Nghĩa trang xã Hùng Việt, Phú Thọ",
      branch: "Ngành trưởng - Chi 2",
      fatherId: an.id,
      motherId: binh.id,
    },
  });

  const em = await prisma.member.create({
    data: {
      fullName: "Phạm Thị Em",
      gender: "FEMALE",
      generation: 2,
      birthDate: new Date("1945-05-02"),
      birthDateLunar: "21/03/1945",
      deathDate: new Date("2020-02-15"),
      deathDateLunar: "22/01/2020",
      isDead: true,
      biography: "Hiền thê ông Phạm Hữu Đức, thợ may gia đình lương thiện, hiền lành.",
      placeOfBirth: "Cẩm Khê, Phú Thọ",
      placeOfBurial: "Nghĩa trang xã Hùng Việt, Phú Thọ",
      branch: "Ngành trưởng - Chi 2",
    },
  });

  await prisma.marriage.create({
    data: {
      member1Id: duc.id,
      member2Id: em.id,
      notes: "Vợ chồng chi hai",
    },
  });

  await prisma.deathAnniversary.create({
    data: {
      memberId: duc.id,
      lunarDay: 24,
      lunarMonth: 8,
      note: "Giỗ tại nhà con trai Phạm Hữu Phong (Hà Nội).",
      reminderDaysBefore: 3,
    },
  });

  await prisma.deathAnniversary.create({
    data: {
      memberId: em.id,
      lunarDay: 22,
      lunarMonth: 1,
      note: "Giỗ tại nhà con trai Phạm Hữu Phong.",
      reminderDaysBefore: 3,
    },
  });

  // 3. Phạm Thị Hạnh (Con gái út)
  const hanh = await prisma.member.create({
    data: {
      fullName: "Phạm Thị Hạnh",
      gender: "FEMALE",
      generation: 2,
      birthDate: new Date("1946-12-08"),
      birthDateLunar: "15/11/1946",
      isDead: false,
      biography: "Con gái út cụ An. Đi lấy chồng họ Vũ, hiện đang sống cùng gia đình chồng tại Hải Phòng.",
      placeOfBirth: "Hùng Việt, Phú Thọ",
      branch: "Ngành trưởng - Chi 3 (Nữ tả)",
      fatherId: an.id,
      motherId: binh.id,
    },
  });

  const hoang = await prisma.member.create({
    data: {
      fullName: "Vũ Văn Hoàng",
      gender: "MALE",
      generation: 2,
      birthDate: new Date("1944-07-15"),
      birthDateLunar: "25/05/1944",
      isDead: false,
      biography: "Rể cụ An, phu quân bà Phạm Thị Hạnh. Cựu chiến binh Hải quân nhân dân Việt Nam.",
      placeOfBirth: "Kiến Thụy, Hải Phòng",
    },
  });

  await prisma.marriage.create({
    data: {
      member1Id: hoang.id,
      member2Id: hanh.id,
      notes: "Chồng và Vợ",
    },
  });

  console.log("Tạo thành viên Đời 3...");
  // Đời 3 - Con của Canh & Duyen
  const khang = await prisma.member.create({
    data: {
      fullName: "Phạm Hữu Khang",
      gender: "MALE",
      generation: 3,
      birthDate: new Date("1968-08-20"),
      birthDateLunar: "27/07/1968",
      isDead: false,
      biography: "Trưởng nam chi 1, hiện là kỹ sư xây dựng, sinh sống và làm việc tại Phú Thọ, đang trực tiếp gánh vác việc họ ở quê nhà.",
      placeOfBirth: "Hùng Việt, Phú Thọ",
      branch: "Ngành trưởng - Chi 1",
      fatherId: canh.id,
      motherId: duyen.id,
    },
  });

  const lan = await prisma.member.create({
    data: {
      fullName: "Hoàng Thị Lan",
      gender: "FEMALE",
      generation: 3,
      birthDate: new Date("1970-10-05"),
      birthDateLunar: "06/09/1970",
      isDead: false,
      biography: "Vợ ông Phạm Hữu Khang, giáo viên tiểu học tại Phú Thọ.",
      placeOfBirth: "Việt Trì, Phú Thọ",
      branch: "Ngành trưởng - Chi 1",
    },
  });

  await prisma.marriage.create({
    data: {
      member1Id: khang.id,
      member2Id: lan.id,
    },
  });

  const mai = await prisma.member.create({
    data: {
      fullName: "Phạm Thị Mai",
      gender: "FEMALE",
      generation: 3,
      birthDate: new Date("1972-11-15"),
      birthDateLunar: "10/10/1972",
      isDead: false,
      biography: "Con gái ông Cảnh, hiện định cư tại TP. Hồ Chí Minh cùng chồng con.",
      placeOfBirth: "Hùng Việt, Phú Thọ",
      branch: "Ngành trưởng - Chi 1",
      fatherId: canh.id,
      motherId: duyen.id,
    },
  });

  const nam = await prisma.member.create({
    data: {
      fullName: "Trần Văn Nam",
      gender: "MALE",
      generation: 3,
      birthDate: new Date("1970-04-12"),
      birthDateLunar: "07/03/1970",
      isDead: false,
      biography: "Rể ông Cảnh, chồng bà Phạm Thị Mai. Bác sĩ Chấn thương chỉnh hình tại TP.HCM.",
      placeOfBirth: "Quận 3, TP Hồ Chí Minh",
    },
  });

  await prisma.marriage.create({
    data: {
      member1Id: nam.id,
      member2Id: mai.id,
    },
  });

  // Đời 3 - Con của Duc & Em
  const phong = await prisma.member.create({
    data: {
      fullName: "Phạm Hữu Phong",
      gender: "MALE",
      generation: 3,
      birthDate: new Date("1975-09-02"),
      birthDateLunar: "27/07/1975",
      isDead: false,
      biography: "Trưởng nam chi 2, PGS.TS Công nghệ thông tin tại Đại học Bách Khoa Hà Nội, hiện sống tại Hà Nội.",
      placeOfBirth: "Hùng Việt, Phú Thọ",
      branch: "Ngành trưởng - Chi 2",
      fatherId: duc.id,
      motherId: em.id,
    },
  });

  const quynh = await prisma.member.create({
    data: {
      fullName: "Đỗ Thị Quỳnh",
      gender: "FEMALE",
      generation: 3,
      birthDate: new Date("1978-12-14"),
      birthDateLunar: "15/11/1978",
      isDead: false,
      biography: "Vợ ông Phạm Hữu Phong, kế toán trưởng tại một tổng công ty xây dựng ở Hà Nội.",
      placeOfBirth: "Đống Đa, Hà Nội",
      branch: "Ngành trưởng - Chi 2",
    },
  });

  await prisma.marriage.create({
    data: {
      member1Id: phong.id,
      member2Id: quynh.id,
    },
  });

  console.log("Tạo thành viên Đời 4...");
  // Đời 4 - Con của Khang & Lan
  const son = await prisma.member.create({
    data: {
      fullName: "Phạm Hữu Sơn",
      gender: "MALE",
      generation: 4,
      birthDate: new Date("1996-09-27"),
      birthDateLunar: "15/08/1996",
      isDead: false,
      biography: "Con trai trưởng của ông Khang. Tốt nghiệp Thạc sĩ tại Nhật Bản, hiện đang làm kỹ sư AI tại Tokyo.",
      placeOfBirth: "Việt Trì, Phú Thọ",
      branch: "Ngành trưởng - Chi 1",
      fatherId: khang.id,
      motherId: lan.id,
    },
  });

  const hai = await prisma.member.create({
    data: {
      fullName: "Phạm Hữu Hải",
      gender: "MALE",
      generation: 4,
      birthDate: new Date("2000-02-18"),
      birthDateLunar: "14/01/2000",
      isDead: false,
      biography: "Con trai thứ hai của ông Khang. Tốt nghiệp Đại học Ngoại thương, hiện làm chuyên viên phân tích tài chính tại Hà Nội.",
      placeOfBirth: "Việt Trì, Phú Thọ",
      branch: "Ngành trưởng - Chi 1",
      fatherId: khang.id,
      motherId: lan.id,
    },
  });

  // Đời 4 - Con của Phong & Quynh
  const lam = await prisma.member.create({
    data: {
      fullName: "Phạm Hữu Lâm",
      gender: "MALE",
      generation: 4,
      birthDate: new Date("2004-11-20"),
      birthDateLunar: "09/10/2004",
      isDead: false,
      biography: "Con trai lớn của ông Phong. Hiện là sinh viên Đại học Bách Khoa Hà Nội.",
      placeOfBirth: "Hai Bà Trưng, Hà Nội",
      branch: "Ngành trưởng - Chi 2",
      fatherId: phong.id,
      motherId: quynh.id,
    },
  });

  const ngoc = await prisma.member.create({
    data: {
      fullName: "Phạm Thị Ngọc",
      gender: "FEMALE",
      generation: 4,
      birthDate: new Date("2008-07-22"),
      birthDateLunar: "20/06/2008",
      isDead: false,
      biography: "Con gái út của ông Phong, học sinh THPT Chuyên Hà Nội - Amsterdam.",
      placeOfBirth: "Hai Bà Trưng, Hà Nội",
      branch: "Ngành trưởng - Chi 2",
      fatherId: phong.id,
      motherId: quynh.id,
    },
  });

  console.log(`Đã seed thành công! Dòng họ: ${family.name}`);
}

main()
  .catch((e) => {
    console.error("Lỗi khi seed dữ liệu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
