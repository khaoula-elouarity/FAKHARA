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

export function buildProductInquiryMessage(
  productName,
  productUrl,
  price,
  currency = "DH"
) {
  const name = String(productName || "").trim() || "منتج فخاري";
  const lines = [
    "السلام عليكم، أرغب في طلب هذا المنتج من متجر فخارة:",
    name,
  ];

  if (price !== undefined && price !== null && price !== "") {
    lines.push(`الثمن: ${price} ${currency}`);
  }

  lines.push(productUrl);

  return lines.filter(Boolean).join("\n");
}

export function buildProductWhatsAppLink(
  value,
  productName,
  productUrl,
  price,
  currency
) {
  return buildWhatsAppLink(
    value,
    buildProductInquiryMessage(productName, productUrl, price, currency)
  );
}
