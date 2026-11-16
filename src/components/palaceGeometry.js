/**
 * Geometry for the grand palace doorway (wide horseshoe arch).
 *
 * Drawn in a 420 x 440 space: a 212-wide opening set into 104-thick wall
 * piers, with a 34-40 unit carved plaster frame, a zellij archivolt band and
 * a stone threshold.
 */

/** The door opening itself. */
export const PALACE_APERTURE =
  "M104 404 L104 288 C90 268 82 240 88 208 C95 150 134 114 210 100 C286 114 325 150 332 208 C338 240 330 268 316 288 L316 404 Z";

/** Outer edge of the carved plaster (gebs) frame. */
export const PALACE_FRAME =
  "M66 404 L66 300 C48 274 40 242 47 206 C55 140 108 92 210 52 C312 92 365 140 373 206 C380 242 372 274 354 300 L354 404 Z";

/** Outer edge of the zellij band that follows the arch. */
export const PALACE_ZELLIJ_OUTER =
  "M76 404 L76 294 C59 268 51 240 58 207 C66 144 116 96 210 62 C304 96 354 144 362 207 C369 240 361 268 344 294 L344 404 Z";

/** Inner edge of the zellij band, where the gold archivolt sits. */
export const PALACE_ZELLIJ_INNER =
  "M92 404 L92 284 C79 265 72 240 78 210 C85 154 122 120 210 88 C298 120 335 154 342 210 C348 240 341 265 328 284 L328 404 Z";
