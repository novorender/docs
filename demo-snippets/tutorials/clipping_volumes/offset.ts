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
export async function main({ webglApi, canvas }: IParams) {
    // initialize the webgl api
    const api = webglApi.createAPI();

    // create a view
    const view = await api.createView({ background: { color: [0, 0, 0.1, 1] } }, canvas);

    // load a predefined scene into the view, available scenes are cube, oilrig, condos
    const scene = (view.scene = await api.loadScene(webglApi.WellKnownSceneUrls.condos));

    // provide a camera controller, available controller types are static, orbit, flight and turntable
    view.camera.controller = api.createCameraController({ kind: "orbit" }, canvas);

    // get center of scene
    const [cx, cy, cz] = scene.boundingSphere.center;

    // apply clipping volume
    view.applySettings({
        clippingVolume: {
            enabled: true,
            mode: "union",
            planes: [
                [1, 0, 0, -(cx + 5)], // offset plane
            ],
        },
    });

    // create a bitmap context to display render output
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
