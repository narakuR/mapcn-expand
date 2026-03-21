import type maplibregl from "maplibre-gl";
import { useEffect, useState } from "react";
import type { RefObject } from "react";

import type { MapAgentRuntime } from "@/lib/map-agent/types";

export function useMapAgentRuntime(
  mapRef: RefObject<maplibregl.Map | null>,
): MapAgentRuntime | null {
  const [runtime, setRuntime] = useState<MapAgentRuntime | null>(null);

  useEffect(() => {
    let frameId = 0;
    let cancelled = false;
    let activeMap: maplibregl.Map | null = null;
    let detachLoadListener: (() => void) | null = null;

    const cleanupLoadListener = () => {
      if (detachLoadListener) {
        detachLoadListener();
        detachLoadListener = null;
      }
    };

    const setReadyRuntime = (map: maplibregl.Map) => {
      setRuntime((previous) => (previous?.map === map ? previous : { map }));
    };

    const syncFromRef = () => {
      if (cancelled) return;

      const nextMap = mapRef.current;
      if (nextMap) {
        if (activeMap !== nextMap) {
          cleanupLoadListener();
          activeMap = nextMap;
        }

        if (nextMap.loaded()) {
          setReadyRuntime(nextMap);
          return;
        }

        detachLoadListener = () => {
          nextMap.off("load", handleLoad);
        };

        const handleLoad = () => {
          if (cancelled) return;
          setReadyRuntime(nextMap);
        };

        nextMap.once("load", handleLoad);
        return;
      }

      cleanupLoadListener();
      activeMap = null;
      setRuntime(null);
      frameId = window.requestAnimationFrame(syncFromRef);
    };

    syncFromRef();

    return () => {
      cancelled = true;
      cleanupLoadListener();
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [mapRef]);

  return runtime;
}
