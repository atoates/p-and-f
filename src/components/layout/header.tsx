"use client";

import Link from "next/link";
import { Settings } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-8 z-30">
      {/* Spacer for mobile hamburger button */}
      <div className="lg:hidden w-12" />
      <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">
        Dashboard
      </h1>

      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          href="/settings"
          aria-label="Settings"
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-green rounded-md"
        >
          <Settings size={20} className="sm:w-6 sm:h-6" />
        </Link>
      </div>
    </header>
  );
}
