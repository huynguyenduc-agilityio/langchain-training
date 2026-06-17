import { API_ENDPOINTS, ACTIVE_CITY } from '@/constants';
import { isCoordsInServiceArea } from '@/utils';
import { GeocodeFeature, GeocodeResponse } from '@/types';

/**
 * Geocode using ORS Pelias API (primary provider).
 * Good for street addresses with house numbers (e.g., "100 Nguyen Van Linh").
 * Uses boundary.rect and boundary.country to constrain results to the service area.
 */
async function getCoordsFromORS(
  query: string,
  apiKey: string,
): Promise<[number, number] | null> {
  const { minLat, maxLat, minLng, maxLng } = ACTIVE_CITY.bounds;

  const params = new URLSearchParams({
    api_key: apiKey,
    text: query,
    size: '5',
    'boundary.country': 'VN',
    'focus.point.lat': String(ACTIVE_CITY.defaultCoords.latitude),
    'focus.point.lon': String(ACTIVE_CITY.defaultCoords.longitude),
    'boundary.rect.min_lat': String(minLat),
    'boundary.rect.max_lat': String(maxLat),
    'boundary.rect.min_lon': String(minLng),
    'boundary.rect.max_lon': String(maxLng),
  });

  const url = `${API_ENDPOINTS.ORS_GEOCODE_URL}?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    console.error(
      `[ORS] Geocoding failed for "${query}": ${response.statusText}`,
    );
    return null;
  }

  const data = (await response.json()) as GeocodeResponse;
  const validFeatures = (data.features || []).filter((f) => {
    const [lng, lat] = f.geometry.coordinates;
    return isCoordsInServiceArea(lat, lng);
  });

  if (validFeatures.length === 0) return null;

  return pickBestResult(validFeatures);
}

/**
 * Geocode using Photon (Komoot) API (fallback provider).
 * Excellent for English landmark names (e.g., "Da Nang Bus Station", "Han Market").
 * Free, no API key required, no rate limit.
 * Uses focus.point to bias results toward the active city center.
 */
async function getCoordsFromPhoton(
  query: string,
): Promise<[number, number] | null> {
  const params = new URLSearchParams({
    q: query,
    limit: '5',
    lang: 'en',
    lat: String(ACTIVE_CITY.defaultCoords.latitude),
    lon: String(ACTIVE_CITY.defaultCoords.longitude),
  });

  const url = `${API_ENDPOINTS.PHOTON_GEOCODE_URL}?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    console.error(
      `[Photon] Geocoding failed for "${query}": ${response.statusText}`,
    );
    return null;
  }

  const data = (await response.json()) as GeocodeResponse;
  const validFeatures = (data.features || []).filter((f) => {
    const [lng, lat] = f.geometry.coordinates;
    return isCoordsInServiceArea(lat, lng);
  });

  if (validFeatures.length === 0) return null;

  // Photon doesn't have confidence scores, so just return the top valid result
  return validFeatures[0].geometry.coordinates;
}

/**
 * Picks the best result from a list of geocode features based on confidence scores.
 * Returns null if results are ambiguous (multiple results with similar confidence).
 */
function pickBestResult(features: GeocodeFeature[]): [number, number] | null {
  if (features.length === 1) {
    return features[0].geometry.coordinates;
  }

  const topConfidence = features[0].properties?.confidence || 0;
  const secondConfidence = features[1].properties?.confidence || 0;

  // If the top result is clearly the best match (confidence gap > 0.2 or top >= 0.8)
  if (topConfidence >= 0.8 || topConfidence - secondConfidence > 0.2) {
    return features[0].geometry.coordinates;
  }

  return null; // Ambiguous
}

/**
 * Converts a location name/landmark into [longitude, latitude] coordinates.
 * Uses a dual-provider strategy:
 *   1. ORS Pelias (primary) — good for Vietnamese addresses and house numbers
 *   2. Photon/Komoot (fallback) — good for English landmark names
 *
 * Returns null if no results found or if the location is ambiguous,
 * signaling the agent to ask the user to clarify.
 */
export async function getCoords(
  location: string,
  apiKey: string,
): Promise<[number, number] | null> {
  // Append city name to improve query accuracy
  const cityLower = ACTIVE_CITY.englishName.toLowerCase();
  const query = location.toLowerCase().includes(cityLower)
    ? location
    : `${location}, ${ACTIVE_CITY.englishName}, Vietnam`;

  try {
    // 1. Try ORS (primary provider)
    const orsResult = await getCoordsFromORS(query, apiKey);
    if (orsResult) {
      console.info(
        `[Geocode] "${location}" resolved via ORS → [${orsResult[1]}, ${orsResult[0]}]`,
      );
      return orsResult;
    }

    // 2. Fallback to Photon if ORS returned no valid results
    console.info(
      `[Geocode] ORS returned no results for "${location}", trying Photon fallback...`,
    );
    const photonResult = await getCoordsFromPhoton(query);
    if (photonResult) {
      console.info(
        `[Geocode] "${location}" resolved via Photon → [${photonResult[1]}, ${photonResult[0]}]`,
      );
      return photonResult;
    }

    console.warn(`[Geocode] No results from any provider for "${location}"`);
  } catch (error) {
    console.error(`[Geocode] Error geocoding "${location}":`, error);
  }
  return null;
}
