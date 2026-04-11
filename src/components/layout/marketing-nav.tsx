"use client";

import Link from "next/link";
import { Flower, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navBase = "sticky top-0 z-50 transition-all duration-300";
  // White nav with dark text at all scroll positions. A subtle shadow
  // appears once the user scrolls to visually ground the sticky bar as
  // content moves under it.
  const navBg = scrolled
    ? "bg-white border-b border-gray-200 shadow-sm"
    : "bg-white border-b border-gray-100";

  const textColor = "text-[#1B4332]";
  const linkColor = "text-gray-700 hover:text-[#2D6A4F]";
  const loginColor = "text-[#2D6A4F] hover:text-[#1B4332]";
  const signupBg = "bg-[#2D6A4F] text-white hover:bg-[#1B4332]";

  return (
    <nav className={`${navBase} ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link
            href="/"
            className={`flex items-center gap-2 font-serif font-bold text-xl transition-colors ${textColor}`}
          >
            <Flower className="text-[#D4A0A7]" size={28} />
            <span>Petal & Prosper</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            {["features", "pricing", "faqs"].map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className={`font-medium transition-colors text-sm capitalize ${linkColor}`}
              >
                {id === "faqs" ? "FAQs" : id.charAt(0).toUpperCase() + id.slice(1)}
              </a>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/login" className={`font-semibold transition-colors text-sm ${loginColor}`}>
              Log in
            </Link>
            <Link
              href="/signup"
              className={`px-5 py-2.5 rounded-lg transition-all font-semibold text-sm shadow-md hover:shadow-lg backdrop-blur-sm ${signupBg}`}
            >
              Start free trial
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden transition-colors text-[#1B4332]"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-6 border-t border-gray-200 pt-6 bg-white">
            <div className="flex flex-col gap-4 mb-6">
              {["features", "pricing", "faqs"].map((id) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="text-gray-700 font-medium hover:text-[#2D6A4F] transition-colors capitalize"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {id === "faqs" ? "FAQs" : id.charAt(0).toUpperCase() + id.slice(1)}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3 pt-6 border-t border-gray-200">
              <Link
                href="/login"
                className="text-center text-[#2D6A4F] hover:text-[#1B4332] font-semibold py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-center bg-[#2D6A4F] text-white px-6 py-2.5 rounded-lg hover:bg-[#1B4332] transition-all font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                Start free trial
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
