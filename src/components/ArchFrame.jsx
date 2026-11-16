import React, { useId } from "react";
import {
  WIDE_MID,
  WIDE_OUTER,
  WIDE_REVEAL,
  WIDE_STAGE,
  WIDE_STONE,
  WIDE_ZELLIJ_OUTER,
} from "./archGeometry";

/* 340 x 400 doorway — four across the row, with a 63%-wide image stage. */
const SIZES = {
  sm: "max-w-[172px]",
  md: "max-w-[214px] sm:max-w-[254px] lg:max-w-[296px]",
  lg: "max-w-[310px] sm:max-w-[330px]",
  hero: "max-w-[480px]",
};

/**
 * A Moroccan palace doorway: a tall pointed horseshoe arch set into a stone
 * lip, with a thick emerald frame, a carved bead line, a zellij archivolt, a
 * plaster reveal, a generous image stage and a zellij threshold.
 */
export default function ArchFrame({
  title,
  subtitle,
  art = "tagine",
  image,
  imageAlt,
  size = "md",
  caption = true,
  className = "",
}) {
  const uid = useId().replace(/:/g, "");
  const id = (name) => `${uid}-${name}`;
  const gold = `url(#${id("gold")})`;
  const stone = `url(#${id("stone")})`;
  const zellij = `url(#${id("zellij")})`;

  return (
    <div className={`group/frame flex w-full flex-col items-center ${className}`}>
      <div
        className={`relative w-full ${SIZES[size] || SIZES.md} transition-transform duration-500 ease-out group-hover/frame:-translate-y-1.5`}
      >
        <svg
          viewBox="0 0 340 400"
          className="block h-auto w-full drop-shadow-[0_20px_28px_rgba(15,50,39,0.22)]"
          role="img"
          aria-label={imageAlt || title || "مدخل مغربي تقليدي"}
        >
          <defs>
            <linearGradient id={id("stone")} x1="0.05" y1="0" x2="0.9" y2="1">
              <stop offset="0" stopColor="#f6eedd" />
              <stop offset="0.5" stopColor="#e7dcc4" />
              <stop offset="1" stopColor="#cbba9a" />
            </linearGradient>

            <linearGradient id={id("emerald")} x1="0.1" y1="0" x2="0.9" y2="1">
              <stop offset="0" stopColor="#2d6d57" />
              <stop offset="0.4" stopColor="#174536" />
              <stop offset="0.78" stopColor="#113d30" />
              <stop offset="1" stopColor="#0a2921" />
            </linearGradient>

            <linearGradient id={id("gold")} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f2e0b4" />
              <stop offset="0.35" stopColor="#d3b478" />
              <stop offset="0.62" stopColor="#b99559" />
              <stop offset="1" stopColor="#8a6a38" />
            </linearGradient>

            <linearGradient id={id("ivory")} x1="0.1" y1="0" x2="0.9" y2="1">
              <stop offset="0" stopColor="#fdfaf4" />
              <stop offset="0.45" stopColor="#f6efe2" />
              <stop offset="1" stopColor="#e2d5bb" />
            </linearGradient>

            {/* recessed niche behind the pottery */}
            <linearGradient id={id("niche")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ded2b8" />
              <stop offset="0.32" stopColor="#ede4d1" />
              <stop offset="0.7" stopColor="#f8f2e6" />
              <stop offset="1" stopColor="#fbf7ee" />
            </linearGradient>

            <radialGradient id={id("glow")} cx="50%" cy="74%" r="58%">
              <stop offset="0" stopColor="#fff6e2" stopOpacity="0.85" />
              <stop offset="1" stopColor="#fff6e2" stopOpacity="0" />
            </radialGradient>

            <linearGradient id={id("shade")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0.55" stopColor="#0b2b22" stopOpacity="0" />
              <stop offset="1" stopColor="#0b2b22" stopOpacity="0.3" />
            </linearGradient>

            <pattern
              id={id("zellij")}
              width="13"
              height="13"
              patternUnits="userSpaceOnUse"
            >
              <rect width="13" height="13" fill="#123c30" />
              <path
                d="M6.5 1 8.4 4.6 12 6.5 8.4 8.4 6.5 12 4.6 8.4 1 6.5 4.6 4.6Z"
                fill="#c9a768"
              />
              <path d="M6.5 3.6 9.4 6.5 6.5 9.4 3.6 6.5Z" fill="#174536" />
              <circle cx="6.5" cy="6.5" r="1" fill="#f6ecd6" />
            </pattern>

            <filter
              id={id("cast")}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
              colorInterpolationFilters="sRGB"
            >
              <feDropShadow
                dx="1"
                dy="8"
                stdDeviation="6"
                floodColor="#3a2f1f"
                floodOpacity="0.32"
              />
            </filter>

            <clipPath id={id("stage")}>
              <path d={WIDE_STAGE} />
            </clipPath>
          </defs>

          {/* threshold shadow */}
          <ellipse cx="170" cy="397" rx="150" ry="4" fill="#174536" opacity="0.16" />

          {/* stone surround */}
          <path
            d={WIDE_STONE}
            fill={stone}
            stroke={gold}
            strokeWidth="0.9"
            strokeOpacity="0.65"
            filter={`url(#${id("cast")})`}
          />
          <path
            d={WIDE_STONE}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            opacity="0.45"
            transform="translate(-1 -1)"
          />

          {/* emerald frame body */}
          <path
            d={WIDE_OUTER}
            fill={`url(#${id("emerald")})`}
            stroke={gold}
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* carved bead line */}
          <path d={WIDE_MID} fill="none" stroke={gold} strokeWidth="1" opacity="0.5" />
          <path
            d={WIDE_MID}
            fill="none"
            stroke={gold}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="1.3 6.2"
            opacity="0.9"
          />

          {/* zellij archivolt band */}
          <path
            d={`${WIDE_ZELLIJ_OUTER} ${WIDE_REVEAL}`}
            fillRule="evenodd"
            fill={zellij}
          />
          <path
            d={WIDE_ZELLIJ_OUTER}
            fill="none"
            stroke={gold}
            strokeWidth="1.6"
            opacity="0.9"
          />
          <path d={WIDE_REVEAL} fill="none" stroke={gold} strokeWidth="2.2" />

          {/* carved plaster reveal */}
          <path d={WIDE_REVEAL} fill={`url(#${id("ivory")})`} />
          <path
            d={WIDE_REVEAL}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.3"
            opacity="0.55"
          />

          {/* image stage */}
          <g clipPath={`url(#${id("stage")})`}>
            <rect x="62" y="92" width="216" height="280" fill={`url(#${id("niche")})`} />
            <rect x="62" y="92" width="216" height="280" fill={`url(#${id("glow")})`} />

            {/* Empty image area — keeps container, frame, proportions and layout intact. */}
            <g className="arch-media">
              <rect
                x="62"
                y="92"
                width="216"
                height="280"
                fill="none"
                stroke="none"
                pointerEvents="none"
              />
            </g>

            <rect x="62" y="92" width="216" height="280" fill={`url(#${id("shade")})`} />
            <path
              d={WIDE_STAGE}
              fill="none"
              stroke="#0b2b22"
              strokeWidth="14"
              opacity="0.3"
            />
          </g>

          <path
            d={WIDE_STAGE}
            fill="none"
            stroke={gold}
            strokeWidth="1.2"
            opacity="0.85"
          />

          {/* keystone */}
          <g transform="translate(170 53)">
            <rect x="-5" y="-5" width="10" height="10" fill={gold} />
            <rect
              x="-5"
              y="-5"
              width="10"
              height="10"
              fill={gold}
              transform="rotate(45)"
            />
            <circle r="2.1" fill="#174536" />
          </g>

          {/* springing rosettes */}
          {[31, 309].map((cx) => (
            <g key={cx} transform={`translate(${cx} 298)`}>
              <rect x="-4" y="-4" width="8" height="8" fill={gold} />
              <rect
                x="-4"
                y="-4"
                width="8"
                height="8"
                fill={gold}
                transform="rotate(45)"
              />
              <circle r="1.8" fill="#174536" />
            </g>
          ))}

          {/* zellij threshold course */}
          <rect x="10" y="372" width="320" height="14" fill={zellij} />
          <rect
            x="10"
            y="372"
            width="320"
            height="14"
            fill="none"
            stroke={gold}
            strokeWidth="1.3"
          />

          {/* stone base */}
          <rect x="6" y="386" width="328" height="14" fill={stone} />
          <path d="M6 386H334" stroke="#fbf4e3" strokeWidth="1.4" opacity="0.8" />
          <path d="M6 399.4H334" stroke="#8d7a56" strokeWidth="1" opacity="0.4" />
          {[44, 296].map((cx) => (
            <path
              key={cx}
              d={`M${cx} 391.5l3.4 3.4-3.4 3.4-3.4-3.4Z`}
              fill={gold}
              opacity="0.85"
            />
          ))}
        </svg>
      </div>

      {caption && (
        <div className="mt-5 text-center">
          <div className="flex items-center justify-center gap-2.5 text-[#b99559]">
            <span className="h-px w-5 bg-current opacity-60 transition-all duration-500 group-hover/frame:w-8" />
            <span className="text-[8px] leading-none">✦</span>
            <span className="h-px w-5 bg-current opacity-60 transition-all duration-500 group-hover/frame:w-8" />
          </div>

          <h3 className="mt-2.5 font-serif text-base font-bold leading-7 text-[#174536] transition-colors duration-300 group-hover/frame:text-[#8a6a38] sm:text-lg">
            {title}
          </h3>

          {subtitle && (
            <p className="mt-1 text-[11px] leading-6 text-[#8c7a6b]">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );
}
