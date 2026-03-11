import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";
import createSupplementaryPointsForCircle from "../utils/createSupplementaryPointsForCircle";

const createSupplementaryPoints = MapboxDraw.lib.createSupplementaryPoints;
const moveFeatures = MapboxDraw.lib.moveFeatures;
const Constants = MapboxDraw.constants;
const constrainFeatureMovement = MapboxDraw.lib.constrainFeatureMovement;
const turfHelpers = turf.helpers;
const distance = turf.distance;
const circle = turf.circle;

type CircleFeatureProperties = GeoJSON.GeoJsonProperties & {
    id?: string;
    isCircle?: boolean;
    user_isCircle?: boolean;
    center?: [number, number];
    radiusInKm?: number;
    active?: string;
};

type CircleFeature = {
    properties: CircleFeatureProperties;
    geometry: GeoJSON.Polygon;
    incomingCoords: (coords: GeoJSON.Position[][]) => void;
    getCoordinate: (path: string) => GeoJSON.Position;
    updateCoordinate: (path: string, lng: number, lat: number) => void;
};

type DragDelta = { lng: number; lat: number };

type DirectSelectState = {
    featureId: string;
    feature: CircleFeature;
    selectedCoordPaths: string[];
    dragMoveLocation: { lng: number; lat: number } | null;
};

type DirectSelectOverride = MapboxDraw.DrawCustomMode &
    Record<string, unknown> & {
        fireActionable?: (state: DirectSelectState) => void;
        dragFeature?: (
            this: MapboxDraw.DrawCustomModeThis & DirectSelectOverride,
            state: DirectSelectState,
            e: MapboxDraw.MapMouseEvent,
            delta: DragDelta,
        ) => void;
        dragVertex?: (
            this: MapboxDraw.DrawCustomModeThis & DirectSelectOverride,
            state: DirectSelectState,
            e: MapboxDraw.MapMouseEvent,
            delta: DragDelta,
        ) => void;
        toDisplayFeatures: (
            this: MapboxDraw.DrawCustomModeThis & DirectSelectOverride,
            state: DirectSelectState,
            geojson: GeoJSON.GeoJSON,
            push: (geojson: GeoJSON.GeoJSON) => void,
        ) => void;
    };

const DirectModeOverride = {
    ...MapboxDraw.modes.direct_select,
} as DirectSelectOverride;

DirectModeOverride.dragFeature = function (state, e, delta) {
    const selectedFeatures = this.getSelected() as unknown as CircleFeature[];
    moveFeatures(this.getSelected(), delta);
    selectedFeatures
        .filter(
            (feature) => feature.properties.isCircle && !!feature.properties.center,
        )
        .map((feature) => feature.properties.center as [number, number])
        .forEach((center) => {
            center[0] += delta.lng;
            center[1] += delta.lat;
        });
    state.dragMoveLocation = e.lngLat;
};

DirectModeOverride.dragVertex = (state, e, delta) => {
    if (state.feature.properties.isCircle && state.feature.properties.center) {
        const center = state.feature.properties.center;
        const movedVertex: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        const radius = distance(
            turfHelpers.point(center),
            turfHelpers.point(movedVertex),
            { units: "kilometers" },
        );
        const circleFeature = circle(center, radius);
        state.feature.incomingCoords(circleFeature.geometry.coordinates);
        state.feature.properties.radiusInKm = radius;
    } else {
        const selectedCoords = state.selectedCoordPaths.map((coordPath) =>
            state.feature.getCoordinate(coordPath),
        );
        const selectedCoordPoints = selectedCoords.map((coords) => ({
            type: Constants.geojsonTypes.FEATURE,
            properties: {},
            geometry: {
                type: Constants.geojsonTypes.POINT,
                coordinates: coords,
            },
        }));

        const constrainedDelta = constrainFeatureMovement(
            selectedCoordPoints as unknown as MapboxDraw.DrawFeature[],
            delta,
        );
        for (let i = 0; i < selectedCoords.length; i++) {
            const coord = selectedCoords[i];
            state.feature.updateCoordinate(
                state.selectedCoordPaths[i],
                coord[0] + constrainedDelta.lng,
                coord[1] + constrainedDelta.lat,
            );
        }
    }
};

DirectModeOverride.toDisplayFeatures = function (state, geojson, push) {
    const feature = geojson as GeoJSON.Feature<
        GeoJSON.Geometry,
        CircleFeatureProperties
    >;
    const featureId = feature.properties?.id;
    if (featureId && state.featureId === featureId) {
        feature.properties.active = Constants.activeStates.ACTIVE;
        push(feature);
        const supplementaryPoints = feature.properties.user_isCircle
            ? createSupplementaryPointsForCircle(
                feature as GeoJSON.Feature<
                    GeoJSON.Polygon,
                    { user_isCircle: boolean; id: string; }
                >,
            )
            : createSupplementaryPoints(feature, {
                midpoints: true,
                selectedPaths: state.selectedCoordPaths,
            });
        (supplementaryPoints ?? []).forEach(push);
    } else {
        if (!feature.properties) feature.properties = {};
        feature.properties.active = Constants.activeStates.INACTIVE;
        push(feature);
    }
    this.fireActionable?.(state);
};

export default DirectModeOverride;
