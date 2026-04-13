import Image from "next/image";

/**
 * A visual showcase of floristry photography placed between the
 * feature grid and the workflow section. Uses a masonry-style
 * layout with overlapping rounded-corner photos.
 */

const photos = [
  {
    src: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&q=80",
    alt: "Pastel bridal bouquet on a wooden table",
    className: "col-span-2 row-span-2",
    priority: true,
  },
  {
    src: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=400&q=80",
    alt: "Florist arranging pink roses at a workbench",
    className: "col-span-1 row-span-1",
    priority: false,
  },
  {
    src: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400&q=80",
    alt: "Elegant table centrepiece with candles",
    className: "col-span-1 row-span-1",
    priority: false,
  },
  {
    src: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&q=80",
    alt: "Close-up of hand-tied garden roses",
    className: "col-span-1 row-span-2",
    priority: false,
  },
  {
    src: "https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=400&q=80",
    alt: "Wedding ceremony aisle lined with flowers",
    className: "col-span-1 row-span-1",
    priority: false,
  },
  {
    src: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400&q=80",
    alt: "Lavender and eucalyptus dried arrangement",
    className: "col-span-1 row-span-1",
    priority: false,
  },
];

export function PhotoShowcase() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-[#7A5C2E] uppercase tracking-widest mb-4">
            Built for florists
          </p>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-[#1B4332] leading-tight">
            Your craft, your studio,<br />
            <span className="italic">your way.</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[140px] md:auto-rows-[160px]">
          {photos.map((photo, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-2xl group ${photo.className}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                priority={photo.priority}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Subtle overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
