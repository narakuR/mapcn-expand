"use client";

import { Map, MapMarker, MarkerContent, MarkerTooltip } from "@/registry/map";
import { Zap } from "lucide-react";
import { ExampleCard } from "./example-card";

export function EVChargingExample() {
  return (
    <ExampleCard
      label="EV Charging"
      className="aspect-square"
      delay="delay-700"
    >
      <Map center={[-122.425, 37.777]} zoom={11.5}>
        <MapMarker longitude={-122.4194} latitude={37.7749}>
          <MarkerContent>
            <div className="bg-emerald-500 rounded-full p-1.5 shadow-lg shadow-emerald-500/30">
              <Zap className="size-3 text-white fill-white" />
            </div>
          </MarkerContent>
          <MarkerTooltip>
            <div className="text-xs space-y-0.5">
              <div className="font-medium">Market St Station</div>
              <div className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-500">Available</span>
              </div>
              <div className="text-muted-foreground">150 kW • $0.35/kWh</div>
            </div>
          </MarkerTooltip>
        </MapMarker>

        <MapMarker longitude={-122.4094} latitude={37.7849}>
          <MarkerContent>
            <div className="bg-emerald-500 rounded-full p-1.5 shadow-lg shadow-emerald-500/30">
              <Zap className="size-3 text-white fill-white" />
            </div>
          </MarkerContent>
          <MarkerTooltip>
            <div className="text-xs space-y-0.5">
              <div className="font-medium">Union Square</div>
              <div className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-500">2 Available</span>
              </div>
              <div className="text-muted-foreground">50 kW • $0.28/kWh</div>
            </div>
          </MarkerTooltip>
        </MapMarker>

        <MapMarker longitude={-122.4294} latitude={37.7689}>
          <MarkerContent>
            <div className="bg-amber-500 rounded-full p-1.5 shadow-lg shadow-amber-500/30">
              <Zap className="size-3 text-white fill-white" />
            </div>
          </MarkerContent>
          <MarkerTooltip>
            <div className="text-xs space-y-0.5">
              <div className="font-medium">Castro Station</div>
              <div className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-amber-500" />
                <span className="text-amber-500">In Use</span>
              </div>
              <div className="text-muted-foreground">~15 min remaining</div>
            </div>
          </MarkerTooltip>
        </MapMarker>

        <MapMarker longitude={-122.4394} latitude={37.7809}>
          <MarkerContent>
            <div className="bg-zinc-400 rounded-full p-1.5 shadow-lg">
              <Zap className="size-3 text-white fill-white" />
            </div>
          </MarkerContent>
          <MarkerTooltip>
            <div className="text-xs space-y-0.5">
              <div className="font-medium">Hayes Valley</div>
              <div className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-zinc-400" />
                <span className="text-muted-foreground">Offline</span>
              </div>
            </div>
          </MarkerTooltip>
        </MapMarker>
      </Map>
    </ExampleCard>
  );
}
