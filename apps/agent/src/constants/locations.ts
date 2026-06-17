export const ACTIVE_CITY = {
  name: 'Đà Nẵng',
  englishName: 'Da Nang',
  timezoneOffset: 7,
  bounds: {
    minLat: 15.9,
    maxLat: 16.3,
    minLng: 107.8,
    maxLng: 108.6,
  },
  defaultCoords: { latitude: 16.0544, longitude: 108.2022 },
  mockDestination: { latitude: 16.0782, longitude: 108.2123 },
};

export const COORDINATES = {
  DEFAULT_CITY: ACTIVE_CITY.defaultCoords,
  MOCK_DESTINATION: ACTIVE_CITY.mockDestination,
};
