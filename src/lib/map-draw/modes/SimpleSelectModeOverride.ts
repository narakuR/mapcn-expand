import MapboxDraw from "@mapbox/mapbox-gl-draw";

import createSupplementaryPointsForCircle from "../utils/createSupplementaryPointsForCircle";

const createSupplementaryPoints = MapboxDraw.lib.createSupplementaryPoints;
const moveFeatures = MapboxDraw.lib.moveFeatures;
const Constants = MapboxDraw.constants;

type CircleFeatureProperties = GeoJSON.GeoJsonProperties & {
    id?: string;
    isCircle?: boolean;
    user_isCircle?: boolean;
    center?: [number, number];
    active?: string;
};

type SimpleSelectState = {
    dragMoving: boolean;
    dragMoveLocation: { lng: number; lat: number } | null;
};

type SimpleSelectOverride = MapboxDraw.DrawCustomMode &
    Record<string, unknown> & {
        fireActionable?: () => void;
        dragMove?: (
            this: MapboxDraw.DrawCustomModeThis & SimpleSelectOverride,
            state: SimpleSelectState,
            e: MapboxDraw.MapMouseEvent,
        ) => void;
        toDisplayFeatures: (
            this: MapboxDraw.DrawCustomModeThis & SimpleSelectOverride,
            state: SimpleSelectState,
            geojson: GeoJSON.GeoJSON,
            display: (geojson: GeoJSON.GeoJSON) => void,
        ) => void;
    };

const SimpleSelectModeOverride = {
    ...MapboxDraw.modes.simple_select,
} as SimpleSelectOverride;

SimpleSelectModeOverride.dragMove = function (state, e) {
    // Dragging when drag move is enabled
    state.dragMoving = true;
    e.originalEvent.stopPropagation();
    if (!state.dragMoveLocation) return;

    const delta = {
        lng: e.lngLat.lng - state.dragMoveLocation.lng,
        lat: e.lngLat.lat - state.dragMoveLocation.lat,
    };

    const selectedFeatures = this.getSelected() as Array<{
        properties: CircleFeatureProperties;
    }>;
    moveFeatures(this.getSelected(), delta);

    selectedFeatures
        .filter((feature) => feature.properties.isCircle)
        .map((feature) => feature.properties.center)
        .filter((center): center is [number, number] => Array.isArray(center))
        .forEach((center) => {
            center[0] += delta.lng;
            center[1] += delta.lat;
        });

    state.dragMoveLocation = e.lngLat;
};

SimpleSelectModeOverride.toDisplayFeatures = function (
    _state,
    geojson,
    display,
) {
    const feature = geojson as GeoJSON.Feature<GeoJSON.Geometry, CircleFeatureProperties>;
    if (!feature.properties) feature.properties = {};
    feature.properties.active = this.isSelected(String(feature.properties.id))
        ? Constants.activeStates.ACTIVE
        : Constants.activeStates.INACTIVE;
    display(feature);
    this.fireActionable?.();
    if (
        feature.properties.active !== Constants.activeStates.ACTIVE ||
        feature.geometry.type === Constants.geojsonTypes.POINT
    )
        return;
    const supplementaryPoints = feature.properties.user_isCircle
        ? createSupplementaryPointsForCircle(
            feature as GeoJSON.Feature<
                GeoJSON.Polygon,
                { user_isCircle: boolean; id: string; }
            >,
        )
        : createSupplementaryPoints(feature);
    (supplementaryPoints ?? []).forEach(display);
};

export default SimpleSelectModeOverride;
