import MapboxDraw from "@mapbox/mapbox-gl-draw";
import dragPan from "../utils/drag_pan";

const Constants = MapboxDraw.constants;
const doubleClickZoom = MapboxDraw.lib.doubleClickZoom;

import * as turf from "@turf/turf";

const CircleMode: MapboxDraw.DrawCustomMode = {
  ...MapboxDraw.modes.draw_polygon,
};

CircleMode.onSetup = function () {
  const polygon = this.newFeature({
    type: Constants.geojsonTypes.FEATURE,
    properties: {
      isCircle: true,
      center: [],
    },
    geometry: {
      type: Constants.geojsonTypes.POLYGON,
      coordinates: [[]],
    },
  });

  this.addFeature(polygon);
  this.clearSelectedFeatures();
  doubleClickZoom.disable(this);
  dragPan.disable(this);
  this.updateUIClasses({ mouse: Constants.cursors.ADD });
  this.activateUIButton(Constants.types.POLYGON);
  this.setActionableState({
    trash: true,
    combineFeatures: false,
    uncombineFeatures: false,
  });

  return {
    polygon,
  };
};

CircleMode.onDrag = CircleMode.onMouseMove = (
  state,
  e: MapboxDraw.MapMouseEvent | MapboxDraw.MapTouchEvent,
) => {
  const center = state.polygon.properties.center;
  if (center.length > 0) {
    const distanceInKm = turf.distance(
      turf.point(center),
      turf.point([e.lngLat.lng, e.lngLat.lat]),
      { units: "kilometers" },
    );
    const circleFeature = turf.circle(center, distanceInKm);
    state.polygon.incomingCoords(circleFeature.geometry.coordinates);
    state.polygon.properties.radiusInKm = distanceInKm;
  }
};

CircleMode.onClick = CircleMode.onTap = function (
  state,
  e: MapboxDraw.MapMouseEvent | MapboxDraw.MapTouchEvent,
) {
  const currentCenter = state.polygon.properties.center as [number, number] | [];

  // First click: set the circle center only.
  if (!Array.isArray(currentCenter) || currentCenter.length === 0) {
    state.polygon.properties.center = [e.lngLat.lng, e.lngLat.lat];
    return;
  }

  // Second click: lock radius and finish drawing.
  const distanceInKm = turf.distance(
    turf.point(currentCenter),
    turf.point([e.lngLat.lng, e.lngLat.lat]),
    { units: "kilometers" },
  );
  if (distanceInKm <= 0) return;

  const circleFeature = turf.circle(currentCenter, distanceInKm);
  state.polygon.incomingCoords(circleFeature.geometry.coordinates);
  state.polygon.properties.radiusInKm = distanceInKm;
  dragPan.enable(this);
  this.changeMode(Constants.modes.SIMPLE_SELECT, {
    featureIds: [state.polygon.id],
  });
};

CircleMode.onStop = function (state) {
  doubleClickZoom.enable(this);
  dragPan.enable(this);
  this.updateUIClasses({ mouse: Constants.cursors.NONE });
  this.activateUIButton();

  if (this.getFeature(String(state.polygon.id)) === undefined) return;

  if (state.polygon.isValid()) {
    this.map.fire("draw.create", {
      features: [state.polygon.toGeoJSON()],
    });
  } else {
    this.deleteFeature(String(state.polygon.id), { silent: true });
    this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { silent: true });
  }
};

CircleMode.toDisplayFeatures = (
  state,
  geojson: GeoJSON.Feature<GeoJSON.Geometry, { id: string, active: string }>,
  display: (geojson: GeoJSON.Feature<GeoJSON.Geometry, { id: string, active: string, center?: [number, number] }>) => void,
) => {
  const isActivePolygon = geojson.properties.id === state.polygon.id;
  geojson.properties.active = isActivePolygon
    ? Constants.activeStates.ACTIVE
    : Constants.activeStates.INACTIVE;
  if (isActivePolygon && geojson.geometry.type === Constants.geojsonTypes.POLYGON) {
    if (geojson.geometry.coordinates.length === 0) return;
    const coordinateCount = geojson.geometry.coordinates[0]?.length ?? 0;
    if (coordinateCount < 3) return;
  }

  return display(geojson);
};

export default CircleMode;
