// HiddenRangeStarted
import * as WebglApi from "@novorender/webgl-api";
import * as MeasureApi from "@novorender/measure-api";
import * as DataJsApi from "@novorender/data-js-api";
import * as GlMatrix from "gl-matrix";

export interface IParams {
    webglApi: typeof WebglApi;
    measureApi: typeof MeasureApi;
    dataJsApi: typeof DataJsApi;
    glMatrix: typeof GlMatrix;
    canvas: HTMLCanvasElement;
    canvas2D: HTMLCanvasElement;
    previewCanvas: HTMLCanvasElement;
}
// HiddenRangeEnded
export async function main({ webglApi, dataJsApi, glMatrix, canvas }: IParams) {
    try {
        // load scene into data api, create webgl api, view and load scene.
        const view = await initView(webglApi, dataJsApi, canvas);

        const scene = view.scene!;

        // run render loop and canvas resizeObserver
        run(view, canvas);

        // Run search and fly to on load
        // We set up a click listener below
        {
            const iterator = scene.search({
                searchPattern: [
                    {
                        property: "GUID",
                        value: ["06yaxhMh5CwutD_i1oN9HO", "06yaxhMh5CwutD_i1oN9HR", "0aq88u2xXFvBCrfVLun4gr", "0aq88u2xXFvBCrfVLun4gH"],
                    },
                ],
                // false/undefined because we don't need full metadata as the object bounds
                // are included in the lightweight HierarcicalObjectReference.
                full: false,
            });

            const searchResult: WebglApi.HierarcicalObjectReference[] = [];
            for await (const object of iterator) {
                searchResult.push(object);
            }

            // Highlight results
            highlightObjects(
                scene,
                searchResult.map((object) => object.id),
            );

            // Calculate bounds of multiple objects and fly to them
            const bounds = getTotalBoundingSphere(searchResult, glMatrix);
            if (bounds) {
                view.camera.controller.zoomTo(bounds);
            }
        }

        // Listen to click events on the canvas
        canvas.onclick = async (event) => {
            // Pick object at clicked position
            const result = await view.lastRenderOutput?.pick(event.offsetX, event.offsetY);

            // If picked position does not have any objects result will be undefined
            if (!result) {
                return;
            }

            // Highlight picked object
            highlightObjects(scene, [result.objectId]);

            // Load metadata as object bounds are not included in the pick result
            const objectData = await scene.getObjectReference(result.objectId).loadMetaData();

            // No calculation needed for single object
            if (objectData.bounds?.sphere) {
                view.camera.controller.zoomTo(objectData.bounds.sphere);
            }
        };
    } catch (e) {
        // Handle however you like
        console.warn(e);
    }
}

function getTotalBoundingSphere(nodes: WebglApi.HierarcicalObjectReference[], glMatrix: typeof GlMatrix): WebglApi.BoundingSphere | undefined {
    const vec3 = glMatrix.vec3;

    const spheres: WebglApi.BoundingSphere[] = [];
    for (const node of nodes) {
        const sphere = node.bounds?.sphere;

        if (sphere) {
            spheres.push(sphere);
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

function highlightObjects(scene: WebglApi.Scene, ids: number[]) {
    // Reset highlights
    scene.objectHighlighter.objectHighlightIndices.fill(0);

    // Set highlight to 1 for the selected objects
    // In this case the highlight is green, set in initView()
    ids.forEach((id) => (scene.objectHighlighter.objectHighlightIndices[id] = 1));

    scene.objectHighlighter.commit();
}
// HiddenRangeStarted
async function initView(webglApi: typeof WebglApi, dataJsAPI: typeof DataJsApi, canvas: HTMLCanvasElement) {
    // Initialize the data API with the Novorender data server service
    const dataApi = dataJsAPI.createAPI({
        serviceUrl: "https://data.novorender.com/api",
    });

    // Load scene metadata
    const sceneData = await dataApi
        // Condos scene ID, but can be changed to any public scene ID
        .loadScene("3b5e65560dc4422da5c7c3f827b6a77c")
        .then((res) => {
            if ("error" in res) {
                throw res;
            } else {
                return res;
            }
        });

    // Destructure relevant properties into variables
    const { url, db, settings, camera: cameraParams } = sceneData;

    // initialize the webgl api
    const api = webglApi.createAPI();

    // Load scene
    const scene = await api.loadScene(url, db);

    // Create a view with the scene's saved settings
    const view = await api.createView(settings, canvas);

    // Set resolution scale to 1
    view.applySettings({ quality: { resolution: { value: 1 } } });

    // Create a camera controller with the saved parameters with turntable as fallback
    const camera = cameraParams ?? ({ kind: "turntable" } as any);
    view.camera.controller = api.createCameraController(camera, canvas);

    // Assign the scene to the view
    view.scene = scene;

    // make object highlights
    const highlightGroup0 = api.createHighlight({ kind: "neutral" });
    const highlightGroup1 = api.createHighlight({
        kind: "color",
        color: [0, 1, 0],
    });
    view.settings.objectHighlights = [highlightGroup0, highlightGroup1];

    return view;
}

async function run(view: WebglApi.View, canvas: HTMLCanvasElement) {
    // Create a bitmap context to display render output
    const ctx = canvas.getContext("bitmaprenderer");

    // Handle canvas resizes
    new ResizeObserver((entries) => {
        for (const entry of entries) {
            canvas.width = entry.contentRect.width;
            canvas.height = entry.contentRect.height;
            view.applySettings({
                display: { width: canvas.width, height: canvas.height },
            });
        }
    }).observe(canvas);

    // render loop
    while (true) {
        // Render frame
        const output = await view.render();
        {
            // Finalize output image
            const image = await output.getImage();
            if (image) {
                // Display the given ImageBitmap in the canvas associated with this rendering context.
                ctx?.transferFromImageBitmap(image);
                // release bitmap data
                image.close();
            }
        }
        (output as any).dispose();
    }
}
// HiddenRangeEnded
