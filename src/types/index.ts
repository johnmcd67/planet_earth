export interface Bookmark {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  height: number;
  heading?: number;
  pitch?: number;
  roll?: number;
  createdAt: number;
}

export interface MeasurementPoint {
  latitude: number;
  longitude: number;
  height: number;
}

export interface MeasurementResult {
  points: [MeasurementPoint, MeasurementPoint];
  distanceMeters: number;
  distanceKm: number;
  distanceMiles: number;
}
