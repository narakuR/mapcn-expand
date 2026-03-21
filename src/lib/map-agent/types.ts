import type MapboxDraw from "@mapbox/mapbox-gl-draw";
import type maplibregl from "maplibre-gl";

export type LngLat = [number, number];

export type MapCommand =
  | {
    type: "draw_point";
    coordinates: LngLat;
    properties?: GeoJSON.GeoJsonProperties;
    id?: string;
  }
  | {
    type: "draw_line";
    coordinates: LngLat[];
    properties?: GeoJSON.GeoJsonProperties;
    id?: string;
  }
  | {
    type: "draw_polygon";
    coordinates: LngLat[][];
    properties?: GeoJSON.GeoJsonProperties;
    id?: string;
  }
  | {
    type: "draw_circle";
    center: LngLat;
    radiusMeters: number;
    steps?: number;
    properties?: GeoJSON.GeoJsonProperties;
    id?: string;
  }
  | {
    type: "fit_bounds";
    bounds: [LngLat, LngLat];
    padding?: number;
    maxZoom?: number;
    duration?: number;
  }
  | {
    type: "fly_to";
    center: LngLat;
    zoom?: number;
    bearing?: number;
    pitch?: number;
    duration?: number;
  }
  | {
    type: "clear";
  };

export type MapCommandExecutionResult =
  | {
    type: "feature";
    commandType: Extract<
      MapCommand["type"],
      "draw_point" | "draw_line" | "draw_polygon" | "draw_circle"
    >;
    feature: GeoJSON.Feature;
  }
  | {
    type: "viewport";
    commandType: Extract<MapCommand["type"], "fit_bounds" | "fly_to">;
  }
  | {
    type: "clear";
    commandType: "clear";
    deletedCount: number;
  };

export type MapAgentRuntime = {
  map: maplibregl.Map;
  draw?: MapboxDraw | null;
};
