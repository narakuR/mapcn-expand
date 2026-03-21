"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";
import {
  Map as MapComponent,
  MapMarker,
  MarkerContent,
  MarkerPopup,
} from "@/registry/map";

export function DraggableMarkerExample() {
  const [draggableMarker, setDraggableMarker] = useState({
    lng: -73.98,
    lat: 40.75,
  });

  return (
    <div className="h-[400px] w-full">
      <MapComponent center={[-73.98, 40.75]} zoom={12}>
        <MapMarker
          draggable
          longitude={draggableMarker.lng}
          latitude={draggableMarker.lat}
          onDragEnd={(lngLat) => {
            setDraggableMarker({ lng: lngLat.lng, lat: lngLat.lat });
          }}
        >
          <MarkerContent>
            <div className="cursor-move">
              <MapPin
                className="fill-black stroke-white dark:fill-white"
                size={28}
              />
            </div>
          </MarkerContent>
          <MarkerPopup>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Coordinates</p>
              <p className="text-xs text-muted-foreground">
                {draggableMarker.lat.toFixed(4)},{" "}
                {draggableMarker.lng.toFixed(4)}
              </p>
            </div>
          </MarkerPopup>
        </MapMarker>
      </MapComponent>
    </div>
  );
}
