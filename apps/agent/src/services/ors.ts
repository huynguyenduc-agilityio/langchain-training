/**
 * OpenRouteService (ORS) Service
 * Handles external API integration with OpenRouteService for geocoding and routing.
 */

import { API_ENDPOINTS } from '../constants';

/**
 * Converts a location name/landmark into [longitude, latitude] coordinates.
 */
export async function getCoords(location: string, apiKey: string): Promise<[number, number] | null> {
  try {
    // Append Da Nang, Vietnam to improve query accuracy
    const query = location.toLowerCase().includes('da nang') 
      ? location 
      : `${location}, Da Nang, Vietnam`;

    const url = `${API_ENDPOINTS.ORS_GEOCODE_URL}?api_key=${apiKey}&text=${encodeURIComponent(query)}&size=1`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Geocoding failed for ${location}: ${response.statusText}`);
      return null;
    }
    const data = (await response.json()) as any;
    if (data.features && data.features.length > 0) {
      return data.features[0].geometry.coordinates as [number, number]; // [lon, lat]
    }
  } catch (error) {
    console.error(`Error in geocoding ${location}:`, error);
  }
  return null;
}
