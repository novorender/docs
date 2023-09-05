import { createColorSetHighlight, type BoundingSphere, type View } from "@novorender/api";
import type { HierarcicalObjectReference } from "@novorender/webgl-api";
import type { SceneData } from "@novorender/data-js-api";
import { vec3, type ReadonlyVec3 } from "gl-matrix";

export async function main(view: View, sceneData: SceneData) {
    const { db } = sceneData;

    if (db) {
        // Switch the camera controller
        view.switchCameraController("flight");

        const controller = new AbortController();
        const signal = controller.signal;

        // Run search and fly to on load
        // We set up a click listener below
        const iterator = db.search(
            {
                searchPattern: [
                    {
                        property: "GUID",
                        value: ["06yaxhMh5CwutD_i1oN9HO", "06yaxhMh5CwutD_i1oN9HR", "0aq88u2xXFvBCrfVLun4gr", "0aq88u2xXFvBCrfVLun4gH"],
                    },
                ],
                // false/undefined because we don't need full metadata as the object bounds
                // are included in the lightweight HierarcicalObjectReference.
                full: false,
            },
            signal
        );

        const searchResult: HierarcicalObjectReference[] = [];
        for await (const object of iterator) {
            searchResult.push(object);
        }

        // Highlight results
        highlightObjects(
            view,
            searchResult.map((object) => object.id)
        );

        // Calculate bounds of multiple objects and fly to them
        const bounds = getTotalBoundingSphere(searchResult);
        if (bounds) {
            view.activeController.zoomTo(bounds, 2000);
        }

        // Listen to click events on the canvas
        view.canvas.onclick = async (event) => {
            // Pick object at clicked position
            const result = await view.pick(event.offsetX, event.offsetY);
            // If picked position does not have any objects result will be undefined
            if (!result) {
                return;
            }
            // Highlight picked object
            highlightObjects(view, [result.objectId]);
            // Load metadata as object bounds are not included in the pick result
            const objectData = await db?.getObjectMetdata(result.objectId);
            // No calculation needed for single object
            if (objectData.bounds?.sphere) {
                const sphere = { ...objectData.bounds.sphere, center: flip(objectData.bounds.sphere.center) };
                view.activeController.zoomTo(sphere);
            }
        };
    }
}

function highlightObjects(view: View, objectIds: number[]): void {
    const highlight = createColorSetHighlight([0, 1, 0]);
    const renderState = {
        highlights: {
            groups: [{ action: highlight, objectIds }],
        },
    };
    view.modifyRenderState(renderState);
}

function getTotalBoundingSphere(nodes: HierarcicalObjectReference[]): BoundingSphere | undefined {
    const spheres: BoundingSphere[] = [];

    for (const node of nodes) {
        const sphere = node.bounds?.sphere;
        if (sphere) {
            spheres.push({ ...sphere, center: flip(sphere.center) });
        }
    }

    if (spheres.length < 1) {
        return;
    }

    const center = vec3.clone(spheres[0].center);
    let radius = spheres[0].radius;

    for (let sphere of spheres) {
        const delta = vec3.sub(vec3.create(), sphere.center, center);
        const dist = vec3.len(delta) + sphere.radius;
        if (dist > radius) {
            radius = (radius + dist) * 0.5;
            vec3.add(center, center, vec3.scale(delta, delta, 1 - radius / dist));
        }
    }

    return { center, radius };
}

/**
 * Utility function to flip the coordinate system
 */
function flip(v: ReadonlyVec3): ReadonlyVec3 {
    const flipped: [number, number, number] = [v[0], -v[2], v[1]];
    return flipped;
}
