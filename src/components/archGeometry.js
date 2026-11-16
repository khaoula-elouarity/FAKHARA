/**
 * Shared geometry for the FAKHARA Moroccan arch.
 *
 * The silhouette is a pointed horseshoe (Moorish) arch: the jambs rise to the
 * springing line, the curve then bulges outward past the jambs and sweeps up
 * to a sharp apex — the profile of traditional Moroccan riad and palace doors.
 *
 * All coordinates live in a 200 x 316 viewBox (300 = floor line, 300-316 =
 * zellij threshold). Every arch on the site uses these same paths so the shape
 * stays perfectly consistent.
 */

export const ARCH_VIEWBOX = "0 0 200 316";

/** Outer silhouette of the doorway. */
export const ARCH_OUTER =
  "M34 300 L34 206 C22 188 18 170 22 150 C26 96 50 42 100 8 C150 42 174 96 178 150 C182 170 178 188 166 206 L166 300 Z";

/** Inner edge of the emerald frame. */
export const ARCH_INNER =
  "M46 300 L46 210 C36 194 33 178 36 158 C40 110 60 60 100 28 C140 60 160 110 164 158 C167 178 164 194 154 210 L154 300 Z";

/** The visible opening where the pottery sits. */
export const ARCH_STAGE =
  "M53 300 L53 213 C44 198 41 182 44 163 C48 118 66 70 100 42 C134 70 152 118 156 163 C159 182 156 198 147 213 L147 300 Z";

/** Raking-light highlight running along the left shoulder of the frame. */
export const ARCH_SHEEN =
  "M36 248 L36 206 C23 188 19 170 23 150 C27 96 51 42 100 8 C119 23 134 39 146 58";

/** Midline of the frame — the carved, beaded band runs along this path. */
export const ARCH_MID =
  "M40 300 L40 208 C29 190 25 173 29 152 C33 102 55 50 100 18 C145 50 167 102 171 152 C175 173 171 190 160 208 L160 300";

/* ---------------------------------------------------------------------------
   Collection arches — 340 x 400: a substantial palace doorway.
   Four of them across the row, with a wide opening (216 of 340 = 63%) so the
   pottery inside is never squeezed.
   Layers, outermost first: stone lip, emerald frame, carved bead line,
   zellij band, plaster reveal, image stage, zellij threshold.
   --------------------------------------------------------------------------- */

export const WIDE_VIEWBOX = "0 0 340 400";

/** Stone lip that the whole doorway is built into. */
export const WIDE_STONE =
  "M16 372 L16 296 C9 278 6 256 10 236 C22 172 46 106 170 36 C294 106 318 172 330 236 C334 256 331 278 324 296 L324 372 Z";

/** Outer edge of the emerald frame (thick, 14 units to the zellij band). */
export const WIDE_OUTER =
  "M24 372 L24 298 C17 280 14 258 18 238 C30 176 52 112 170 44 C288 112 310 176 322 238 C326 258 323 280 316 298 L316 372 Z";

/** Carved bead line between the emerald face and the zellij band. */
export const WIDE_MID =
  "M30 372 L30 298 C23 280 20 259 24 239 C36 179 58 118 170 52 C282 118 304 179 316 239 C320 259 317 280 310 298 L310 372";

/** Outer edge of the zellij archivolt band. */
export const WIDE_ZELLIJ_OUTER =
  "M38 372 L38 300 C31 282 28 261 32 241 C44 184 64 126 170 62 C276 126 296 184 308 241 C312 261 309 282 302 300 L302 372";

/** Inner edge of the zellij band / outer edge of the plaster reveal. */
export const WIDE_REVEAL =
  "M52 372 L52 302 C45 285 42 264 46 244 C58 192 78 142 170 80 C262 142 282 192 294 244 C298 264 295 285 288 302 L288 372 Z";

/** The image stage inside the reveal — a full 216 units wide (63%). */
export const WIDE_STAGE =
  "M62 372 L62 304 C55 288 52 267 56 247 C68 198 86 152 170 92 C254 152 272 198 284 247 C288 267 285 288 278 304 L278 372 Z";
