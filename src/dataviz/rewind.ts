import { geoArea, geoContains } from "d3-geo";

// Equivalent to the original d3 stream transform, retaining its spherical
// winding rules and its two-dimensional, closed polygon output.
function rewindPolygon(coordinates: number[][][]): number[][][] {
  const polygon = coordinates.map((ring) =>
    ring.slice(0, -1).map(([x, y]): [number, number] => [x, y]),
  );
  for (const [index, ring] of polygon.entries()) {
    ring.push([...ring[0]]);
    const shape = { type: "Polygon", coordinates: [ring] } satisfies import("geojson").Polygon;
    const reverse = index
      ? !geoContains(shape, polygon[0][0])
      : polygon[1]
        ? !geoContains(shape, polygon[1][0])
        : geoArea(shape) > 2 * Math.PI;
    if (reverse) ring.reverse();
    ring.pop();
  }
  return polygon.map((ring) => [...ring, [...ring[0]]]);
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function coordinates(value: unknown): number[][][] {
  if (!Array.isArray(value)) throw new TypeError("Expected polygon coordinates");
  return value.map((ring: unknown) => {
    if (!Array.isArray(ring)) throw new TypeError("Expected a polygon ring");
    return ring.map((point: unknown) => {
      if (!Array.isArray(point) || !point.every((n: unknown) => typeof n === "number")) {
        throw new TypeError("Expected numeric coordinates");
      }
      return point;
    });
  });
}

function rewindGeometry(object: unknown): unknown {
  if (!object) return null;
  if (!record(object)) return object;
  if (object.type === "GeometryCollection" && Array.isArray(object.geometries)) {
    return { ...object, geometries: object.geometries.map(rewindGeometry) };
  }
  if (object.type === "Polygon") {
    return { ...object, coordinates: rewindPolygon(coordinates(object.coordinates)) };
  }
  if (object.type === "MultiPolygon" && Array.isArray(object.coordinates)) {
    return {
      ...object,
      coordinates: object.coordinates.map((polygon: unknown) =>
        rewindPolygon(coordinates(polygon)),
      ),
    };
  }
  return object;
}

function rewindFeature(object: unknown): unknown {
  if (!record(object)) throw new TypeError("Expected a feature");
  return { ...object, geometry: rewindGeometry(object.geometry) };
}

/**
 * Rewinds the winding order of the specified GeoJSON object to be clockwise. It is based on the D3-geo library's winding order conventions.
 *
 * @example
 * ```ts
 * // Rewind a FeatureCollection.
 * const featureCollection = {
 *   type: "FeatureCollection",
 *   features: [
 *     {
 *       type: "Feature",
 *       properties: {},
 *       geometry: {
 *         type: "Polygon",
 *         coordinates: [[[-10, -10], [-10, 10], [10, 10], [10, -10], [-10, -10]]]
 *       }
 *     }
 *   ]
 * };
 * const rewoundFeatureCollection = rewind(featureCollection);
 * ```
 * @example
 * ```ts
 * // Rewind a GeoJSON Feature containing a Polygon geometry.
 * const feature = {
 *   type: "Feature",
 *   properties: { name: "Example Area" },
 *   geometry: {
 *     type: "Polygon",
 *     coordinates: [[[-5, -5], [-5, 5], [5, 5], [5, -5], [-5, -5]]]
 *   }
 * };
 * const rewoundFeature = rewind(feature);
 * console.log(rewoundFeature);
 * ```
 * @param object - A GeoJSON geometry, feature, feature collection, or null.
 *
 * @returns A rewound copy; non-polygon geometries are returned unchanged. Polygon coordinates are two-dimensional.
 * @category Dataviz
 */
export default function rewind<T>(object: T): T;
export default function rewind(object: unknown): unknown {
  if (record(object) && object.type === "FeatureCollection" && Array.isArray(object.features)) {
    return { ...object, features: object.features.map(rewindFeature) };
  }
  if (record(object) && object.type === "Feature") return rewindFeature(object);
  return rewindGeometry(object);
}
