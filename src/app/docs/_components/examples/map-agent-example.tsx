"use client";

import { MapAgent, Map as MapComponent, MapControls } from "@/registry/map";

export function MapAgentExample() {
  return (
    <div className="h-[500px] w-full overflow-hidden rounded-xl border">
      <MapComponent>
        <MapAgent
          provider="openai"
          endpoint="http://localhost:3000/api/map-agent"
          model="deepseek-chat"
          baseUrl="https://api.deepseek.com"
          token="sk-2be78add8479403284eab622d1ae4d5c"
          // defaultPrompt="Fly to downtown Shanghai with a city-level zoom."
          placeholder="Try: Fly to New York with a scenic city view"
        />
      </MapComponent>
    </div>
  );
}
