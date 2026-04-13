"use client";

/**
 * A stylised mock-up of the Petal & Prosper dashboard, used as
 * a visual centrepiece on the marketing landing page. Purely
 * decorative -- no real data, no interactivity.
 */

export function DashboardPreview() {
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Glow behind the card */}
      <div className="absolute -inset-4 bg-gradient-to-b from-[#C9A96E]/20 via-[#2D6A4F]/10 to-transparent rounded-3xl blur-2xl pointer-events-none" />

      {/* Browser chrome */}
      <div className="relative bg-white rounded-2xl shadow-2xl shadow-black/30 overflow-hidden border border-white/20">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-8">
            <div className="bg-white border border-gray-200 rounded-md px-3 py-1 text-[11px] text-gray-400 text-center max-w-xs mx-auto">
              app.petalandprosper.co.uk
            </div>
          </div>
        </div>

        {/* Dashboard layout */}
        <div className="flex min-h-[340px]">
          {/* Sidebar mock */}
          <div className="hidden sm:flex w-44 flex-col bg-gradient-to-b from-[#1B4332] to-[#2D6A4F] p-4 gap-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#C9A96E]">
                  <path d="M12 3C12 3 8 7 8 12C8 15.5 10 18 12 18C14 18 16 15.5 16 12C16 7 12 3 12 3Z" />
                  <path d="M12 18V22" />
                  <path d="M9 21H15" />
                </svg>
              </div>
              <span className="text-white/90 text-xs font-semibold">Petal & Prosper</span>
            </div>
            {[
              { label: "Home", active: true },
              { label: "Enquiries", active: false },
              { label: "Orders", active: false },
              { label: "Proposals", active: false },
              { label: "Invoices", active: false },
              { label: "Production", active: false },
              { label: "Libraries", active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] ${
                  item.active
                    ? "bg-white/15 text-white font-medium"
                    : "text-white/50"
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${item.active ? "bg-[#C9A96E]" : "bg-transparent"}`} />
                {item.label}
              </div>
            ))}
          </div>

          {/* Main content mock */}
          <div className="flex-1 p-5 bg-gray-50/80">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-sm font-bold text-gray-900">Good morning</div>
                <div className="text-[10px] text-gray-400">Monday, 13 April 2026</div>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#1B4332] flex items-center justify-center text-white text-[9px] font-bold">
                SC
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { label: "New enquiries", value: "7", colour: "bg-blue-50 text-blue-600" },
                { label: "Active orders", value: "23", colour: "bg-emerald-50 text-emerald-600" },
                { label: "Due this week", value: "5", colour: "bg-amber-50 text-amber-600" },
                { label: "Revenue (MTD)", value: "£14.2k", colour: "bg-purple-50 text-purple-600" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                  <div className={`text-lg font-bold ${stat.colour.split(" ")[1]}`}>
                    {stat.value}
                  </div>
                  <div className="text-[9px] text-gray-400 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Two column */}
            <div className="grid grid-cols-2 gap-3">
              {/* Today card */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="text-[10px] font-semibold text-gray-700 mb-3">Today</div>
                <div className="space-y-2">
                  {[
                    { name: "Jessica Carter", tag: "Production", tagCol: "bg-emerald-100 text-emerald-700" },
                    { name: "Helen Brooks", tag: "Delivery", tagCol: "bg-blue-100 text-blue-700" },
                    { name: "Martha Lane", tag: "Setup", tagCol: "bg-amber-100 text-amber-700" },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-700">{item.name}</span>
                      <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-full ${item.tagCol}`}>
                        {item.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Orders card */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="text-[10px] font-semibold text-gray-700 mb-3">Recent orders</div>
                <div className="space-y-2">
                  {[
                    { name: "Bridal bouquet", price: "£245.00", status: "confirmed" },
                    { name: "Table centres x6", price: "£480.00", status: "draft" },
                    { name: "Ceremony arch", price: "£650.00", status: "confirmed" },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-700">{item.name}</span>
                      <span className="text-[10px] font-bold text-[#1B4332]">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
