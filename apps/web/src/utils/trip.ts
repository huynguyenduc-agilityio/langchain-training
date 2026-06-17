export function generateTripId(): string {
  return `TRP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
    1000 + Math.random() * 9000,
  )}`;
}
