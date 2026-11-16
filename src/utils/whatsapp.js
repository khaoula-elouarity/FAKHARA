export const DEFAULT_WHATSAPP_NUMBER = "212649613615";

export function normalizeWhatsAppNumber(value = "") {
  const digits = String(value)
    .trim()
    .replace(/^00/, "")
    .replace(/\D/g, "");

  return digits;
}

export function formatWhatsAppNumber(value = "") {
  const digits = normalizeWhatsAppNumber(value);

  return digits ? `+${digits}` : "";
}

export function isValidWhatsAppNumber(value = "") {
  const digits = normalizeWhatsAppNumber(value);

  return digits.length >= 8 && digits.length <= 15;
}

export function buildWhatsAppLink(
  value = DEFAULT_WHATSAPP_NUMBER,
  message = ""
) {
  const digits =
    normalizeWhatsAppNumber(value) || DEFAULT_WHATSAPP_NUMBER;
  const baseUrl = `https://wa.me/${digits}`;

  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
}

export function buildProductInquiryMessage(productName, productUrl) {
  const name = String(productName || "").trim() || "منتج فخاري";

  return [
    "السلام عليكم، أرغب في الاستفسار عن هذا المنتج من متجر فخارة:",
    name,
    productUrl,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildProductWhatsAppLink(
  value,
  productName,
  productUrl
) {
  return buildWhatsAppLink(
    value,
    buildProductInquiryMessage(productName, productUrl)
  );
}
