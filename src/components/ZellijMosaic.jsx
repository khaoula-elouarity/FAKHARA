import React, { useId } from "react";

/**
 * Realistic zellij mosaic field.
 *
 * Instead of a flat geometric pattern this renders each piece of the mosaic
 * separately: an eight-point khatam star, corner and edge darts and a small
 * inlay, all separated by grout, bevelled with a cast shadow, glazed with a
 * ceramic specular highlight and finished with fine clay grain.
 *
 * Geometry lives in a 64 x 64 tile and is scaled to the requested tile size so
 * the same motif can read as a fine border (14px) or a large wall panel (64px).
 */

const TILE = 64;

const KHATAM = (() => {
  const points = [];
  for (let i = 0; i < 16; i += 1) {
    const angle = (Math.PI / 8) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? 24.5 : 18.75;
    points.push(
      `${(32 + Math.cos(angle) * radius).toFixed(2)} ${(
        32 +
        Math.sin(angle) * radius
      ).toFixed(2)}`
    );
  }
  return `M${points.join("L")}Z`;
})();

const diamond = (cx, cy, r) =>
  `M${cx} ${cy - r}L${cx + r} ${cy}L${cx} ${cy + r}L${cx - r} ${cy}Z`;

const TONES = {
  ivory: {
    grout: "#d8cbb0",
    groutDark: "#9e8a66",
    star: ["#2f765d", "#1a5242", "#0f3a2d"],
    corner: ["#1f5c49", "#123c30", "#0a2a21"],
    edge: ["#e4c489", "#c39c58", "#8f6c35"],
    accent: ["#fbf4e4", "#e6d5b1", "#c6b089"],
    sheen: "#fff7e6",
  },
  emerald: {
    grout: "#0b2b23",
    groutDark: "#04140f",
    star: ["#e9d29f", "#c19a5b", "#8a6832"],
    corner: ["#2a7359", "#16463a", "#0a2a21"],
    edge: ["#f6ecd6", "#dbc9a5", "#b09d79"],
    accent: ["#31805f", "#174536", "#0c2f26"],
    sheen: "#ffeecb",
  },
  sand: {
    grout: "#e5dac4",
    groutDark: "#bfae8e",
    star: ["#e2cb9d", "#b99559", "#8b6b38"],
    corner: ["#f0e7d3", "#d9caac", "#bfad8b"],
    edge: ["#2a7057", "#174536", "#0c2f26"],
    accent: ["#c8684c", "#a94a34", "#7c3122"],
    sheen: "#fffaf0",
  },
};

export default function ZellijMosaic({
  tone = "ivory",
  tile = TILE,
  opacity = 1,
  detail = true,
  light = true,
  className = "",
}) {
  const uid = useId().replace(/:/g, "");
  const id = (name) => `${uid}-${name}`;
  const c = TONES[tone] || TONES.ivory;
  const scale = tile / TILE;

  const pieces = [
    { d: KHATAM, fill: `url(#${id("star")})` },
    { d: diamond(0, 0, 8.6), fill: `url(#${id("corner")})` },
    { d: diamond(TILE, 0, 8.6), fill: `url(#${id("corner")})` },
    { d: diamond(0, TILE, 8.6), fill: `url(#${id("corner")})` },
    { d: diamond(TILE, TILE, 8.6), fill: `url(#${id("corner")})` },
    { d: diamond(32, 0, 7.6), fill: `url(#${id("edge")})` },
    { d: diamond(32, TILE, 7.6), fill: `url(#${id("edge")})` },
    { d: diamond(0, 32, 7.6), fill: `url(#${id("edge")})` },
    { d: diamond(TILE, 32, 7.6), fill: `url(#${id("edge")})` },
    { d: diamond(32, 32, 7), fill: `url(#${id("accent")})` },
  ];

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ opacity }}
    >
      <defs>
        {["star", "corner", "edge", "accent"].map((name) => (
          <linearGradient
            key={name}
            id={id(name)}
            x1="0.16"
            y1="0"
            x2="0.84"
            y2="1"
          >
            <stop offset="0" stopColor={c[name][0]} />
            <stop offset="0.46" stopColor={c[name][1]} />
            <stop offset="1" stopColor={c[name][2]} />
          </linearGradient>
        ))}

        <radialGradient id={id("rake")} cx="16%" cy="4%" r="90%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="0.42" stopColor="#ffffff" stopOpacity="0.13" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={id("vignette")} cx="50%" cy="48%" r="78%">
          <stop offset="0.5" stopColor="#0b2b22" stopOpacity="0" />
          <stop offset="1" stopColor="#0b2b22" stopOpacity="0.34" />
        </radialGradient>

        <filter
          id={id("glaze")}
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.045 0.07"
            numOctaves="2"
            seed="11"
            result="noise"
          />
          <feSpecularLighting
            in="noise"
            surfaceScale="2.4"
            specularConstant="0.85"
            specularExponent="18"
            lightingColor={c.sheen}
            result="spec"
          >
            <feDistantLight azimuth="225" elevation="52" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" />
        </filter>

        <filter
          id={id("grain")}
          x="0"
          y="0"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.82"
            numOctaves="3"
            seed="4"
            result="grain"
          />
          <feColorMatrix
            in="grain"
            type="matrix"
            values="0 0 0 0 0.16 0 0 0 0 0.13 0 0 0 0 0.09 1 0 0 0 -0.3"
          />
        </filter>

        <pattern
          id={id("mosaic")}
          width={tile}
          height={tile}
          patternUnits="userSpaceOnUse"
        >
          <rect width={tile} height={tile} fill={c.grout} />

          <g transform={`scale(${scale})`}>
            {/* cast shadow into the grout */}
            <g fill={c.groutDark} opacity="0.6">
              {pieces.map((piece, index) => (
                <path
                  key={`shadow-${index}`}
                  d={piece.d}
                  transform="translate(0 1.15)"
                />
              ))}
            </g>

            {/* glazed tile faces */}
            {pieces.map((piece, index) => (
              <path
                key={`face-${index}`}
                d={piece.d}
                fill={piece.fill}
                stroke={c.grout}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            ))}

            {/* glazed edge highlight */}
            <g
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.16"
              strokeWidth="0.9"
              strokeLinejoin="round"
            >
              {pieces.map((piece, index) => (
                <path key={`glaze-${index}`} d={piece.d} />
              ))}
            </g>
          </g>
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill={`url(#${id("mosaic")})`} />

      {detail && (
        <rect
          width="100%"
          height="100%"
          fill="#ffffff"
          filter={`url(#${id("glaze")})`}
          style={{ mixBlendMode: "screen" }}
          opacity="0.42"
        />
      )}

      {detail && (
        <rect
          width="100%"
          height="100%"
          filter={`url(#${id("grain")})`}
          style={{ mixBlendMode: "multiply" }}
          opacity="0.32"
        />
      )}

      {light && (
        <>
          <rect
            width="100%"
            height="100%"
            fill={`url(#${id("rake")})`}
            style={{ mixBlendMode: "soft-light" }}
          />
          <rect
            width="100%"
            height="100%"
            fill={`url(#${id("vignette")})`}
            style={{ mixBlendMode: "multiply" }}
            opacity="0.7"
          />
        </>
      )}
    </svg>
  );
}
