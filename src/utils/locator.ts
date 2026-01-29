// Maidenhead Locator utilities

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Convert Maidenhead locator to latitude/longitude
 * Supports 4 or 6 character locators (e.g., JN77 or JN77TO)
 */
export function locatorToLatLng(locator: string): LatLng | null {
  if (!locator || locator.length < 4) return null;

  const loc = locator.toUpperCase();

  // Field (first 2 chars: A-R)
  const fieldLng = loc.charCodeAt(0) - 65; // A=0, R=17
  const fieldLat = loc.charCodeAt(1) - 65;

  if (fieldLng < 0 || fieldLng > 17 || fieldLat < 0 || fieldLat > 17) return null;

  // Square (next 2 chars: 0-9)
  const squareLng = parseInt(loc[2], 10);
  const squareLat = parseInt(loc[3], 10);

  if (isNaN(squareLng) || isNaN(squareLat)) return null;

  // Calculate base coordinates
  let lng = (fieldLng * 20) - 180 + (squareLng * 2);
  let lat = (fieldLat * 10) - 90 + squareLat;

  // Subsquare (optional, chars 5-6: A-X)
  if (loc.length >= 6) {
    const subLng = loc.charCodeAt(4) - 65; // A=0, X=23
    const subLat = loc.charCodeAt(5) - 65;

    if (subLng >= 0 && subLng <= 23 && subLat >= 0 && subLat <= 23) {
      lng += (subLng * 2 / 24) + (1 / 24);
      lat += (subLat / 24) + (1 / 48);
    } else {
      // Center of square
      lng += 1;
      lat += 0.5;
    }
  } else {
    // Center of square
    lng += 1;
    lat += 0.5;
  }

  return { lat, lng };
}

/**
 * Calculate if it's currently day, night, or twilight at a given location
 * Uses simplified solar position calculation
 */
export function getSolarPosition(lat: number, lng: number, date: Date = new Date()): {
  isDay: boolean;
  isNight: boolean;
  isTwilight: boolean;
  solarElevation: number;
  localSolarTime: number;
} {
  // Calculate day of year
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Solar declination (simplified)
  const declination = -23.45 * Math.cos((360 / 365) * (dayOfYear + 10) * Math.PI / 180);

  // Current UTC time as decimal hours
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;

  // Local solar time (approximate - longitude correction)
  const localSolarTime = (utcHours + lng / 15 + 24) % 24;

  // Hour angle
  const hourAngle = (localSolarTime - 12) * 15;

  // Solar elevation angle
  const latRad = lat * Math.PI / 180;
  const decRad = declination * Math.PI / 180;
  const haRad = hourAngle * Math.PI / 180;

  const solarElevation = Math.asin(
    Math.sin(latRad) * Math.sin(decRad) +
    Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad)
  ) * 180 / Math.PI;

  // Determine day/night/twilight
  // Civil twilight: sun between 0° and -6°
  // Nautical twilight: sun between -6° and -12°
  const isDay = solarElevation > 0;
  const isTwilight = solarElevation >= -12 && solarElevation <= 6;
  const isNight = solarElevation < -6;

  return {
    isDay,
    isNight,
    isTwilight,
    solarElevation,
    localSolarTime,
  };
}

/**
 * Get greyline status - returns true if location is near sunrise/sunset
 */
export function isGreyline(lat: number, lng: number, date: Date = new Date()): boolean {
  const { solarElevation } = getSolarPosition(lat, lng, date);
  // Greyline typically within ~6° of horizon
  return Math.abs(solarElevation) <= 6;
}

/**
 * Format locator for display with validation
 */
export function formatLocator(locator: string): string {
  if (!locator) return '';
  const loc = locator.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (loc.length < 4) return loc;
  if (loc.length === 4) return loc;
  if (loc.length >= 6) return loc.substring(0, 6);
  return loc;
}
