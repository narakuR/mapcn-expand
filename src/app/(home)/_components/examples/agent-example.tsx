"use client";

import { Map as MapComponent, MapAgent } from "@/registry/map";
import { ExampleCard } from "./example-card";

export function AgentExample() {
  return (
    <ExampleCard
      label="Agent"
      className="aspect-auto h-120 sm:col-span-2 lg:col-span-2"
      delay="delay-600"
    >
      <MapComponent center={[-74.006, 40.7128]} zoom={10.5}>
        <MapAgent
          endpoint="/api/map-agent"
          provider="openai"
          defaultPrompt="Fly to Lower Manhattan with a close city view."
          placeholder="Try: Fly to Brooklyn Bridge with a closer zoom"
          position="top-right"
        />
      </MapComponent>
    </ExampleCard>
  );
}
