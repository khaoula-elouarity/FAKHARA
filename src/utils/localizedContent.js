export function localizedContent(value, language, fallback = "") {
  if (typeof value === "string") {
    return value || fallback;
  }

  return (
    value?.[language] ||
    value?.ar ||
    value?.fr ||
    value?.en ||
    fallback
  );
}
