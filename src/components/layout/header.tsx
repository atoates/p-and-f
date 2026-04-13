"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { GlobalSearch } from "./global-search";

export function Header() {
  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200/60 h-16 flex items-center justify-between px-4 sm:px-8 z-30">
      {/* Spacer for mobile hamburger button */}
      <div className="lg:hidden w-12" />
      <h1 className="text-lg sm:text-xl font-serif font-semibold text-gray-800 tracking-tight">
        Dashboard
      </h1>

      <div className="flex items-center gap-2 sm:gap-4">
        <GlobalSearch />
        <Link
          href="/settings"
          aria-label="Settings"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-150"
        >
          <Settings size={18} className="sm:w-5 sm:h-5" />
        </Link>
      </div>
    </header>
  );
}
