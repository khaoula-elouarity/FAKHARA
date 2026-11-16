import React, { useId } from "react";
import { PotteryArt } from "./PotteryArt";
import {
  PALACE_APERTURE,
  PALACE_FRAME,
  PALACE_ZELLIJ_INNER,
  PALACE_ZELLIJ_OUTER,
} from "./palaceGeometry";

/**
 * A grand Moroccan palace entrance: a wide pointed horseshoe arch set into
 * thick stone piers, with a carved plaster frame, a zellij archivolt, gold
 * detailing and a stone threshold. Built in layers (wall, frame, tile band,
 * reveal, opening) so the doorway has real architectural depth.
 */
export default function PalaceDoor({ art = "still", className = "" }) {
  const uid = useId().replace(/:/g, "");
  const id = (name) => `${uid}-${name}`;
  const gold = `url(#${id("gold")})`;
  const zellij = `url(#${id("zellij")})`;

  return (
    <svg
      viewBox="0 0 420 440"
      className={`block h-auto w-full ${className}`}
      role="img"
      aria-label="مدخل قصر مغربي تقليدي بقوس حدوة الفرس"
    >
      <defs>
        <linearGradient id={id("stone")} x1="0" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#f4ecdb" />
          <stop offset="0.45" stopColor="#e5dac2" />
          <stop offset="1" stopColor="#cbba9b" />
        </linearGradient>

        <linearGradient id={id("plaster")} x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#fdf9ef" />
          <stop offset="0.45" stopColor="#f1e7d3" />
          <stop offset="1" stopColor="#d9cbb0" />
        </linearGradient>

        <linearGradient id={id("gold")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4e3b8" />
          <stop offset="0.4" stopColor="#c9a768" />
          <stop offset="0.7" stopColor="#b99559" />
          <stop offset="1" stopColor="#8a6a38" />
        </linearGradient>

        <linearGradient id={id("step")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2d5b7" />
          <stop offset="1" stopColor="#bdae8a" />
        </linearGradient>

        <radialGradient id={id("interior")} cx="50%" cy="74%" r="74%">
          <stop offset="0" stopColor="#327058" />
          <stop offset="0.45" stopColor="#174536" />
          <stop offset="1" stopColor="#07231b" />
        </radialGradient>

        <radialGradient id={id("glow")} cx="50%" cy="76%" r="58%">
          <stop offset="0" stopColor="#ffe9bd" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffe9bd" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={id("daylight")} x1="0.05" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="0.42" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="0.78" stopColor="#3d3220" stopOpacity="0.1" />
          <stop offset="1" stopColor="#3d3220" stopOpacity="0.26" />
        </linearGradient>

        <pattern
          id={id("zellij")}
          width="22"
          height="22"
          patternUnits="userSpaceOnUse"
        >
          <rect width="22" height="22" fill="#efe6d2" />
          <path
            d="M11 2 14.5 7.5 20 11 14.5 14.5 11 20 7.5 14.5 2 11 7.5 7.5Z"
            fill="#174536"
          />
          <path d="M11 6.4 15.6 11 11 15.6 6.4 11Z" fill="#b99559" />
          <circle cx="11" cy="11" r="1.3" fill="#f8f5f0" />
        </pattern>

        <filter
          id={id("cast")}
          x="-25%"
          y="-25%"
          width="150%"
          height="150%"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow
            dx="7"
            dy="14"
            stdDeviation="12"
            floodColor="#3a2f1f"
            floodOpacity="0.32"
          />
        </filter>

        <clipPath id={id("opening")}>
          <path d={PALACE_APERTURE} />
        </clipPath>
      </defs>

      {/* Stone wall, with courses and joints */}
      <rect width="420" height="440" fill={`url(#${id("stone")})`} />
      {[64, 116, 168, 220, 272, 324, 376].map((y) => (
        <path
          key={`course-${y}`}
          d={`M0 ${y}H420`}
          stroke="#b7a684"
          strokeWidth="1"
          opacity="0.22"
        />
      ))}
      {[54, 138, 226, 306, 386].map((x) => (
        <path
          key={`joint-${x}`}
          d={`M${x} 0V440`}
          stroke="#b7a684"
          strokeWidth="1"
          opacity="0.12"
        />
      ))}

      {/* Zellij frieze above the arch */}
      <rect x="24" y="14" width="372" height="24" fill={zellij} opacity="0.95" />
      <rect
        x="24"
        y="14"
        width="372"
        height="24"
        fill="none"
        stroke={gold}
        strokeWidth="1.4"
      />
      <rect x="24" y="11" width="372" height="2.4" fill={gold} opacity="0.7" />

      {/* Zellij panels on the wall piers */}
      {[16, 370].map((x) => (
        <g key={`panel-${x}`}>
          <rect x={x} y="150" width="34" height="152" fill={zellij} />
          <rect
            x={x}
            y="150"
            width="34"
            height="152"
            fill="none"
            stroke={gold}
            strokeWidth="1.3"
          />
        </g>
      ))}

      {/* Carved plaster frame — solid, thick, cast onto the wall */}
      <path
        d={PALACE_FRAME}
        fill={`url(#${id("plaster")})`}
        stroke={gold}
        strokeWidth="1.8"
        filter={`url(#${id("cast")})`}
      />
      <path
        d={PALACE_FRAME}
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.2"
        opacity="0.5"
        transform="translate(-1 -1)"
      />

      {/* Zellij band following the arch */}
      <path
        d={`${PALACE_ZELLIJ_OUTER} ${PALACE_ZELLIJ_INNER}`}
        fillRule="evenodd"
        fill={zellij}
      />
      <path
        d={PALACE_ZELLIJ_OUTER}
        fill="none"
        stroke={gold}
        strokeWidth="2"
      />
      <path
        d={PALACE_ZELLIJ_INNER}
        fill="none"
        stroke={gold}
        strokeWidth="2.6"
      />
      <path
        d={PALACE_ZELLIJ_INNER}
        fill="none"
        stroke="#0a2a22"
        strokeWidth="1"
        opacity="0.35"
        strokeDasharray="1.6 5.4"
      />

      {/* Carved medallions: keystone and springings */}
      <g transform="translate(210 57)">
        <rect x="-6" y="-6" width="12" height="12" fill={gold} />
        <rect x="-6" y="-6" width="12" height="12" fill={gold} transform="rotate(45)" />
        <circle r="2.6" fill="#174536" />
      </g>
      {[79, 341].map((cx) => (
        <g key={cx} transform={`translate(${cx} 292)`}>
          <rect x="-7" y="-7" width="14" height="14" fill={gold} />
          <rect x="-7" y="-7" width="14" height="14" fill={gold} transform="rotate(45)" />
          <circle r="3.2" fill="#174536" />
        </g>
      ))}

      {/* The opening: deep emerald interior with pottery, shadowed reveal */}
      <path d={PALACE_APERTURE} fill={`url(#${id("interior")})`} />
      <g clipPath={`url(#${id("opening")})`}>
        <rect
          x="88"
          y="96"
          width="244"
          height="308"
          fill={`url(#${id("glow")})`}
        />
        <PotteryArt
          shape={art}
          title="فخار مغربي داخل مدخل قصر"
          x="126"
          y="150"
          width="168"
          height="254"
          preserveAspectRatio="xMidYMax meet"
        />
        <path
          d={PALACE_APERTURE}
          fill="none"
          stroke="#03130f"
          strokeWidth="30"
          opacity="0.42"
        />
      </g>
      <path
        d={PALACE_APERTURE}
        fill="none"
        stroke={gold}
        strokeWidth="1.2"
        opacity="0.55"
      />

      {/* Stone threshold */}
      <rect x="58" y="404" width="304" height="36" fill={`url(#${id("step")})`} />
      <path d="M58 404H362" stroke="#f8f1de" strokeWidth="1.6" opacity="0.75" />
      <path d="M58 406.5H362" stroke="#06231b" strokeWidth="2.4" opacity="0.28" />
      <rect x="58" y="424" width="304" height="1.6" fill={gold} opacity="0.55" />
      <path d="M58 404V440M362 404V440" stroke="#9d8e6d" strokeWidth="1" opacity="0.5" />

      {/* Raking daylight across the whole facade */}
      <rect
        width="420"
        height="440"
        fill={`url(#${id("daylight")})`}
        style={{ mixBlendMode: "soft-light" }}
        opacity="0.9"
      />
    </svg>
  );
}
