"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Member {
  id: string;
  fullName: string;
  gender: string;
  generation: number;
  birthDate: string | Date | null;
  birthDateLunar: string | null;
  deathDate: string | Date | null;
  deathDateLunar: string | null;
  isDead: boolean;
  biography: string | null;
  photoUrl: string | null;
  placeOfBirth: string | null;
  placeOfBurial: string | null;
  branch: string | null;
  fatherId: string | null;
  motherId: string | null;
}

interface MemberFormProps {
  initialData?: Member & {
    deathAnniversary?: {
      note: string | null;
      reminderDaysBefore: number;
    } | null;
    spouses?: string[]; // Mảng ID các vợ/chồng
  };
  allMembers: Member[];
}

export default function MemberForm({ initialData, allMembers }: MemberFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState(initialData?.fullName || "");
  const [gender, setGender] = useState(initialData?.gender || "MALE");
  const [generation, setGeneration] = useState<number>(initialData?.generation || 1);
  const [branch, setBranch] = useState(initialData?.branch || "");
  const [photoUrl, setPhotoUrl] = useState(initialData?.photoUrl || "");
  
  const [birthDate, setBirthDate] = useState(
    initialData?.birthDate ? new Date(initialData.birthDate).toISOString().split("T")[0] : ""
  );
  const [birthDateLunar, setBirthDateLunar] = useState(initialData?.birthDateLunar || "");
  
  const [isDead, setIsDead] = useState(initialData?.isDead || false);
  const [deathDate, setDeathDate] = useState(
    initialData?.deathDate ? new Date(initialData.deathDate).toISOString().split("T")[0] : ""
  );
  const [deathDateLunar, setDeathDateLunar] = useState(initialData?.deathDateLunar || "");
  
  const [placeOfBirth, setPlaceOfBirth] = useState(initialData?.placeOfBirth || "");
  const [placeOfBurial, setPlaceOfBurial] = useState(initialData?.placeOfBurial || "");
  
  const [fatherId, setFatherId] = useState(initialData?.fatherId || "");
  const [motherId, setMotherId] = useState(initialData?.motherId || "");
  const [selectedSpouses, setSelectedSpouses] = useState<string[]>(initialData?.spouses || []);
  
  const [anniversaryNote, setAnniversaryNote] = useState(initialData?.deathAnniversary?.note || "");
  const [reminderDaysBefore, setReminderDaysBefore] = useState<number>(
    initialData?.deathAnniversary?.reminderDaysBefore || 3
  );
  const [biography, setBiography] = useState(initialData?.biography || "");

  // Lọc các ứng viên cha/mẹ/vợ chồng (loại trừ chính bản thân nếu đang sửa)
  const potentialFathers = allMembers.filter(m => m.gender === "MALE" && (!isEdit || m.id !== initialData?.id));
  const potentialMothers = allMembers.filter(m => m.gender === "FEMALE" && (!isEdit || m.id !== initialData?.id));
  const potentialSpouses = allMembers.filter(m => !isEdit || m.id !== initialData?.id);

  // Xử lý chọn/bỏ chọn vợ chồng
  const handleSpouseToggle = (spouseId: string) => {
    if (selectedSpouses.includes(spouseId)) {
      setSelectedSpouses(selectedSpouses.filter(id => id !== spouseId));
    } else {
      setSelectedSpouses([...selectedSpouses, spouseId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Họ và tên không được để trống");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      fullName,
      gender,
      generation,
      branch: branch || null,
      photoUrl: photoUrl || null,
      birthDate: birthDate || null,
      birthDateLunar: birthDateLunar || null,
      isDead,
      deathDate: isDead && deathDate ? deathDate : null,
      deathDateLunar: isDead && deathDateLunar ? deathDateLunar : null,
      placeOfBirth: placeOfBirth || null,
      placeOfBurial: isDead && placeOfBurial ? placeOfBurial : null,
      fatherId: fatherId || null,
      motherId: motherId || null,
      spouseIds: selectedSpouses,
      anniversaryNote: isDead && deathDateLunar ? anniversaryNote : null,
      reminderDaysBefore: isDead && deathDateLunar ? reminderDaysBefore : null,
      biography: biography || null,
    };

    try {
      const url = isEdit ? `/api/members/${initialData.id}` : "/api/members";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra khi lưu thông tin");
      }

      // Lưu thành công, chuyển hướng về
      router.push(isEdit ? `/members/${initialData.id}` : "/members");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Lưu thất bại:</strong>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột 1 & 2: Thông tin cơ bản & Phả hệ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Thông tin cá nhân */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
              Thông Tin Cơ Bản
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Phạm Hữu Sơn"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]/20 focus:border-[#8c1d1d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">
                  Giới tính <span className="text-red-500">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]/20 focus:border-[#8c1d1d]"
                >
                  <option value="MALE">Nam giới</option>
                  <option value="FEMALE">Nữ giới</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">
                  Đời thứ mấy <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={generation}
                  onChange={(e) => setGeneration(parseInt(e.target.value) || 1)}
                  className="w-full border border-stone-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]/20 focus:border-[#8c1d1d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">
                  Chi / Nhánh trong họ
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Chi trưởng, Chi hai"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]/20 focus:border-[#8c1d1d]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">
                  Ảnh chân dung (Photo URL)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]/20 focus:border-[#8c1d1d]"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Quan hệ dòng họ (Cha, Mẹ, Vợ Chồng) */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
              Mối Quan Hệ Phả Hệ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">
                  Cha (Bố)
                </label>
                <select
                  value={fatherId}
                  onChange={(e) => setFatherId(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]/20 focus:border-[#8c1d1d]"
                >
                  <option value="">-- Không rõ hoặc Cụ tổ đời 1 --</option>
                  {potentialFathers.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.fullName} (Đời {f.generation} - {f.branch || "Gốc"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">
                  Mẹ
                </label>
                <select
                  value={motherId}
                  onChange={(e) => setMotherId(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]/20 focus:border-[#8c1d1d]"
                >
                  <option value="">-- Không rõ hoặc Cụ tổ đời 1 --</option>
                  {potentialMothers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} (Đời {m.generation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-600 uppercase mb-2">
                  Vợ / Chồng (Hôn phối) - Có thể chọn nhiều
                </label>
                <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 max-h-48 overflow-y-auto space-y-2">
                  {potentialSpouses.length === 0 ? (
                    <p className="text-xs text-stone-400 italic text-center py-2">
                      Không có thành viên nào khác để ghép đôi.
                    </p>
                  ) : (
                    potentialSpouses.map(spouse => (
                      <label key={spouse.id} className="flex items-center space-x-2.5 text-xs text-stone-700 cursor-pointer hover:bg-stone-100 p-1.5 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedSpouses.includes(spouse.id)}
                          onChange={() => handleSpouseToggle(spouse.id)}
                          className="rounded border-stone-300 text-[#8c1d1d] focus:ring-[#8c1d1d] h-4 w-4"
                        />
                        <span>
                          {spouse.fullName} (Đời {spouse.generation} • {spouse.gender === "MALE" ? "Nam" : "Nữ"})
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Tiểu sử */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
              Lược Sử Cuộc Đời
            </h3>
            <div>
              <textarea
                rows={5}
                placeholder="Nhập tóm tắt tiểu sử cuộc đời, các cống hiến, giải thưởng, chức vụ hoặc những kỷ niệm nổi bật..."
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]/20 focus:border-[#8c1d1d] font-serif"
              />
            </div>
          </div>
        </div>

        {/* Cột 3: Ngày sinh/mất & Cấu hình ngày giỗ (Kỵ nhật) */}
        <div className="space-y-6">
          {/* Card Lịch trình Sự sống */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
              Sự Sinh & Sự Tử
            </h3>

            {/* Ngày sinh */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">
                  Ngày sinh (Dương lịch)
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl p-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">
                  Ngày sinh (Âm lịch)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 15/07/1950"
                  value={birthDateLunar}
                  onChange={(e) => setBirthDateLunar(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl p-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">
                  Quê quán / Nơi sinh
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Hành Thiện, Nam Định"
                  value={placeOfBirth}
                  onChange={(e) => setPlaceOfBirth(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl p-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]/20"
                />
              </div>
            </div>

            {/* Checkbox Trạng thái Đã mất */}
            <div className="pt-3 border-t border-stone-100">
              <label className="flex items-center space-x-2 text-xs font-bold text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDead}
                  onChange={(e) => setIsDead(e.target.checked)}
                  className="rounded border-stone-300 text-[#8c1d1d] focus:ring-[#8c1d1d] h-4 w-4"
                />
                <span>Thành viên này đã tạ thế (Đã mất)</span>
              </label>
            </div>

            {/* Các trường nếu đã mất */}
            {isDead && (
              <div className="space-y-3 pt-3 border-t border-stone-100 bg-stone-50/50 p-3 rounded-xl border border-stone-100">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">
                    Ngày mất (Dương lịch)
                  </label>
                  <input
                    type="date"
                    value={deathDate}
                    onChange={(e) => setDeathDate(e.target.value)}
                    className="w-full border border-stone-200 rounded-xl p-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]/20 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">
                    Ngày mất (Âm lịch) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required={isDead}
                    placeholder="Ví dụ: 12/03/2010"
                    value={deathDateLunar}
                    onChange={(e) => setDeathDateLunar(e.target.value)}
                    className="w-full border border-stone-200 rounded-xl p-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]/20 bg-white"
                  />
                  <p className="text-[9px] text-stone-400 mt-1">Sử dụng định dạng ngày/tháng để làm kỵ nhật (ngày giỗ)</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">
                    Nơi an táng (Mộ phần)
                  </label>
                  <input
                    type="text"
                    placeholder="Nghĩa trang quê nhà..."
                    value={placeOfBurial}
                    onChange={(e) => setPlaceOfBurial(e.target.value)}
                    className="w-full border border-stone-200 rounded-xl p-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]/20 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card Cấu hình Ngày Giỗ (Kỵ nhật) nếu đã mất */}
          {isDead && deathDateLunar && (
            <div className="bg-[#8c1d1d]/5 border border-[#8c1d1d]/20 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-serif text-base font-bold text-[#8c1d1d] border-b border-[#8c1d1d]/10 pb-2">
                Thiết Lập Ngày Giỗ
              </h3>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">
                  Nhắc lịch trước bao nhiêu ngày
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={reminderDaysBefore}
                  onChange={(e) => setReminderDaysBefore(parseInt(e.target.value) || 0)}
                  className="w-full border border-stone-200 rounded-xl p-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]/20 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">
                  Ghi chú ngày giỗ (Nơi tổ chức / Người lo cúng)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ghi nhận nơi cúng giỗ, người lo cúng bái chạp tế chính trong họ..."
                  value={anniversaryNote}
                  onChange={(e) => setAnniversaryNote(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl p-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]/20 bg-white"
                />
              </div>
            </div>
          )}

          {/* Panel Nút Hành Động gửi */}
          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#8c1d1d] hover:bg-[#701515] text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md transition-colors flex items-center justify-center space-x-2 border border-[#ffd700]/30"
            >
              <Save className="h-4.5 w-4.5 text-[#ffd700]" />
              <span>{isSubmitting ? "Đang lưu..." : isEdit ? "Cập Nhật Thông Tin" : "Thêm Vào Gia Phả"}</span>
            </button>
            
            <Link
              href={isEdit ? `/members/${initialData.id}` : "/members"}
              className="w-full text-center bg-stone-100 hover:bg-stone-200 text-stone-700 py-3 px-4 rounded-xl text-xs font-semibold transition-colors block"
            >
              Hủy bỏ
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
