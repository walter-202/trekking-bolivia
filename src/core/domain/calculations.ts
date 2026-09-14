import { Coordinates, RouteDifficulty } from './types';

/**
 * Calculates Great-Circle distance using Haversine formula in kilometers.
 * Pure mathematical function, 0 dependencies, 100% Expo compatible.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Calculates accumulated distance over a list of coordinates.
 */
export function calculateTrackDistanceKm(points: Coordinates[]): number {
  if (points.length < 2) return 0;
  let totalKm = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalKm += calculateHaversineDistanceKm(
      points[i].lat,
      points[i].lng,
      points[i + 1].lat,
      points[i + 1].lng
    );
  }
  return Math.round(totalKm * 100) / 100;
}

/**
 * Calculates accumulated elevation gain in meters from waypoints altitude.
 */
export function calculateElevationGainM(waypoints: Coordinates[]): number {
  if (!waypoints || waypoints.length < 2) return 0;
  let gain = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const alt1 = waypoints[i].altitude ?? 0;
    const alt2 = waypoints[i + 1].altitude ?? 0;
    if (alt2 > alt1) {
      gain += (alt2 - alt1);
    }
  }
  return Math.round(gain);
}

/**
 * Calculates remaining distance from current position to end point along route waypoints.
 */
export function calculateRemainingDistanceKm(
  currentPos: Coordinates,
  waypoints: Coordinates[]
): number {
  if (waypoints.length === 0) return 0;
  const endPoint = waypoints[waypoints.length - 1];
  // Direct distance to end point if no further path, or distance from closest subsequent waypoint
  return calculateHaversineDistanceKm(
    currentPos.lat,
    currentPos.lng,
    endPoint.lat,
    endPoint.lng
  );
}

/**
 * Rules-based difficulty suggestion (RF-32).
 * Andean trekking guidelines for Bolivian terrain:
 * - Fácil: < 8 km and < 180 min
 * - Moderado: 8 - 18 km or 180 - 360 min
 * - Difícil: 18 - 35 km or 360 - 600 min
 * - Experto: > 35 km or high altitude / multi-day
 */
export function suggestRouteDifficulty(
  distanceKm: number,
  durationMinutes: number
): RouteDifficulty {
  if (distanceKm < 8 && durationMinutes < 180) {
    return 'facil';
  }
  if (distanceKm <= 18 && durationMinutes <= 360) {
    return 'moderado';
  }
  if (distanceKm <= 35 && durationMinutes <= 600) {
    return 'dificil';
  }
  return 'experto';
}

/**
 * Calculates estimated offline package size in MB (RF-10, RF-24).
 * Combines map tiles estimate, vector coordinates, and attached photos.
 */
export function calculateOfflineSizeMB(
  waypointsCount: number,
  checkpointsCount: number,
  photosCount: number = 0
): number {
  // Base map tile bounding box estimate: ~8.5 MB per segment
  const baseMapMb = 8.5;
  const geojsonMb = (waypointsCount * 0.0001) + (checkpointsCount * 0.0005);
  const photosMb = photosCount * 1.8;
  const total = baseMapMb + geojsonMb + photosMb;
  return Math.round(total * 10) / 10;
}

/**
 * Format duration in minutes into human-readable string.
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMin = minutes % 60;
  return remainingMin > 0 ? `${hours}h ${remainingMin}m` : `${hours}h`;
}
