"use client";

import { useEffect, useRef } from "react";
import {
    executeMapCommand,
    parseMapCommand,
    useMapAgentRuntime,
} from "@/lib/map-agent";
import { Map as MapComponent, MapControls, type MapRef } from "@/registry/map";

export function MapAgentExample() {
    const mapRef = useRef<MapRef>(null);
    const runtime = useMapAgentRuntime(mapRef);


    useEffect(() => {
        if (!runtime) return;

        const command = parseMapCommand({
            type: "fly_to",
            center: [121.4737, 31.2304],
            zoom: 12,
            duration: 2000,
        });

        executeMapCommand(runtime, command);
    }, [runtime]);

    return (
        <div className="h-[500px] w-full">
            <MapComponent ref={mapRef}>
                <MapControls position="top-right" showDraw showZoom={false} />
            </MapComponent>
        </div>
    );
}
