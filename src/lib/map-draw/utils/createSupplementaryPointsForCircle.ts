import MapboxDraw from "@mapbox/mapbox-gl-draw";

const createVertex = MapboxDraw.lib.createVertex;

export default function createSupplementaryPointsForCircle(
    geojson: GeoJSON.Feature<
        GeoJSON.Polygon,
        { user_isCircle: boolean; id: string; user_center?: [number, number] }
    >,
) {
    const { properties, geometry } = geojson;

    if (!properties.user_isCircle) return null;

    const supplementaryPoints = [];
    const vertices = geometry.coordinates[0].slice(0, -1);
    for (
        let index = 0;
        index < vertices.length;
        index += Math.round(vertices.length / 4)
    ) {
        supplementaryPoints.push(
            createVertex(properties.id, vertices[index], `0.${index}`, false),
        );
    }
    // if (properties.user_center) {
    //     supplementaryPoints.push(
    //         createVertex(properties.id, properties.user_center, `0.${5}`, false),
    //     );
    // }
    return supplementaryPoints;
}
