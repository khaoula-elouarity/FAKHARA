const COMBINING_MARKS = /[\u0300-\u036f]/g;
const ARABIC_DIACRITICS =
  /[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed]/g;
const TATWEEL = /\u0640/g;
const INVISIBLE_MARKS =
  /[\u200b-\u200f\u202a-\u202e\u2060-\u2069\ufeff]/g;

const SEARCH_VARIANTS = new Map([
  ["ا", "اأإآٱ"],
  ["ي", "يىئ"],
  ["و", "وؤ"],
  ["ه", "هة"],
  ["ك", "كک"],
  ["a", "aàáâäãåāăą"],
  ["c", "cçćč"],
  ["d", "dďđð"],
  ["e", "eèéêëēėęě"],
  ["g", "gğģ"],
  ["i", "iìíîïīįı"],
  ["l", "lłľ"],
  ["n", "nñńň"],
  ["o", "oòóôöõōø"],
  ["r", "rř"],
  ["s", "sśšş"],
  ["t", "tťţ"],
  ["u", "uùúûüūų"],
  ["y", "yýÿŷ"],
  ["z", "zźżž"],
]);

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(ARABIC_DIACRITICS, "")
    .replace(TATWEEL, "")
    .replace(INVISIBLE_MARKS, "")
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/ß/g, "ss")
    .replace(/ø/g, "o")
    .replace(/ł/g, "l")
    .replace(/þ/g, "th")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ک/g, "ك")
    .replace(/ی/g, "ي")
    .replace(/[٠-٩]/g, (digit) =>
      String(digit.charCodeAt(0) - 0x0660)
    )
    .replace(/[۰-۹]/g, (digit) =>
      String(digit.charCodeAt(0) - 0x06f0)
    )
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function searchTokens(value) {
  const normalized = normalizeSearchText(value);

  return normalized ? normalized.split(" ") : [];
}

export function buildSearchTokenPattern(value) {
  const normalized = normalizeSearchText(value);

  return Array.from(normalized)
    .map((character) => {
      const variants = SEARCH_VARIANTS.get(character);

      if (!variants) {
        return escapeRegex(character);
      }

      return `[${Array.from(new Set(variants))
        .map(escapeRegex)
        .join("")}]`;
    })
    .join("");
}
