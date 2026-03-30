"use client";

import { Bell, Settings } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 left-64 right-0 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 z-30">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
          <Bell size={24} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
          <Settings size={24} />
        </button>
      </div>
    </header>
  );
}
