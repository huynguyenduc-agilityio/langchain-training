export interface GeocodeFeature {
  geometry: {
    coordinates: [number, number];
  };
  properties?: {
    confidence?: number;
  };
}

export interface GeocodeResponse {
  features?: GeocodeFeature[];
}

export interface ORSDirectionsResponse {
  features?: {
    properties?: {
      summary?: {
        distance: number;
        duration: number;
      };
    };
  }[];
}
