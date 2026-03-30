"use client";

import Link from "next/link";
import { Flower } from "lucide-react";

export function MarketingNav() {
  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Flower className="text-accent-pink" size={24} />
            <span className="text-primary-green">Petal & Prosper</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-primary-green">
              Features
            </a>
            <a href="#benefits" className="text-gray-600 hover:text-primary-green">
              Benefits
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-primary-green">
              Pricing
            </a>
            <a href="#faqs" className="text-gray-600 hover:text-primary-green">
              FAQs
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-primary-green font-medium hover:text-light-green"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-primary-green text-white px-6 py-2 rounded-lg hover:bg-light-green transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
