import React from "react";
import {} from "./PalaceDoor";
import ZellijMosaic from "./ZellijMosaic";

export default function Hero() {
  return (
    <section
      id="home"
      dir="rtl"
      className="relative overflow-hidden pb-20 pt-12 md:pb-28 md:pt-16"
    >
      {/* Tadelakt wall with a zellij field */}
      <div className="tadelakt pointer-events-none absolute inset-0" />
      <ZellijMosaic
        tone="ivory"
        tile={56}
        opacity={0.07}
        detail={false}
        light={false}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(125% 95% at 80% 28%, rgba(248,245,240,0.94) 0%, rgba(248,245,240,0.6) 44%, rgba(248,245,240,0.12) 76%)",
        }}
      />

      {/* Corner ornaments */}
      <div className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rotate-45 border border-[#174536]/[0.08]" />
      <div className="pointer-events-none absolute -right-16 top-16 h-40 w-40 rotate-45 border border-[#b99559]/[0.1]" />
      <div className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rotate-45 border border-[#b99559]/[0.07]" />

      <div className="relative z-10 mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:px-14">
        {/* Text */}
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rotate-45 bg-[#b99559]" />
            <span className="text-[11px] font-medium tracking-[0.24em] text-[#a17b42]">
              أصالة مغربية · صنع بحب
            </span>
            <span className="h-px w-10 bg-[#b99559]" />
          </div>

          <h1 className="mt-6 font-serif text-[42px] font-bold leading-[1.35] text-[#174536] sm:text-5xl md:text-6xl xl:text-[68px]">
            حكاية طين
            <span className="mt-1 block text-[#b99559]">وفنٌّ لا يزول</span>
          </h1>

          <div className="mt-7 flex items-center gap-3">
            <span className="h-[2px] w-16 bg-[#b99559]" />
            <span className="text-xs text-[#b99559]">✦</span>
            <span className="h-px w-8 bg-[#d8c8a9]" />
          </div>

          <p className="mt-6 max-w-lg text-[15px] leading-9 text-[#75675a] md:text-base md:leading-10">
            اكتشفوا سحر الفخار المغربي، حيث تلتقي أنامل الحرفيين بعبق التراث
            لتصنع قطعاً فنية تحمل بين تفاصيلها روح المغرب وأصالته.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            <a
              href="#products"
              className="group inline-flex items-center gap-4 border border-[#b99559] bg-[#174536] px-8 py-4 text-[#faf8f2] shadow-[0_18px_30px_-18px_rgba(23,69,54,0.7)] transition-all duration-500 hover:bg-[#b99559] hover:text-[#173d32]"
            >
              <span className="text-sm font-medium">اكتشف المجموعة</span>
              <span className="text-lg transition-transform duration-300 group-hover:-translate-x-1.5">
                ←
              </span>
            </a>

            <a
              href="#collections"
              className="group inline-flex items-center gap-2 border-b border-[#b99559] pb-1 text-sm text-[#75675a] transition-colors hover:text-[#b99559]"
            >
              اكتشف حكايتنا
              <span className="text-[10px] text-[#b99559] transition-transform duration-300 group-hover:-translate-x-1">
                ◆
              </span>
            </a>
          </div>

          {/* Craft details */}
          <div className="mt-12 flex w-full max-w-md items-center gap-8 border-t border-[#e4dac9] pt-7">
            <div>
              <p className="font-serif text-2xl text-[#174536]">100%</p>
              <p className="mt-1 text-[11px] text-[#8c7a6b]">
                روح الصناعة التقليدية
              </p>
            </div>
            <div className="h-10 w-px bg-[#d8c8a9]" />
            <div>
              <p className="font-serif text-2xl text-[#174536]">MA</p>
              <p className="mt-1 text-[11px] text-[#8c7a6b]">إبداع مغربي أصيل</p>
            </div>
            <div className="h-10 w-px bg-[#d8c8a9]" />
            <div>
              <p className="font-serif text-2xl text-[#b99559]">✦</p>
              <p className="mt-1 text-[11px] text-[#8c7a6b]">نقش يدوي</p>
            </div>
          </div>
        </div>

        {/* Palace doorway */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[540px]">
            <div className="relative overflow-hidden border border-[#c9b692]/80 shadow-[0_44px_80px_-38px_rgba(15,50,39,0.65)]">
              {/* Empty image area — keeps container, frame, proportions and layout intact. */}
              <svg
                className="block h-full w-full"
                viewBox="0 0 420 440"
                preserveAspectRatio="none"
              >
                <rect
                  x="0"
                  y="0"
                  width="420"
                  height="440"
                  fill="none"
                  stroke="none"
                  pointerEvents="none"
                />
              </svg>
            </div>

            {/* Seal */}
            <div className="absolute -bottom-5 left-4 flex h-[74px] w-[74px] items-center justify-center rounded-full border border-[#b99559]/60 bg-[#174536] shadow-xl">
              <div className="flex h-[58px] w-[58px] flex-col items-center justify-center rounded-full border border-[#d8bb83]/70 text-center">
                <span className="font-serif text-base text-[#e9d6a8]">100%</span>
                <span className="mt-0.5 text-[8px] tracking-[0.1em] text-[#cbb98f]">
                  صنع يدوي
                </span>
              </div>
            </div>

            {/* Caption card */}
            <div className="absolute bottom-10 right-5 border-r-2 border-[#b99559] bg-[#f8f5f0]/95 px-5 py-3 shadow-lg backdrop-blur-sm">
              <p className="text-[13px] font-bold text-[#174536]">
                جمال التفاصيل المغربية
              </p>
              <p className="mt-1 text-[11px] text-[#8c7a6b]">
                تراث يحكي قصة أجيال
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom ornament */}
      <div className="relative z-10 mt-16 flex items-center justify-center gap-4">
        <span className="h-px w-14 bg-[#d9c9aa]" />
        <span className="text-base text-[#b99559]">❖</span>
        <span className="h-px w-14 bg-[#d9c9aa]" />
      </div>
    </section>
  );
}
