"use client";

import { MapAgent, Map as MapComponent } from "@/registry/map";

export function MapAgentExample() {
  return (
    <div className="h-[500px] w-full overflow-hidden rounded-xl border">
      <MapComponent>
        <MapAgent
          endpoint="/api/map-agent"
          provider="openai"
          placeholder="Try: Fly to New York with a scenic city view"
          defaultPrompt="Fly to New York with a scenic city view"
        />
      </MapComponent>
    </div>
  );
}
