import { Map as MapComponent } from "@/registry/map";

export function BasicMapExample() {
  return (
    <div className="h-[400px] w-full">
      <MapComponent center={[-74.006, 40.7128]} zoom={12} />
    </div>
  );
}
