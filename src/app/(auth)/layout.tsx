import Image from "next/image";
import { Flower } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel: imagery (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#1B4332]">
        {/* Background photo */}
        <Image
          src="https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1200&q=85"
          alt="Elegant floral arrangement"
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-40"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B4332]/80 via-[#1B4332]/60 to-[#2D6A4F]/70" />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top: brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Flower className="text-[#C9A96E]" size={18} />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Petal & Prosper
            </span>
          </div>

          {/* Centre: quote */}
          <div className="max-w-md">
            <blockquote className="text-2xl sm:text-3xl font-serif text-white/90 leading-relaxed mb-6 italic">
              &ldquo;It&rsquo;s transformed how I run my business. No more spreadsheets, no more chaos.&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/20">
                <Image
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80"
                  alt="Sarah Mitchell"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Sarah Mitchell</p>
                <p className="text-white/60 text-xs">Bloom & Blossom, London</p>
              </div>
            </div>
          </div>

          {/* Bottom: stats */}
          <div className="flex gap-8">
            <div>
              <p className="text-2xl font-serif font-bold text-[#C9A96E]">500+</p>
              <p className="text-white/50 text-xs">UK florists</p>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-[#C9A96E]">10k+</p>
              <p className="text-white/50 text-xs">Events managed</p>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-[#C9A96E]">4.9★</p>
              <p className="text-white/50 text-xs">Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#FAF8F5] to-white">
        <div className="w-full max-w-md">
          {/* Mobile brand header (hidden on lg) */}
          <div className="text-center mb-6 sm:mb-8 lg:hidden">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Flower className="text-[#D4A0A7]" size={28} />
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1B4332]">
                Petal & Prosper
              </h1>
            </div>
            <p className="text-gray-500 text-sm">
              Floristry business management
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 sm:p-8">
            {children}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            &copy; {new Date().getFullYear()} Petal & Prosper. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
