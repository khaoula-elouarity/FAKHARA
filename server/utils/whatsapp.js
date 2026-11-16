export const DEFAULT_WHATSAPP_NUMBER = "212649613615";

/**
 * WhatsApp click-to-chat links require an international number containing
 * digits only. Accept the common ways an administrator may type the number
 * (+, spaces, dashes, parentheses, leading 00) while storing one stable form.
 */
export function normalizeWhatsAppNumber(value) {
  if (typeof value !== "string") {
    return "";
  }

  const digits = value
    .trim()
    .replace(/^00/, "")
    .replace(/\D/g, "");

  if (digits.length < 8 || digits.length > 15) {
    return "";
  }

  return digits;
}

export function serializeWhatsAppSettings(settings) {
  const whatsappNumber =
    normalizeWhatsAppNumber(settings?.whatsappNumber) ||
    DEFAULT_WHATSAPP_NUMBER;

  return {
    whatsappNumber,
    displayNumber: `+${whatsappNumber}`,
    whatsappLink: `https://wa.me/${whatsappNumber}`,
  };
}
