import React from "react";
import ArchFrame from "./ArchFrame";
import ZellijMosaic from "./ZellijMosaic";

export default function Categories() {
  const categoriesList = [
    {
      id: 2,
      title: "الكؤوس والفناجين",
      subtitle: "تفاصيل يومية بطابع أصيل",
      art: "glass",
    },
    {
      id: 3,
      title: "أواني المطبخ",
      subtitle: "فن يرافق مائدتك",
      art: "tagine",
    },
    {
      id: 4,
      title: "الصحون والزلايف",
      subtitle: "جمال التفاصيل المغربية",
      art: "plate",
    },
    {
      id: 5,
      title: "الديكورات والفازات",
      subtitle: "لمسة فنية لمنزلك",
      art: "vase",
    },
  ];

  return (
    <section
      id="collections"
      dir="rtl"
      className="tadelakt relative overflow-hidden py-20 md:py-28"
    >
      {/* Background */}
      <ZellijMosaic
        tone="ivory"
        tile={56}
        opacity={0.06}
        detail={false}
        light={false}
      />
      <div className="pointer-events-none absolute -right-28 top-16 h-72 w-72 rotate-45 border border-[#b99559]/[0.1]" />
      <div className="pointer-events-none absolute -left-28 bottom-16 h-72 w-72 rotate-45 border border-[#174536]/[0.08]" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        {/* Heading */}
        <div className="mb-14 text-center md:mb-20">
          <div className="mb-5 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-[#b99559]" />
            <span className="text-[11px] tracking-[0.22em] text-[#a17b42]">
              اكتشفوا عالمنا
            </span>
            <span className="h-px w-12 bg-[#b99559]" />
          </div>

          <h2 className="font-serif text-3xl font-bold text-[#174536] md:text-[42px] md:leading-tight">
            مجموعاتنا الفنية
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-[#806f5e] md:text-base">
            من أنامل حرفيينا إلى منزلكم، اكتشفوا تشكيلة من القطع الفخارية التي
            تجمع بين عراقة التراث المغربي وجمال التصميم.
          </p>

          <div className="mt-7 flex items-center justify-center gap-3">
            <span className="h-px w-16 bg-[#c5a66e]" />
            <span className="text-lg text-[#b99559]">✧</span>
            <span className="h-px w-16 bg-[#c5a66e]" />
          </div>
        </div>

        {/* Arches */}
        <div className="grid grid-cols-2 justify-items-center gap-x-5 gap-y-14 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-8">
          {categoriesList.map((cat, index) => (
            <div
              key={cat.id}
              className="flex w-full animate-fade-up flex-col items-center"
              style={{ animationDelay: `${index * 110}ms` }}
            >
              <ArchFrame title={cat.title} subtitle={cat.subtitle} art={cat.art} />
            </div>
          ))}
        </div>

        {/* Bottom ornament */}
        <div className="mt-16 flex items-center justify-center gap-4 md:mt-20">
          <span className="h-px w-20 bg-[#d9c9aa]" />
          <span className="text-xl text-[#b99559]">❖</span>
          <span className="h-px w-20 bg-[#d9c9aa]" />
        </div>
      </div>
    </section>
  );
}
