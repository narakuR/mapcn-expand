import { Map as MapComponent, MapControls } from "@/registry/map";

export function MapControlsExample() {
  return (
    <div className="h-[400px] w-full">
      <MapComponent center={[2.3522, 48.8566]} zoom={11}>
        <MapControls
          position="bottom-right"
          showZoom
          showCompass
          showLocate
          showFullscreen
        />
      </MapComponent>
    </div>
  );
}
