export function toVariantKey(image, index = 0) {
  const base = String(image || "")
    .split("/")
    .pop()
    .split("?")[0]
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || `variant-${index + 1}`;
}

export function toCategorySlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
