import { circle as turfCircle } from "@turf/turf";

import type { LngLat } from "@/lib/map-agent/types";

type FeatureGeometry =
  | GeoJSON.Point
  | GeoJSON.LineString
  | GeoJSON.Polygon;

function closeLinearRing(coordinates: LngLat[]) {
  if (coordinates.length === 0) return coordinates;

  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) {
    return coordinates;
  }

  return [...coordinates, first];
}

export function createPointFeature(
  coordinates: LngLat,
  properties: GeoJSON.GeoJsonProperties = {},
  id?: string,
): GeoJSON.Feature<GeoJSON.Point> {
  return {
    type: "Feature",
    id,
    properties,
    geometry: {
      type: "Point",
      coordinates,
    },
  };
}

export function createLineFeature(
  coordinates: LngLat[],
  properties: GeoJSON.GeoJsonProperties = {},
  id?: string,
): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: "Feature",
    id,
    properties,
    geometry: {
      type: "LineString",
      coordinates,
    },
  };
}

export function createPolygonFeature(
  coordinates: LngLat[][],
  properties: GeoJSON.GeoJsonProperties = {},
  id?: string,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const [outerRing, ...holes] = coordinates;

  return {
    type: "Feature",
    id,
    properties,
    geometry: {
      type: "Polygon",
      coordinates: [closeLinearRing(outerRing), ...holes.map(closeLinearRing)],
    },
  };
}

export function createCircleFeature(
  center: LngLat,
  radiusMeters: number,
  steps = 64,
  properties: GeoJSON.GeoJsonProperties = {},
  id?: string,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const feature = turfCircle(center, radiusMeters / 1000, {
    steps,
    units: "kilometers",
    properties,
  });

  if (id) {
    feature.id = id;
  }

  return feature;
}

export function isFeatureGeometry(
  geometry: GeoJSON.Geometry,
): geometry is FeatureGeometry {
  return (
    geometry.type === "Point" ||
    geometry.type === "LineString" ||
    geometry.type === "Polygon"
  );
}
