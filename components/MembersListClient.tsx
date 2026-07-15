"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, UserPlus, Users, Eye, SlidersHorizontal } from "lucide-react";

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
}

interface MembersListClientProps {
  initialMembers: Member[];
}

export default function MembersListClient({ initialMembers }: MembersListClientProps) {
  const [search, setSearch] = useState("");
  const [selectedGeneration, setSelectedGeneration] = useState<string>("all");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Lấy danh sách các đời duy nhất có trong dữ liệu để làm bộ lọc
  const generations = useMemo(() => {
    const gens = initialMembers.map(m => m.generation);
    return Array.from(new Set(gens)).sort((a, b) => a - b);
  }, [initialMembers]);

  // Lấy danh sách các chi nhánh duy nhất để làm bộ lọc
  const branches = useMemo(() => {
    const brs = initialMembers.map(m => m.branch).filter(Boolean) as string[];
    return Array.from(new Set(brs)).sort();
  }, [initialMembers]);

  // Lọc danh sách thành viên theo các tiêu chí chọn
  const filteredMembers = useMemo(() => {
    return initialMembers.filter(m => {
      const matchSearch = m.fullName.toLowerCase().includes(search.toLowerCase().trim());
      const matchGen = selectedGeneration === "all" || m.generation === parseInt(selectedGeneration);
      const matchBranch = selectedBranch === "all" || m.branch === selectedBranch;
      const matchGender = selectedGender === "all" || m.gender === selectedGender;
      
      let matchStatus = true;
      if (selectedStatus === "living") matchStatus = !m.isDead;
      else if (selectedStatus === "deceased") matchStatus = m.isDead;

      return matchSearch && matchGen && matchBranch && matchGender && matchStatus;
    });
  }, [initialMembers, search, selectedGeneration, selectedBranch, selectedGender, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Thanh công cụ: Tìm kiếm & Thêm mới */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo họ tên thành viên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]/20 focus:border-[#8c1d1d] bg-stone-50"
            />
          </div>

          <Link
            href="/members/new"
            className="bg-[#8c1d1d] hover:bg-[#701515] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors flex items-center justify-center space-x-2 self-start md:self-auto"
          >
            <UserPlus className="h-4.5 w-4.5" />
            <span>Thêm Thành Viên Mới</span>
          </Link>
        </div>

        {/* Bộ lọc nâng cao */}
        <div className="border-t border-stone-100 pt-4">
          <div className="flex items-center space-x-2 text-stone-600 text-xs font-semibold mb-3">
            <SlidersHorizontal className="h-4 w-4 text-stone-500" />
            <span>Bộ lọc nâng cao:</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Đời thứ */}
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] text-stone-400 uppercase font-bold">Thế hệ / Đời</label>
              <select
                value={selectedGeneration}
                onChange={(e) => setSelectedGeneration(e.target.value)}
                className="w-full border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#8c1d1d]"
              >
                <option value="all">Tất cả các đời</option>
                {generations.map(gen => (
                  <option key={gen} value={gen}>Đời thứ {gen}</option>
                ))}
              </select>
            </div>

            {/* Chi / Nhánh */}
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] text-stone-400 uppercase font-bold">Chi / Nhánh</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#8c1d1d]"
              >
                <option value="all">Tất cả các chi</option>
                {branches.map(br => (
                  <option key={br} value={br}>{br}</option>
                ))}
              </select>
            </div>

            {/* Giới tính */}
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] text-stone-400 uppercase font-bold">Giới tính</label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#8c1d1d]"
              >
                <option value="all">Tất cả giới tính</option>
                <option value="MALE">Nam giới</option>
                <option value="FEMALE">Nữ giới</option>
              </select>
            </div>

            {/* Trạng thái sinh tử */}
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] text-stone-400 uppercase font-bold">Trạng thái</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#8c1d1d]"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="living">Còn sống</option>
                <option value="deceased">Đã mất</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Kết quả tìm kiếm */}
      <div className="flex justify-between items-center text-xs text-stone-500 px-1">
        <p>Tìm thấy <strong>{filteredMembers.length}</strong> thành viên khớp điều kiện lọc</p>
      </div>

      {/* Grid Danh sách thành viên dạng Card */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
          <Users className="h-12 w-12 text-stone-300 mx-auto mb-2" />
          <p className="text-stone-500 font-medium">Không tìm thấy thành viên nào phù hợp.</p>
          <p className="text-stone-400 text-xs mt-1">Hãy thử đổi từ khóa tìm kiếm hoặc chỉnh lại các bộ lọc phía trên.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                member.isDead ? "border-stone-200 bg-stone-50/50" : "border-stone-200"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    member.gender === "MALE" ? "bg-sky-50 text-sky-700 border border-sky-200" : "bg-pink-50 text-pink-700 border border-pink-200"
                  }`}>
                    Đời thứ {member.generation} • {member.gender === "MALE" ? "Nam" : "Nữ"}
                  </span>
                  
                  {member.isDead && (
                    <span className="text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>✝</span> Đã mất
                    </span>
                  )}
                </div>

                <h4 className="font-serif text-lg font-bold text-stone-900 mb-1">
                  {member.fullName}
                </h4>

                {member.branch && (
                  <p className="text-xs text-[#8c1d1d] font-medium mb-2">
                    {member.branch}
                  </p>
                )}

                <div className="text-xs text-stone-500 space-y-1 mb-4">
                  <p>
                    <span className="text-stone-400">Sinh nhật:</span> {member.birthDateLunar ? `${member.birthDateLunar} (Âm lịch)` : "Không rõ"}
                  </p>
                  {member.isDead && (
                    <p>
                      <span className="text-stone-400">Tạ thế:</span> {member.deathDateLunar ? `${member.deathDateLunar} (Âm lịch)` : "Không rõ"}
                    </p>
                  )}
                  {member.placeOfBirth && (
                    <p className="truncate">
                      <span className="text-stone-400">Quê quán:</span> {member.placeOfBirth}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-stone-100 pt-3 flex gap-2">
                <Link
                  href={`/members/${member.id}`}
                  className="flex-grow bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Xem Chi Tiết</span>
                </Link>
                <Link
                  href={`/members/${member.id}/edit`}
                  className="bg-[#8c1d1d]/10 hover:bg-[#8c1d1d]/20 text-[#8c1d1d] px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  Sửa
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
