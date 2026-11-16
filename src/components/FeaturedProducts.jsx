import React, { useState } from "react";
import ZellijMosaic from "./ZellijMosaic";

export default function FeaturedProducts() {
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);

  const products = [
    {
      id: 1,
      name: "كؤوس أتاي مغربية",
      price: 180,
      category: "فن الضيافة المغربية",
      badge: "الأكثر تميزاً",
      art: "glass",
    },
    {
      id: 2,
      name: "طبق تقديم مزخرف",
      price: 250,
      category: "فن المائدة",
      badge: "قطعة فنية",
      art: "plate",
    },
    {
      id: 3,
      name: "طاجين فخاري",
      price: 320,
      category: "صناعة تقليدية",
      badge: "اختيارنا",
      art: "tagine",
    },
    {
      id: 4,
      name: "فازة فخارية",
      price: 220,
      category: "ديكور مغربي",
      badge: null,
      art: "vase",
    },
    {
      id: 5,
      name: "سلطانية زليج",
      price: 300,
      category: "أناقة المائدة",
      badge: null,
      art: "bowl",
    },
  ];

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const addToCart = (id) => {
    setCart((prev) => [...prev, id]);
  };

  return (
    <section
      id="products"
      dir="rtl"
      className="tadelakt relative overflow-hidden py-20 md:py-28"
    >
      {/* Background */}
      <ZellijMosaic
        tone="sand"
        tile={64}
        opacity={0.05}
        detail={false}
        light={false}
      />
      <div className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rotate-45 border border-[#174536]/[0.05]" />
      <div className="pointer-events-none absolute -right-24 bottom-12 h-64 w-64 rotate-45 border border-[#b99559]/[0.08]" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        {/* Heading */}
        <div className="mb-14 text-center md:mb-16">
          <div className="mb-5 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-[#b99559]" />
            <span className="text-[11px] tracking-[0.22em] text-[#a17b42]">
              مختاراتنا لكم
            </span>
            <span className="h-px w-12 bg-[#b99559]" />
          </div>

          <h2 className="font-serif text-3xl font-bold text-[#174536] md:text-[42px] md:leading-tight">
            قطع فنية مميزة
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-[#8c7a6b] md:text-base">
            اكتشفوا أجمل إبداعات الفخار المغربي، قطع صنعت بعناية لتضفي لمسة من
            الأصالة على منزلكم.
          </p>

          <div className="mt-7 flex items-center justify-center gap-3">
            <span className="h-px w-16 bg-[#c5a66e]" />
            <span className="text-lg text-[#b99559]">✧</span>
            <span className="h-px w-16 bg-[#c5a66e]" />
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {products.map((item, index) => (
            <article
              key={item.id}
              className="group relative flex flex-col overflow-hidden border border-[#d9c9a7] bg-[#fdfbf6] transition-all duration-500 animate-fade-up hover:-translate-y-2 hover:border-[#b99559] hover:shadow-[0_28px_50px_-26px_rgba(23,69,54,0.5)]"
              style={{ animationDelay: `${140 + index * 90}ms` }}
            >
              {/* Inner hairline */}
              <div className="pointer-events-none absolute inset-[5px] z-20 border border-[#b99559]/25 transition-colors duration-500 group-hover:border-[#b99559]/60" />

              {/* Media */}
              <div className="relative h-56 overflow-hidden bg-gradient-to-b from-[#f2ece0] to-[#e8e9df] sm:h-60">
                <ZellijMosaic
                  tone="sand"
                  tile={40}
                  opacity={0.14}
                  detail={false}
                  light={false}
                />
                <div className="absolute inset-x-5 top-5 h-px bg-[#b99559]/35" />

                {/* Corner motifs */}
                <span className="absolute right-2.5 top-2.5 h-3.5 w-3.5 border-r border-t border-[#b99559]/50" />
                <span className="absolute left-2.5 top-2.5 h-3.5 w-3.5 border-l border-t border-[#b99559]/50" />
                <span className="absolute bottom-2.5 right-2.5 h-3.5 w-3.5 border-b border-r border-[#b99559]/50" />
                <span className="absolute bottom-2.5 left-2.5 h-3.5 w-3.5 border-b border-l border-[#b99559]/50" />

                {/* Empty image area — keeps container, frame, proportions and layout intact. */}
                <div
                  className="arch-media relative z-10 h-full w-full px-4 pb-2 pt-6"
                  aria-hidden="true"
                >
                  <svg
                    className="block h-full w-full"
                    viewBox="0 0 200 200"
                    preserveAspectRatio="none"
                  >
                    <rect
                      x="0"
                      y="0"
                      width="200"
                      height="200"
                      fill="none"
                      stroke="none"
                      pointerEvents="none"
                    />
                  </svg>
                </div>

                {item.badge && (
                  <span className="absolute right-4 top-4 z-20 border border-[#b99559]/60 bg-[#174536] px-3 py-1.5 text-[10px] text-[#e9d6a8] shadow-md">
                    {item.badge}
                  </span>
                )}

                <button
                  onClick={() => toggleFavorite(item.id)}
                  aria-label="إضافة إلى المفضلة"
                  className={`absolute left-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all duration-300 ${
                    favorites.includes(item.id)
                      ? "bg-[#a83d32] text-white"
                      : "bg-[#faf8f2]/95 text-[#174536] hover:bg-[#b99559] hover:text-white"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-[18px] w-[18px]"
                    fill={favorites.includes(item.id) ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path d="M20.8 8.7c0 5.1-8.8 11-8.8 11s-8.8-5.9-8.8-11A4.7 4.7 0 0 1 12 6.3a4.7 4.7 0 0 1 8.8 2.4Z" />
                  </svg>
                </button>
              </div>

              {/* Info */}
              <div className="relative flex flex-1 flex-col px-5 pb-6 pt-4 text-center">
                <span className="text-[10px] tracking-[0.14em] text-[#ad8b55]">
                  {item.category}
                </span>

                <h3 className="mt-2 font-serif text-[17px] font-bold leading-7 text-[#174536] transition-colors duration-300 group-hover:text-[#8a6a38]">
                  {item.name}
                </h3>

                <div className="my-3.5 flex items-center justify-center gap-2 text-[#b99559]">
                  <span className="h-px w-6 bg-current opacity-50" />
                  <span className="text-[7px]">◆</span>
                  <span className="h-px w-6 bg-current opacity-50" />
                </div>

                <div className="mb-5 flex items-baseline justify-center gap-1.5">
                  <span className="font-serif text-xl font-bold text-[#174536]">
                    {item.price}
                  </span>
                  <span className="text-[11px] text-[#8c7a6b]">درهم</span>
                </div>

                <button
                  onClick={() => addToCart(item.id)}
                  className="mt-auto flex w-full items-center justify-center gap-2 border border-[#174536] bg-[#174536] px-3 py-3 text-[11px] text-[#faf8f2] transition-all duration-300 hover:border-[#b99559] hover:bg-[#b99559] hover:text-[#173d32]"
                >
                  <span>أضف إلى السلة</span>
                  <span className="text-sm leading-none">＋</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* View all */}
        <div className="mt-14 flex justify-center">
          <a
            href="#collections"
            className="group flex items-center gap-5 border border-[#174536] px-10 py-4 text-[#174536] transition-all duration-500 hover:bg-[#174536] hover:text-white"
          >
            <span className="text-sm">اكتشف جميع المنتجات</span>
            <span className="transition-transform group-hover:-translate-x-2">←</span>
          </a>
        </div>

        {/* Cart counter */}
        <p className="mt-6 text-center text-xs text-[#8c7a6b]">
          المنتجات المضافة إلى السلة: {cart.length}
        </p>
      </div>
    </section>
  );
}
