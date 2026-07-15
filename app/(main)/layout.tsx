import Navbar from "@/components/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-amber-50/30 text-gray-800">
      {/* Thanh điều hướng */}
      <Navbar />

      {/* Nội dung trang */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {children}
      </main>

      {/* Chân trang truyền thống */}
      <footer className="bg-stone-900 text-stone-400 py-8 border-t-2 border-[#ffd700]/30 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center md:items-start">
              <h2 className="font-serif text-lg font-bold text-stone-200 tracking-wider">
                GIA PHẢ NGUYỄN TỘC
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Kính cẩn ghi chép và lưu truyền lịch sử thế hệ dòng họ
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end">
              <p className="text-xs text-stone-400 text-center md:text-right">
                © {new Date().getFullYear()} Nguyễn Hữu Gia Tộc. Tất cả các quyền được bảo lưu.
              </p>
              <p className="text-[10px] text-stone-600 mt-1">
                Địa bàn thủy tổ: Hành Thiện, Xuân Trường, Nam Định
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
