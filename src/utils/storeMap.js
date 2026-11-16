function getCoordinates(location) {
  const rawLatitude = location?.latitude;
  const rawLongitude = location?.longitude;

  if (
    rawLatitude === null ||
    rawLatitude === undefined ||
    String(rawLatitude).trim() === "" ||
    rawLongitude === null ||
    rawLongitude === undefined ||
    String(rawLongitude).trim() === ""
  ) {
    return null;
  }

  const latitude = Number(rawLatitude);
  const longitude = Number(rawLongitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return null;
  }

  return { latitude, longitude };
}

function getMapLanguage(language) {
  return ["ar", "fr", "en"].includes(language) ? language : "en";
}

function getDestination(location) {
  const coordinates = getCoordinates(location);

  if (coordinates) {
    return `${coordinates.latitude},${coordinates.longitude}`;
  }

  const address = location?.address?.trim();

  return address || "";
}

export function hasStoreLocation(location) {
  return Boolean(getDestination(location));
}

export function getStoreMapEmbedUrl(location, language = "en", zoom = 16) {
  const destination = getDestination(location);

  if (!destination) {
    return "";
  }

  const languageCode = getMapLanguage(language);
  const numericZoom = Number(zoom);
  const safeZoom = Number.isFinite(numericZoom)
    ? Math.min(20, Math.max(4, Math.round(numericZoom)))
    : 16;

  return `https://www.google.com/maps?q=${encodeURIComponent(
    destination
  )}&z=${safeZoom}&hl=${languageCode}&output=embed`;
}

export function getStoreDirectionsUrl(location, language = "en") {
  const destination = getDestination(location);

  if (!destination) {
    return "";
  }

  const languageCode = getMapLanguage(language);

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    destination
  )}&hl=${languageCode}`;
}
