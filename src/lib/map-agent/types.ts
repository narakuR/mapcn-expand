import type maplibregl from "maplibre-gl";

export type LngLat = [number, number];

export type MapCommand = {
  type: "fly_to";
  center: LngLat;
  zoom?: number;
  bearing?: number;
  pitch?: number;
  duration?: number;
};

export type MapCommandExecutionResult = {
  type: "viewport";
  commandType: "fly_to";
};

export type MapAgentRuntime = {
  map: maplibregl.Map;
};
