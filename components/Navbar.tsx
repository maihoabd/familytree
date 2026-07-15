"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, GitBranch, Users, Calendar, CalendarDays, Award } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Trang Chủ", href: "/", icon: Home },
    { name: "Cây Gia Phả", href: "/tree", icon: GitBranch },
    { name: "Thành Viên", href: "/members", icon: Users },
    { name: "Ngày Giỗ (Kỵ Nhật)", href: "/anniversaries", icon: Calendar },
    { name: "Lịch Trực Quan", href: "/anniversaries/calendar", icon: CalendarDays },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#8c1d1d]/90 backdrop-blur-md border-b border-[#ffd700]/30 shadow-lg text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo / Dòng họ */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 group">
              <Award className="h-7 w-7 text-[#ffd700] group-hover:rotate-12 transition-transform duration-300" />
              <div className="flex flex-col">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-wide text-[#ffd700]">
                  NGUYỄN TỘC
                </span>
                <span className="text-[10px] text-[#ffd700]/80 tracking-wider">
                  Gia phả & Kỵ nhật
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    active
                      ? "bg-[#ffd700] text-[#8c1d1d] shadow-md transform scale-[1.02]"
                      : "hover:bg-white/10 hover:text-[#ffd700] text-gray-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-[#ffd700] hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ffd700] transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Mở menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-screen opacity-100 border-t border-[#ffd700]/20" : "max-h-0 opacity-0 overflow-hidden"
        }`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3 bg-[#8c1d1d]">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all ${
                  active
                    ? "bg-[#ffd700] text-[#8c1d1d] shadow-sm"
                    : "text-gray-200 hover:bg-white/10 hover:text-[#ffd700]"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
