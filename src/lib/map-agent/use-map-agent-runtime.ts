import type MapboxDraw from "@mapbox/mapbox-gl-draw";
import type maplibregl from "maplibre-gl";
import { useMemo } from "react";

import type { MapAgentRuntime } from "@/lib/map-agent/types";

export function useMapAgentRuntime(
  map: maplibregl.Map | null,
  draw?: MapboxDraw | null,
): MapAgentRuntime | null {
  return useMemo(() => {
    if (!map) return null;

    return {
      map,
      draw,
    };
  }, [map, draw]);
}
