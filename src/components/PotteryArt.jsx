import React, { useId } from "react";

/**
 * Empty image placeholder.
 *
 * All photographic images have been removed from the site. This keeps every
 * image slot, card, frame, border, dimension and layout exactly as it is,
 * while leaving the image area empty and ready for your own photographs.
 */



export function PotteryArt({
  shape = "tagine",
  title,
  className = "",
  ...rest
}) {
  const uid = useId().replace(/:/g, "");
  const id = (name) => `${uid}-${name}`;

  const palette = {
    clay: `url(#${id("clay")})`,
    claySoft: `url(#${id("claySoft")})`,
    emerald: `url(#${id("emerald")})`,
    gold: `url(#${id("gold")})`,
    ivory: `url(#${id("ivory")})`,
    deep: "#0e2f25",
  };

  return (
    <svg
      viewBox="0 0 200 300"
      className={className}
      role="img"
      aria-label={title || "فخار مغربي تقليدي"}
      {...rest}
    >
      <defs>
        <linearGradient id={id("clay")} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#e2a37a" />
          <stop offset="0.45" stopColor="#bf7449" />
          <stop offset="1" stopColor="#8b4726" />
        </linearGradient>
        <linearGradient id={id("claySoft")} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#ecb48e" />
          <stop offset="0.4" stopColor="#cd8558" />
          <stop offset="0.8" stopColor="#a45a32" />
          <stop offset="1" stopColor="#8a4623" />
        </linearGradient>
        <linearGradient id={id("emerald")} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#2a6b55" />
          <stop offset="0.5" stopColor="#174536" />
          <stop offset="1" stopColor="#0b2b22" />
        </linearGradient>
        <linearGradient id={id("gold")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eed9a8" />
          <stop offset="0.45" stopColor="#c9a768" />
          <stop offset="1" stopColor="#a07f45" />
        </linearGradient>
        <linearGradient id={id("ivory")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdfaf3" />
          <stop offset="1" stopColor="#e9dfcb" />
        </linearGradient>
      </defs>

      {render(palette)}
    </svg>
  );
}

export default PotteryArt;
